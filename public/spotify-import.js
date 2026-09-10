// IMPORT SPOTIFY PLAYLIST
// Integrates into Library -> Playlist. Uses the existing MusicfyRik playlist
// storage (createPlaylist/getUserPlaylists/saveUserPlaylists) and the
// existing song search (API.search) for matching. Spotify is used only as a
// metadata source (title/artist/album/duration/cover) — audio playback keeps
// using MusicfyRik's own source, and no Spotify credentials ever appear here.

var SpotifyImport = {
    modalEl: null,
    step: 'url', // url | loading | preview | importing
    data: null,          // { name, description, cover, totalTracks, tracks }
    matches: [],         // [{status, track, match, score}]
    opts: { matchedOnly: true, skipDuplicates: true },
    progress: { label: '', pct: 0 },
    _fakeProgressTimer: null,

    // ---------- helpers ----------
    extractPlaylistId(input) {
        var str = String(input || '').trim();
        if (!str) return '';
        var m = str.match(/^spotify:playlist:([a-zA-Z0-9]+)$/);
        if (m) return m[1];
        try {
            var url = new URL(str);
            if (!/(^|\.)spotify\.com$/i.test(url.hostname)) return '';
            var pm = url.pathname.match(/\/playlist\/([a-zA-Z0-9]+)/);
            if (pm) return pm[1];
        } catch (e) {}
        return '';
    },
    isValidSpotifyPlaylistUrl(input) {
        return !!SpotifyImport.extractPlaylistId(input);
    },
    normalize(s) {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\(.*?\)|\[.*?\]/g, '')
            .replace(/feat\.?.*$/i, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },
    tokenOverlap(a, b) {
        var ta = SpotifyImport.normalize(a).split(' ').filter(Boolean);
        var tb = SpotifyImport.normalize(b).split(' ').filter(Boolean);
        if (!ta.length || !tb.length) return 0;
        var setB = {};
        tb.forEach(function (w) { setB[w] = true; });
        var hit = 0;
        ta.forEach(function (w) { if (setB[w]) hit++; });
        return hit / Math.max(ta.length, tb.length);
    },
    scoreCandidate(track, candidate) {
        var titleScore = SpotifyImport.tokenOverlap(track.title, candidate.title);
        var artistScore = SpotifyImport.tokenOverlap(track.artist, candidate.artist);
        var albumBonus = (track.album && candidate.album && SpotifyImport.tokenOverlap(track.album, candidate.album) > 0.5) ? 0.05 : 0;
        return Math.min(1, titleScore * 0.6 + artistScore * 0.35 + albumBonus);
    },

    async matchOneTrack(track) {
        try {
            var q = track.title + ' ' + track.artist;
            var r = await fetch(API.search + '?query=' + encodeURIComponent(q) + '&type=songs');
            var d = await r.json();
            var songs = (d && d.status && d.result && d.result.songs) ? d.result.songs.slice(0, 6) : [];
            if (!songs.length) return { status: 'notfound', track: track, match: null, score: 0 };

            var best = null, bestScore = -1;
            songs.forEach(function (c) {
                var s = SpotifyImport.scoreCandidate(track, c);
                if (s > bestScore) { bestScore = s; best = c; }
            });

            var status = bestScore >= 0.72 ? 'found' : (bestScore >= 0.38 ? 'similar' : 'notfound');
            if (status === 'notfound') return { status: 'notfound', track: track, match: null, score: bestScore };
            return { status: status, track: track, match: best, score: bestScore };
        } catch (e) {
            return { status: 'notfound', track: track, match: null, score: 0 };
        }
    },

    async runMatchPool(tracks, onProgress) {
        var results = new Array(tracks.length);
        var idx = 0, done = 0;
        var concurrency = 4;

        async function next() {
            var i = idx++;
            if (i >= tracks.length) return;
            results[i] = await SpotifyImport.matchOneTrack(tracks[i]);
            done++;
            if (onProgress) onProgress(done, tracks.length);
            return next();
        }

        var runners = [];
        for (var k = 0; k < Math.min(concurrency, tracks.length); k++) runners.push(next());
        await Promise.all(runners);
        return results;
    },

    // ---------- modal shell ----------
    ensureModal() {
        var modal = gid('spotify-import-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'spotify-import-modal';
            modal.className = 'fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/60';
            modal.onclick = function (e) { if (e.target === modal) SpotifyImport.close(); };
            document.body.appendChild(modal);
        }
        SpotifyImport.modalEl = modal;
        return modal;
    },
    close() {
        if (SpotifyImport._fakeProgressTimer) { clearInterval(SpotifyImport._fakeProgressTimer); SpotifyImport._fakeProgressTimer = null; }
        var modal = gid('spotify-import-modal');
        if (modal) modal.remove();
        SpotifyImport.modalEl = null;
        SpotifyImport.step = 'url';
        SpotifyImport.data = null;
        SpotifyImport.matches = [];
    },
    open() {
        SpotifyImport.step = 'url';
        SpotifyImport.data = null;
        SpotifyImport.matches = [];
        SpotifyImport.opts = { matchedOnly: true, skipDuplicates: true };
        var modal = SpotifyImport.ensureModal();
        modal.innerHTML = SpotifyImport.shell(SpotifyImport.renderUrlStep());
        if (typeof lucide !== 'undefined') lucide.createIcons();
        var input = gid('spotify-url-input');
        if (input) input.focus();
    },
    shell(innerHtml) {
        return '<div class="glass-strong w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 border-t border-white/10 sm:border max-h-[88vh] flex flex-col" style="animation:slideUp 0.25s ease-out forwards;">' +
            '<div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden"></div>' +
            '<div class="flex items-center justify-between mb-4 shrink-0">' +
                '<h3 class="font-bold text-white text-lg flex items-center gap-2"><i data-lucide="music-2" class="w-5 h-5"></i> Import Spotify Playlist</h3>' +
                '<button onclick="SpotifyImport.close()" class="text-white/60 hover:text-white p-1.5 active:scale-90"><i data-lucide="x" class="w-5 h-5"></i></button>' +
            '</div>' +
            '<div class="overflow-y-auto hide-scrollbar flex-1" id="spotify-import-body">' + innerHtml + '</div>' +
        '</div>';
    },
    setBody(html) {
        var body = gid('spotify-import-body');
        if (body) {
            body.innerHTML = html;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    // ---------- step: url entry ----------
    renderUrlStep(errorMsg) {
        return '<p class="text-white/70 text-sm mb-3">Paste your Spotify playlist link</p>' +
            '<input id="spotify-url-input" class="w-full glass-input text-white rounded-xl px-4 py-3 mb-2 focus:outline-none text-sm" placeholder="https://open.spotify.com/playlist/..." autocomplete="off" />' +
            (errorMsg ? '<p class="text-red-400 text-xs mb-3 flex items-start gap-1.5"><i data-lucide="circle-alert" class="w-3.5 h-3.5 mt-0.5 shrink-0"></i><span>' + es(errorMsg) + '</span></p>' : '<div class="mb-3"></div>') +
            '<div class="flex gap-3 mt-2">' +
                '<button onclick="SpotifyImport.close()" class="px-6 py-3 glass glass-hover text-white rounded-full text-sm">Cancel</button>' +
                '<button onclick="SpotifyImport.handleUrlSubmit()" class="flex-1 btn-chrome font-bold py-3 rounded-full text-sm">Import</button>' +
            '</div>';
    },
    handleUrlSubmit() {
        var input = gid('spotify-url-input');
        var raw = input ? input.value.trim() : '';
        if (!raw || !SpotifyImport.isValidSpotifyPlaylistUrl(raw)) {
            SpotifyImport.setBody(SpotifyImport.renderUrlStep('Invalid Spotify playlist URL. Please enter a valid Spotify playlist link.'));
            var i2 = gid('spotify-url-input');
            if (i2) i2.focus();
            return;
        }
        SpotifyImport.startImport(raw);
    },

    // ---------- step: loading / progress ----------
    renderProgressStep(label, pct) {
        pct = Math.max(0, Math.min(100, pct || 0));
        return '<div class="py-6">' +
            '<p class="text-white font-medium text-sm mb-3">' + es(label) + '</p>' +
            '<div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">' +
                '<div class="h-full bg-white rounded-full transition-all duration-200" style="width:' + pct + '%"></div>' +
            '</div>' +
            '<p class="text-white/50 text-xs mt-2 text-right">' + Math.round(pct) + '%</p>' +
        '</div>';
    },
    updateProgress(label, pct) {
        SpotifyImport.progress = { label: label, pct: pct };
        var body = gid('spotify-import-body');
        if (body) body.innerHTML = SpotifyImport.renderProgressStep(label, pct);
    },

    // ---------- step: error ----------
    renderErrorStep(msg) {
        return '<div class="py-6 text-center">' +
            '<div class="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">' +
                '<i data-lucide="circle-alert" class="w-7 h-7 text-red-400"></i>' +
            '</div>' +
            '<p class="text-white/80 text-sm mb-5">' + es(msg) + '</p>' +
            '<button onclick="SpotifyImport.open()" class="px-6 py-3 glass glass-hover text-white rounded-full text-sm">Try Again</button>' +
        '</div>';
    },

    // ---------- orchestration ----------
    async startImport(url) {
        SpotifyImport.step = 'loading';
        SpotifyImport.setBody(SpotifyImport.renderProgressStep('Reading Spotify Playlist...', 8));

        // Gentle fake progress while the single metadata request is in flight,
        // so the bar doesn't sit frozen on a slow connection.
        var fakePct = 8;
        SpotifyImport._fakeProgressTimer = setInterval(function () {
            fakePct = Math.min(fakePct + Math.random() * 10, 85);
            SpotifyImport.updateProgress('Reading Spotify Playlist...', fakePct);
        }, 350);

        var result;
        try {
            var r = await fetch(API.spotify + '?url=' + encodeURIComponent(url));
            result = await r.json();
        } catch (e) {
            clearInterval(SpotifyImport._fakeProgressTimer); SpotifyImport._fakeProgressTimer = null;
            SpotifyImport.setBody(SpotifyImport.renderErrorStep('Network error. Please check your connection and try again.'));
            return;
        }
        clearInterval(SpotifyImport._fakeProgressTimer); SpotifyImport._fakeProgressTimer = null;

        if (!result || !result.status) {
            var msg = (result && result.message) ? result.message : 'Spotify API error. Please try again later.';
            SpotifyImport.setBody(SpotifyImport.renderErrorStep(msg));
            return;
        }

        SpotifyImport.data = result.result;
        SpotifyImport.updateProgress('Reading Spotify Playlist...', 100);

        // Matching phase
        var tracks = SpotifyImport.data.tracks || [];
        SpotifyImport.updateProgress('Matching songs...', 0);
        SpotifyImport.matches = await SpotifyImport.runMatchPool(tracks, function (done, total) {
            SpotifyImport.updateProgress('Matching songs...', (done / total) * 100);
        });

        if (!SpotifyImport.matches.some(function (m) { return m.status !== 'notfound'; })) {
            SpotifyImport.setBody(SpotifyImport.renderErrorStep('No matching songs were found in MusicfyRik.'));
            return;
        }

        SpotifyImport.step = 'preview';
        SpotifyImport.renderPreview();
    },

    matchedCount() {
        return SpotifyImport.matches.filter(function (m) { return m.status === 'found' || m.status === 'similar'; }).length;
    },

    statusIcon(status) {
        if (status === 'found') return '<i data-lucide="check" class="w-4 h-4 text-emerald-400 shrink-0"></i>';
        if (status === 'similar') return '<i data-lucide="triangle-alert" class="w-4 h-4 text-amber-400 shrink-0"></i>';
        return '<i data-lucide="x" class="w-4 h-4 text-red-400 shrink-0"></i>';
    },

    renderPreview() {
        var d = SpotifyImport.data;
        var total = d.tracks.length;
        var matched = SpotifyImport.matchedCount();

        var rows = SpotifyImport.matches.map(function (m) {
            var title = m.track.title, artist = m.track.artist;
            return '<div class="flex items-center gap-2.5 py-2 border-b border-white/5 last:border-0">' +
                SpotifyImport.statusIcon(m.status) +
                '<div class="min-w-0 flex-1">' +
                    '<p class="text-white text-sm truncate">' + es(title) + '</p>' +
                    '<p class="text-white/50 text-xs truncate">' + es(artist) + '</p>' +
                '</div>' +
            '</div>';
        }).join('');

        var html = '<div class="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">' +
                '<img src="' + (d.cover || FI) + '" class="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0" onerror="this.src=\'' + FI + '\'" />' +
                '<div class="min-w-0">' +
                    '<h4 class="text-white font-bold truncate">' + es(d.name) + '</h4>' +
                    '<p class="text-white/60 text-xs">' + total + ' tracks &middot; ' + matched + ' songs matched</p>' +
                '</div>' +
            '</div>' +
            '<div class="max-h-[30vh] overflow-y-auto hide-scrollbar mb-4 px-0.5">' + rows + '</div>' +
            '<div class="space-y-2.5 mb-4 pt-2 border-t border-white/10">' +
                '<label class="flex items-center justify-between gap-3 cursor-pointer py-1">' +
                    '<span class="text-white text-sm">Import matched songs only</span>' +
                    '<input type="checkbox" id="spotify-opt-matched-only" ' + (SpotifyImport.opts.matchedOnly ? 'checked' : '') + ' onchange="SpotifyImport.opts.matchedOnly=this.checked;SpotifyImport.renderPreview()" class="w-5 h-5 accent-white" />' +
                '</label>' +
                '<label class="flex items-center justify-between gap-3 cursor-pointer py-1">' +
                    '<span class="text-white text-sm">Skip duplicates</span>' +
                    '<input type="checkbox" id="spotify-opt-skip-dupes" ' + (SpotifyImport.opts.skipDuplicates ? 'checked' : '') + ' onchange="SpotifyImport.opts.skipDuplicates=this.checked" class="w-5 h-5 accent-white" />' +
                '</label>' +
            '</div>' +
            '<div class="flex gap-3">' +
                '<button onclick="SpotifyImport.close()" class="px-6 py-3 glass glass-hover text-white rounded-full text-sm">Cancel</button>' +
                '<button onclick="SpotifyImport.confirmImport()" class="flex-1 btn-chrome font-bold py-3 rounded-full text-sm">Import ' + (SpotifyImport.opts.matchedOnly ? matched : total) + ' Songs</button>' +
            '</div>';

        SpotifyImport.setBody(html);
    },

    confirmImport() {
        var d = SpotifyImport.data;
        var toImport = SpotifyImport.matches.filter(function (m) {
            if (SpotifyImport.opts.matchedOnly) return m.status === 'found' || m.status === 'similar';
            return true; // still needs a real match to add — 'notfound' tracks have nothing to add
        }).filter(function (m) { return m.match; });

        if (!toImport.length) {
            showToast('No matching songs were found in MusicfyRik.');
            return;
        }

        var newId = createPlaylist(d.name, d.cover || '');
        var pls = getUserPlaylists();
        var pl = pls.find(function (p) { return p.id === newId; });
        if (!pl) { SpotifyImport.close(); return; }

        var added = 0, skippedDupes = 0, skippedFull = 0;
        toImport.forEach(function (m) {
            if (pl.songs.length >= 100) { skippedFull++; return; }
            var c = m.match;
            var videoId = c.videoId;
            if (SpotifyImport.opts.skipDuplicates && pl.songs.some(function (s) { return s.videoId === videoId; })) {
                skippedDupes++;
                return;
            }
            pl.songs.push({
                id: c.id || videoId,
                videoId: videoId,
                title: c.title,
                artist: c.artist,
                cover: c.thumbnail || c.cover || d.cover || '',
                artistId: c.artistId || '',
                ytUrl: c.url || ('https://music.youtube.com/watch?v=' + videoId)
            });
            added++;
        });

        if (!pl.image && pl.songs.length > 0) pl.image = pl.songs[0].cover;
        saveUserPlaylists(pls);

        SpotifyImport.close();

        var toastMsg = added + ' songs imported into "' + d.name + '"';
        if (skippedFull) toastMsg += ' (playlist limit reached, ' + skippedFull + ' skipped)';
        showToast(toastMsg);

        if (typeof Library !== 'undefined') {
            if (S.at === 'library') Library.render();
            Library.open(newId);
        }
    }
};
