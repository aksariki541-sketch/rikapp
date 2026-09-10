var Home = {
    activeCategory: null,
    loadingCategory: false,
    categories: [
        { name: 'Semua' },
        { name: 'Developer Profile', icon: 'code' },
        { name: 'Chill', icon: 'coffee' },
        { name: 'Focus', icon: 'brain' },
        { name: 'Commute', icon: 'car' },
        { name: 'Gaming', icon: 'gamepad-2' },
        { name: 'Energize', icon: 'zap' },
        { name: 'Party', icon: 'party-popper' },
        { name: 'Feel good', icon: 'smile' },
        { name: 'Romance', icon: 'heart' },
        { name: 'Workout', icon: 'dumbbell' },
        { name: 'Sleep', icon: 'moon' },
        { name: 'Sad', icon: 'cloud-rain' },
        { name: 'Happy', icon: 'sun' },
        { name: 'Nostalgia', icon: 'disc' },
        { name: 'Acoustic', icon: 'guitar' },
        { name: 'Pop', icon: 'music' },
        { name: 'Rock', icon: 'flame' }
    ],

    render() {
        var chipsHtml = Home.categories.map(function(c) {
            var isActive = (Home.activeCategory === c.name) || (!Home.activeCategory && c.name === 'Semua');
            var btnStyle = isActive
                ? 'bg-white text-black font-extrabold shadow-lg shadow-white/20 border border-white scale-105'
                : 'bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/60 border border-white/15 font-medium';
            return '<button onclick="Home.selectCategory(\'' + c.name + '\')" class="home-chip-btn px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all duration-300 ease-out flex items-center gap-1.5 cursor-pointer shrink-0 ' + btnStyle + '">' +
                (c.icon ? '<i data-lucide="' + c.icon + '" class="w-3.5 h-3.5"></i>' : '') +
                '<span>' + es(c.name) + '</span>' +
            '</button>';
        }).join('');

        gid('view-home').innerHTML = `
        <div class="pt-8 pb-3.5 px-4 sticky top-0 z-30 border-b border-white/10 shadow-2xl transition-all relative overflow-hidden" style="background: linear-gradient(180deg, rgba(232, 120, 159, 0.12) 0%, rgba(13, 13, 12, 0.45) 55%, rgba(13, 13, 12, 0.92) 100%); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
            <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 15% -20%, rgba(var(--accent-rgb),0.28), transparent 55%);"></div>
            <div class="flex justify-between items-center mb-3 relative z-10">
                <div>
                    <span class="block text-[10px] font-bold tracking-[0.2em] text-white/45 uppercase mb-0.5">Modern Personal Music Platform</span>
                    <h1 class="text-3xl chrome-text tracking-tight">MusifyRik</h1>
                </div>
                <div class="flex items-center gap-2.5">
                    <button onclick="App.switch('search')" class="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-all" title="Cari" style="box-shadow: 0 6px 18px rgba(0,0,0,0.35);">
                        <i data-lucide="search" class="w-5 h-5"></i>
                    </button>
                    <button onclick="App.switch('dev')" class="w-10 h-10 rounded-2xl flex items-center justify-center text-[#0b0a09] active:scale-95 transition-all" title="Profil" style="background:linear-gradient(135deg,var(--accent),var(--accent-2)); box-shadow: 0 6px 18px rgba(var(--accent-rgb),0.4);">
                        <i data-lucide="user" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
            <!-- Category Slider (Kategori Geser) -->
            <div id="home-category-bar" class="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 py-1 scroll-smooth">
                ${chipsHtml}
            </div>
        </div>
        <div class="px-4 mt-4" id="home-main-content">
            <div id="home-default-view">
                <div class="space-y-6">
                    <div id="home-recent-section" style="display:none;">
                        <h2 class="text-lg font-bold text-white mb-3 tracking-wide flex items-center gap-2.5">
                            <i data-lucide="history" class="w-5 h-5 text-emerald-400"></i>
                            <span>Terakhir Diputar</span>
                        </h2>
                        <div id="home-recent" class="flex gap-3 overflow-x-auto hide-scrollbar pb-2"></div>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-white mb-3 tracking-wide flex items-center gap-2.5">
                            <i data-lucide="zap" class="w-5 h-5 text-amber-400 fill-amber-400/20"></i>
                            <span>Quick Picks</span>
                        </h2>
                        <div id="home-grid" class="grid grid-cols-2 md:grid-cols-4 gap-3"></div>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-white mb-3 tracking-wide flex items-center gap-2.5">
                            <i data-lucide="disc" class="w-5 h-5 text-purple-400"></i>
                            <span>Popular Playlists</span>
                        </h2>
                        <div id="home-scroll" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-white mb-3 tracking-wide flex items-center gap-2.5">
                            <i data-lucide="users" class="w-5 h-5 text-rose-400"></i>
                            <span>Top Artists</span>
                        </h2>
                        <div id="home-artists" class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"></div>
                    </div>
                </div>
            </div>
            <div id="home-category-view" style="display:none;"></div>
        </div>`;

        lucide.createIcons();

        if (Home.activeCategory && Home.activeCategory !== 'Semua') {
            if (Home.activeCategory === 'Developer Profile') {
                Home.renderDeveloperProfileView();
            } else {
                Home.displayCategoryView();
            }
        } else {
            var defView = gid('home-default-view'), catView = gid('home-category-view');
            if (defView) defView.style.display = 'block';
            if (catView) catView.style.display = 'none';
            if (S.ht && S.ht.length > 0) {
                Home.show();
            } else {
                Home.showSkeleton();
                Home.fetch();
            }
        }
    },

    selectCategory(catName) {
        if (Home.activeCategory === catName && catName !== 'Semua') {
            catName = 'Semua';
        }

        if (!catName || catName === 'Semua') {
            Home.activeCategory = null;
            var bar = gid('home-category-bar');
            if (bar) {
                bar.querySelectorAll('.home-chip-btn').forEach(function(btn, i) {
                    var c = Home.categories[i];
                    var isAct = (c && c.name === 'Semua');
                    btn.className = 'home-chip-btn px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 ' + (isAct
                        ? 'bg-white text-black font-extrabold shadow-lg shadow-white/20 border border-white scale-105'
                        : 'bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/60 border border-white/15 font-medium');
                });
            }
            var defView = gid('home-default-view'), catView = gid('home-category-view');
            if (defView) defView.style.display = 'block';
            if (catView) catView.style.display = 'none';
            if (!S.ht || S.ht.length === 0) Home.fetch();
            else Home.show();
            return;
        }

        Home.activeCategory = catName;

        var bar = gid('home-category-bar');
        if (bar) {
            bar.querySelectorAll('.home-chip-btn').forEach(function(btn, i) {
                var c = Home.categories[i];
                var isAct = (c && c.name === catName);
                btn.className = 'home-chip-btn px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0 ' + (isAct
                    ? 'bg-white text-black font-extrabold shadow-lg shadow-white/20 border border-white scale-105'
                    : 'bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/60 border border-white/15 font-medium');
            });
        }

        Home.fetchCategoryData(catName);
    },

    async fetchCategoryData(catName) {
        var defView = gid('home-default-view'), catView = gid('home-category-view');
        if (defView) defView.style.display = 'none';
        if (catView) {
            catView.style.display = 'block';
            catView.innerHTML = `
            <div class="mb-4 flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/10 animate-pulse">
                <div class="flex items-center gap-2">
                    <span class="text-xs text-[#9a9490]">Kategori:</span>
                    <span class="font-bold text-sm text-white">${es(catName)}</span>
                </div>
                <button onclick="Home.selectCategory('Semua')" class="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#9a9490] hover:text-white transition-all flex items-center gap-1">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i> Reset
                </button>
            </div>
            <div class="text-center py-12">
                <div class="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p class="text-xs text-[#9a9490] animate-pulse">Memuat musik ${es(catName)}...</p>
            </div>`;
            lucide.createIcons();
        }

        if (catName === 'Developer Profile') {
            // ==== MENGAMBIL LAGU DARI RAIM LAODE, TULUS & HINDIA ====
            // Ambil lagu dari ketiga artis lalu gabungkan
            try {
                var querySongs = 'Raim Laode Tulus Hindia';
                var r = await fetch(API.search + '?query=' + encodeURIComponent(querySongs) + '&type=songs');
                var d = await r.json();
                if (d.status && d.result) {
                    S.hc = d.result.songs ? d.result.songs.map(function(s) {
                        return {
                            id: s.videoId,
                            videoId: s.videoId,
                            title: cn(s.title),
                            artist: cn(s.artist),
                            artistId: s.artistId || '',
                            cover: toHDCover(s.thumbnail, s.videoId),
                            ytUrl: s.url
                        };
                    }) : [];
                    S.hcp = [].concat(d.result.albums || []).concat(d.result.playlists || []);
                } else { S.hc = []; S.hcp = []; }
            } catch(e) { S.hc = []; S.hcp = []; }

            // Ambil playlist/album Raim Laode, Tulus & Hindia secara terpisah agar lebih lengkap
            try {
                var rp = await fetch(API.search + '?query=' + encodeURIComponent('Raim Laode Tulus Hindia Album Playlist') + '&type=playlists');
                var dp = await rp.json();
                if (dp.status && dp.result) {
                    S.hcp = S.hcp.concat(dp.result.playlists || []).concat(dp.result.albums || []);
                }
            } catch(ep){}

            S.favArtistsDev = [
                { name: 'Raim Laode', id: 'UC0BletW9py84h0beCD26WHQ', cover: 'https://i.scdn.co/image/ab6761610000e5eb1e345853b015b6d510006767' },
                { name: 'Tulus', id: 'UCe8EVUo1E9vLrj0Bm8O5CzQ', cover: 'https://i.scdn.co/image/ab6761610000e5eb806a16d223847e335e2e8e3c' },
                { name: 'Hindia', id: 'UCzhVLh7xVyH3MpqO_KY6SYg', cover: 'https://yt3.googleusercontent.com/8ImMAMQSD4FA6-gdqCZWSFaB-drHvkdfiFcFAk7Mcyy56ctfWD-Xxno-CHfGC4L6Ql8aR61XT0vX0F4b=w800-h800-l90-rj' }
            ];

            try {
                var ra = await fetch(API.search + '?query=' + encodeURIComponent('Raim Laode Tulus Hindia') + '&type=artists');
                var da = await ra.json();
                if (da.status && da.result && da.result.artists && da.result.artists.length > 0) {
                    da.result.artists.forEach(function(art) {
                        var artName = art.title || art.name || '';
                        var matched = S.favArtistsDev.find(function(f) { return f.name.toLowerCase() === artName.toLowerCase(); });
                        if (matched) {
                            if (art.cover) matched.cover = art.cover;
                            if (art.id) matched.id = art.id;
                        }
                    });
                }
            } catch(ea){}

            Home.renderDeveloperProfileView();
            return;
        }

        var query = catName + ' Music';
        if (catName === 'Acoustic') query = 'Acoustic Songs Hits';
        else if (catName === 'Chill') query = 'Chill Vibes Lofi Songs';
        else if (catName === 'Focus') query = 'Focus Deep Work Music';
        else if (catName === 'Commute') query = 'Driving Roadtrip Music';
        else if (catName === 'Gaming') query = 'Gaming EDM Hype Songs';
        else if (catName === 'Energize') query = 'Energetic Workout Beats';
        else if (catName === 'Party') query = 'Party Dance Hits';
        else if (catName === 'Feel good') query = 'Feel Good Happy Songs';
        else if (catName === 'Romance') query = 'Romantic Love Songs';
        else if (catName === 'Workout') query = 'Gym Workout Motivation Music';
        else if (catName === 'Sleep') query = 'Sleeping Calming Relaxation Music';
        else if (catName === 'Sad') query = 'Sad Melancholic Songs';
        else if (catName === 'Happy') query = 'Upbeat Happy Songs';
        else if (catName === 'Nostalgia') query = '2000s Hits Nostalgia Songs';

        try {
            var r = await fetch(API.search + '?query=' + encodeURIComponent(query) + '&type=all');
            var d = await r.json();
            if (d.status) {
                S.hc = d.result.songs ? d.result.songs.map(function(s) {
                    return {
                        id: s.videoId,
                        videoId: s.videoId,
                        title: cn(s.title),
                        artist: cn(s.artist),
                        artistId: s.artistId || '',
                        cover: toHDCover(s.thumbnail, s.videoId),
                        ytUrl: s.url
                    };
                }) : [];
                S.hcp = [].concat(d.result.playlists || []).concat(d.result.albums || []);
                S.hca = d.result.artists || [];
            }
        } catch(e) { S.hc = []; S.hcp = []; S.hca = []; }

        Home.displayCategoryView();
    },

    renderDeveloperProfileView() {
        var defView = gid('home-default-view'), catView = gid('home-category-view');
        if (defView) defView.style.display = 'none';
        if (catView) catView.style.display = 'block';
        if (!catView) return;

        var songsHtml = '';
        if (S.hc && S.hc.length > 0) {
            songsHtml = S.hc.map(function(t, i) {
                var isCur = S.ct && (
                    S.ct.id === t.id ||
                    S.ct.videoId === t.id ||
                    (S.ct.id && t.videoId && S.ct.id === t.videoId) ||
                    (S.ct.videoId && t.id && S.ct.videoId === t.id) ||
                    (S.ct.title === t.title && S.ct.artist === t.artist)
                );
                var isPlay = isCur && S.ip;
                var isLoad = isCur && S.il;

                var playIconHtml = '';
                if (isLoad) {
                    playIconHtml = '<div class="w-6 h-6 rounded-full btn-chrome flex items-center justify-center shrink-0 ml-auto"><div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>';
                } else if (isPlay) {
                    playIconHtml = '<div class="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto shadow-md shadow-white/30 ring-1 ring-white scale-105"><div class="flex items-end justify-center gap-[2px] w-3 h-3 pb-0.5"><span class="w-[2px] bg-black rounded-full animate-eq-1"></span><span class="w-[2px] bg-black rounded-full animate-eq-2"></span><span class="w-[2px] bg-black rounded-full animate-eq-3"></span></div></div>';
                } else if (isCur) {
                    playIconHtml = '<div class="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto border border-white"><i data-lucide="pause" class="w-3 h-3 fill-current"></i></div>';
                } else {
                    playIconHtml = '<div class="w-6 h-6 rounded-full bg-white/5 group-hover:bg-white/20 flex items-center justify-center shrink-0 ml-auto text-white transition-all"><i data-lucide="play" class="w-3 h-3 fill-current ml-0.5"></i></div>';
                }

                return '<div onclick="PK(\'homecat\','+i+')" class="snap-start home-cat-card group '+ (isPlay ? 'bg-[#433e3b] border border-white/40 shadow-xl' : (isCur ? 'bg-[#3a332f] border border-white/30' : 'bg-[#2a2521] border border-white/10 hover:bg-[#363230]')) +' rounded-2xl flex items-center gap-3 p-2.5 cursor-pointer active:scale-95 transition-all w-full shadow-lg shadow-black/20">'+
                    '<img src="'+t.cover+'" class="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 border border-white/10" referrerPolicy="no-referrer" onerror="this.src=\''+FI+'\'" />'+
                    '<div class="truncate flex-1 min-w-0"><h3 class="font-semibold text-xs sm:text-sm truncate '+(isCur?'text-white font-black':'text-white/90')+'">'+es(t.title)+'</h3><p class="text-white/60 text-[11px] truncate mt-0.5">'+es(t.artist)+'</p></div>'+
                    '<div class="home-cat-icon ml-auto shrink-0">'+playIconHtml+'</div>'+
                '</div>';
            }).join('');
        } else {
            songsHtml = '<p class="text-white/60 text-sm py-4 col-span-2">Memuat lagu Raim Laode, Tulus & Hindia...</p>';
        }

        var plistHtml = '';
        if (S.hcp && S.hcp.length > 0) {
            plistHtml = S.hcp.map(function(p, i) {
                return '<div onclick="Album.open(\''+p.id+'\', \''+(p.cover||FI)+'\')" class="flex-shrink-0 w-36 cursor-pointer active:scale-95 group p-2.5 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl hover:bg-[#363230] transition-all flex flex-col"><div class="w-full aspect-square mb-2 relative rounded-xl overflow-hidden shadow-md"><img src="'+(p.cover||FI)+'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" onerror="this.src=\''+FI+'\'" /></div><h3 class="font-semibold text-xs truncate text-white px-0.5">'+es(p.title)+'</h3><p class="text-white/60 text-[10px] truncate mt-0.5 px-0.5">'+es(p.artist)+'</p></div>';
            }).join('');
        }

        catView.innerHTML = `
        <div class="space-y-6 pb-6">
            <div class="glass-strong rounded-3xl p-5 border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent relative overflow-hidden ">
                <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left relative z-10">
                    <div class="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20  shrink-0 glass">
                        <img src="/logo.png" class="w-full h-full object-cover" onerror="this.src='${FI}'" />
                    </div>
                    <div class="flex-1">
                        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
                            <i data-lucide="code" class="w-3 h-3"></i> Developer Profile
                        </div>
                        <h2 class="text-2xl font-black text-white">Riki</h2>
                        <p class="text-xs text-[#9a9490] mt-1 leading-relaxed">Pengembang & Pembuat MusifyRik. Selamat menikmati streaming musik favorit tanpa gangguan!</p>
                        <div class="flex flex-wrap items-center gap-2 mt-3.5 justify-center sm:justify-start">
                            <a href="https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I" target="_blank" rel="noopener noreferrer" class="btn-chrome px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all" style="color:#25d366;border-color:rgba(37,211,102,0.4);">
                                <i data-lucide="message-square" class="w-3.5 h-3.5"></i> Channel WA
                            </a>
                            <button onclick="App.switch('dev')" class="glass hover:bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-medium text-white hover:text-white flex items-center gap-1.5 active:scale-95 transition-all">
                                <i data-lucide="info" class="w-3.5 h-3.5"></i> Detail Info
                            </button>
                            <button onclick="Home.selectCategory('Semua')" class="glass hover:bg-white/10 px-3 py-1.5 rounded-full text-xs text-[#9a9490] hover:text-white flex items-center gap-1">
                                <i data-lucide="x" class="w-3.5 h-3.5"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div class="mb-3">
                    <h2 class="text-base font-bold flex items-center gap-2 text-white">
                        <i data-lucide="heart" class="w-4 h-4 text-red-500 fill-current"></i>
                        <span>Lagu Yang Disukai</span>
                    </h2>
                    <p class="text-xs text-white/60 ml-6 mt-0.5">(Lagu dari Raim Laode, Tulus & Hindia)</p>
                </div>
                <div class="grid grid-rows-4 grid-flow-col auto-cols-[calc(50vw-24px)] sm:auto-cols-[300px] gap-2.5 overflow-x-auto hide-scrollbar pb-3 snap-x">
                    ${songsHtml}
                </div>
            </div>

            ${plistHtml ? `<div>
                <div class="mb-3">
                    <h2 class="text-base font-bold flex items-center gap-2 text-white">
                        <i data-lucide="disc" class="w-4 h-4 text-purple-400"></i>
                        <span>Playlist Yang Disukai</span>
                    </h2>
                    <p class="text-xs text-white/60 ml-6 mt-0.5">Album Raim Laode, Tulus & Hindia</p>
                </div>
                <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-3">${plistHtml}</div>
            </div>` : ''}
        </div>`;

        lucide.createIcons();
        Home.renderActive();
        if (typeof hideSplashScreen === 'function') {
            setTimeout(hideSplashScreen, 100);
        }
    },

    displayCategoryView() {
        var defView = gid('home-default-view'), catView = gid('home-category-view');
        if (defView) defView.style.display = 'none';
        if (catView) catView.style.display = 'block';
        if (!catView) return;

        var catName = Home.activeCategory || 'Kategori';

        var songsHtml = '';
        if (S.hc && S.hc.length > 0) {
            songsHtml = S.hc.map(function(t, i) {
                var isCur = S.ct && (
                    S.ct.id === t.id ||
                    S.ct.videoId === t.id ||
                    (S.ct.id && t.videoId && S.ct.id === t.videoId) ||
                    (S.ct.videoId && t.id && S.ct.videoId === t.id) ||
                    (S.ct.title === t.title && S.ct.artist === t.artist)
                );
                var isPlay = isCur && S.ip;
                var isLoad = isCur && S.il;

                var playIconHtml = '';
                if (isLoad) {
                    playIconHtml = '<div class="w-7 h-7 rounded-full btn-chrome flex items-center justify-center shrink-0 ml-auto"><div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>';
                } else if (isPlay) {
                    playIconHtml = '<div class="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto  shadow-white/30 ring-2 ring-white scale-105"><div class="flex items-end justify-center gap-[2px] w-3.5 h-3.5 pb-0.5"><span class="w-[2px] bg-black rounded-full animate-eq-1"></span><span class="w-[2px] bg-black rounded-full animate-eq-2"></span><span class="w-[2px] bg-black rounded-full animate-eq-3"></span></div></div>';
                } else if (isCur) {
                    playIconHtml = '<div class="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto border border-white"><i data-lucide="pause" class="w-3.5 h-3.5 fill-current"></i></div>';
                } else {
                    playIconHtml = '<div class="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/20 flex items-center justify-center shrink-0 ml-auto text-white transition-all"><i data-lucide="play" class="w-3.5 h-3.5 fill-current ml-0.5"></i></div>';
                }

                return '<div onclick="PK(\'homecat\','+i+')" class="home-cat-card group '+ (isPlay ? 'bg-[#433e3b] border border-white/40 shadow-xl' : (isCur ? 'bg-[#3a332f] border border-white/30' : 'bg-[#2a2521] border border-white/10 hover:bg-[#363230]')) +' rounded-2xl flex items-center gap-3 p-2.5 cursor-pointer active:scale-95 transition-all animate-card-up shadow-lg shadow-black/20" style="animation-delay:'+Math.min(i*30, 450)+'ms">'+
                    '<img src="'+t.cover+'" class="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 border border-white/10" onerror="this.src=\''+FI+'\'" />'+
                    '<div class="truncate flex-1 min-w-0"><h3 class="font-semibold text-sm truncate '+(isCur?'text-white font-black':'text-white/90')+'">'+es(t.title)+'</h3><p class="text-white/60 text-xs truncate mt-0.5">'+es(t.artist)+'</p></div>'+
                    '<div class="home-cat-icon ml-auto">'+playIconHtml+'</div>'+
                '</div>';
            }).join('');
        } else {
            songsHtml = '<p class="text-center text-white/70 text-sm py-8 col-span-2">Tidak ada lagu ditemukan untuk kategori ini</p>';
        }

        var plistHtml = '';
        if (S.hcp && S.hcp.length > 0) {
            plistHtml = S.hcp.slice(0, 10).map(function(p, i) {
                return '<div onclick="Album.open(\''+p.id+'\', \''+(p.cover||FI)+'\')" class="flex-shrink-0 w-36 cursor-pointer active:scale-95 group p-2.5 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl hover:bg-[#363230] transition-all flex flex-col animate-card-left" style="animation-delay:'+Math.min(i*40, 400)+'ms"><div class="w-full aspect-square mb-2 relative rounded-xl overflow-hidden shadow-md"><img src="'+(p.cover||FI)+'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src=\''+FI+'\'" /></div><h3 class="font-semibold text-xs truncate text-white px-0.5">'+es(p.title)+'</h3><p class="text-white/60 text-[10px] truncate mt-0.5 px-0.5">'+es(p.artist)+'</p></div>';
            }).join('');
        }

        var artistsHtml = '';
        if (S.hca && S.hca.length > 0) {
            artistsHtml = S.hca.slice(0, 8).map(function(p, i) {
                return '<div onclick="Artist.open(\''+p.id+'\', \''+esJs(p.name||p.title)+'\')" class="flex-shrink-0 w-32 cursor-pointer active:scale-95 group p-2.5 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl hover:bg-[#363230] transition-all flex flex-col items-center animate-card-left" style="animation-delay:'+Math.min(i*40, 400)+'ms"><div class="w-24 h-24 mb-2 relative rounded-full overflow-hidden shadow-md border-2 border-white/10 group-hover:scale-105 transition-transform duration-300"><img src="'+(p.cover||FI)+'" class="w-full h-full object-cover" onerror="this.src=\''+FI+'\'" /></div><h3 class="font-semibold text-center text-xs truncate text-white w-full px-0.5">'+es(p.name||p.title)+'</h3><p class="text-white/60 text-[10px] uppercase tracking-wider font-semibold mt-0.5">Artist</p></div>';
            }).join('');
        }

        catView.innerHTML = `
        <div class="space-y-6 pb-6 animate-card-up">
            <div class="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div class="flex items-center gap-2">
                    <span class="text-xs text-[#9a9490]">Kategori:</span>
                    <span class="font-bold text-sm text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">${es(catName)}</span>
                </div>
                <button onclick="Home.selectCategory('Semua')" class="text-xs px-3.5 py-1.5 rounded-full btn-chrome text-white hover:text-white transition-all flex items-center gap-1 active:scale-95">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i> Reset / Semua
                </button>
            </div>

            <div>
                <h2 class="text-base font-bold mb-3 flex items-center gap-2 text-white">
                    <i data-lucide="music" class="w-4 h-4 text-emerald-400"></i>
                    <span>Lagu Populer - ${es(catName)}</span>
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${songsHtml}</div>
            </div>

            ${plistHtml ? `<div>
                <h2 class="text-base font-bold mb-3 flex items-center gap-2 text-white">
                    <i data-lucide="disc" class="w-4 h-4 text-purple-400"></i>
                    <span>Playlist & Album ${es(catName)}</span>
                </h2>
                <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-3">${plistHtml}</div>
            </div>` : ''}

            ${artistsHtml ? `<div>
                <h2 class="text-base font-bold mb-3 flex items-center gap-2 text-white">
                    <i data-lucide="users" class="w-4 h-4 text-rose-400"></i>
                    <span>Artis Related</span>
                </h2>
                <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-3">${artistsHtml}</div>
            </div>` : ''}
        </div>`;

        lucide.createIcons();
        Home.renderActive();
        if (typeof hideSplashScreen === 'function') {
            setTimeout(hideSplashScreen, 100);
        }
    },

    showSkeleton() {
        var g = gid('home-grid'), s = gid('home-scroll'), a = gid('home-artists');
        if (g) {
            g.innerHTML = Array(6).fill(0).map(function() {
                return '<div class="glass rounded-xl flex items-center gap-3 p-2 animate-pulse"><div class="w-14 h-14 rounded-lg bg-white/5"></div><div class="flex-grow space-y-2"><div class="h-3.5 bg-white/10 rounded w-3/4"></div><div class="h-2.5 bg-white/5 rounded w-1/2"></div></div></div>';
            }).join('');
        }
        if (s) {
            s.innerHTML = Array(4).fill(0).map(function() {
                return '<div class="flex-shrink-0 w-40 animate-pulse"><div class="w-40 h-40 mb-2 rounded-xl bg-white/5"></div><div class="h-3.5 bg-white/10 rounded w-3/4 mb-1"></div><div class="h-2.5 bg-white/5 rounded w-1/2"></div></div>';
            }).join('');
        }
        if (a) {
            a.innerHTML = Array(4).fill(0).map(function() {
                return '<div class="flex-shrink-0 w-32 animate-pulse"><div class="w-32 h-32 mb-2 rounded-full bg-white/5"></div><div class="h-3.5 bg-white/10 rounded w-3/4 mx-auto mb-1"></div></div>';
            }).join('');
        }
    },

    fetchFailed: false,
    async fetch() {
        Home.fetchFailed = false;
        Home.showSkeleton();
        if (!navigator.onLine) {
            var offlineSongs = typeof getOfflineSongs === 'function' ? getOfflineSongs() : [];
            offlineSongs.sort(function() { return 0.5 - Math.random(); });
            S.ht = offlineSongs;
            S.ha = [];
            S.hp = [];
            Home.show();
            return;
        }
        try {
            var q = 'Trend Indonesia';
            var r = await fetch(API.search + '?query=' + encodeURIComponent(q) + '&type=songs');
            var d = await r.json();
            if (d.status) {
                if (d.result.songs && d.result.songs.length > 0) {
                    S.ht = d.result.songs.map(function(s) {
                        return {
                            id: s.videoId,
                            videoId: s.videoId,
                            title: cn(s.title),
                            artist: cn(s.artist),
                            artistId: s.artistId || '',
                            cover: toHDCover(s.thumbnail, s.videoId),
                            ytUrl: s.url
                        };
                    });
                    // Acak urutan lagu supaya Quick Picks berbeda-beda tiap kali dibuka
                    S.ht.sort(function() { return 0.5 - Math.random(); });
                }
                var plist = [].concat(d.result.playlists || []).concat(d.result.albums || []);
                if (plist.length < 4) {
                    var playlistQueries = ['Lagu Indonesia Populer', 'Top Hits Indonesia', 'Playlist Terbaik', 'Hits Viral Indonesia'];
                    var q2 = playlistQueries[Math.floor(Math.random() * playlistQueries.length)];
                    if (q2 !== q) {
                        try {
                            var r2 = await fetch(API.search + '?query=' + encodeURIComponent(q2) + '&type=playlists');
                            var d2 = await r2.json();
                            if (d2.status) {
                                plist = plist.concat(d2.result.playlists || []).concat(d2.result.albums || []);
                            }
                        } catch(e){}
                    }
                }
                if (plist.length > 0) {
                    S.hp = plist.sort(function() { return 0.5 - Math.random(); });
                }
            }
        } catch(e){ Home.fetchFailed = true; }

        var topArtistsList = [
            { name: 'Raim Laode', id: 'UC0BletW9py84h0beCD26WHQ', cover: 'https://i.scdn.co/image/ab6761610000e5eb1e345853b015b6d510006767' },
            { name: 'Tulus', id: 'UCe8EVUo1E9vLrj0Bm8O5CzQ', cover: 'https://i.scdn.co/image/ab6761610000e5eb806a16d223847e335e2e8e3c' },
            { name: 'Hindia', id: 'UCzhVLh7xVyH3MpqO_KY6SYg', cover: 'https://yt3.googleusercontent.com/8ImMAMQSD4FA6-gdqCZWSFaB-drHvkdfiFcFAk7Mcyy56ctfWD-Xxno-CHfGC4L6Ql8aR61XT0vX0F4b=w800-h800-l90-rj' }
        ];
        S.ha = topArtistsList;

        try {
            var ra = await fetch(API.search + '?query=' + encodeURIComponent('Raim Laode Tulus Hindia') + '&type=artists');
            var da = await ra.json();
            if (da.status && da.result && da.result.artists && da.result.artists.length > 0) {
                da.result.artists.forEach(function(art) {
                    var artName = (art.title || art.name || '').toLowerCase();
                    var matched = S.ha.find(function(a) { return a.name.toLowerCase() === artName || artName.includes(a.name.toLowerCase()); });
                    if (matched) {
                        if (art.cover) matched.cover = art.cover;
                        if (art.id) matched.id = art.id;
                    }
                });
            }
        } catch(e) {}

        Home.show();
    },

    show() {
        if (Home.activeCategory && Home.activeCategory !== 'Semua') {
            if (Home.activeCategory === 'Developer Profile') {
                Home.renderDeveloperProfileView();
            } else {
                Home.displayCategoryView();
            }
            return;
        }

        var defView = gid('home-default-view'), catView = gid('home-category-view');
        if (defView) defView.style.display = 'block';
        if (catView) catView.style.display = 'none';

        var g = gid('home-grid'), s = gid('home-scroll'); if (!g || !s) return;

        // Recently played
        var rec = gid('home-recent'), recSection = gid('home-recent-section');
        if (rec && recSection) {
            var recent = typeof getRecent === 'function' ? getRecent() : [];
            if (recent.length > 0) {
                recSection.style.display = 'block';
                rec.innerHTML = recent.slice(0, 10).map(function(t, i){
                    return '<div onclick="PK(\'recent\',' + i + ')" class="flex-shrink-0 w-36 cursor-pointer active:scale-95 group p-2.5 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl hover:bg-[#363230] transition-all flex flex-col">' +
                        '<div class="w-full aspect-square rounded-xl overflow-hidden relative shadow-md mb-2"><img loading="lazy" src="' + (t.cover || FI) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src=\'' + FI + '\'" alt="' + es(t.title) + '" /><div class="absolute bottom-2 right-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"><i data-lucide="play" class="w-3.5 h-3.5 text-white fill-current ml-0.5"></i></div></div>' +
                        '<h3 class="font-semibold text-xs truncate text-white px-0.5">' + es(t.title) + '</h3>' +
                        '<p class="text-white/60 text-[10px] truncate mt-0.5 px-0.5">' + es(t.artist) + '</p>' +
                    '</div>';
                }).join('');
            } else {
                recSection.style.display = 'none';
            }
        }

        if ((!S.ht || S.ht.length === 0) && !navigator.onLine) {
            g.innerHTML = '<div class="col-span-2 md:col-span-4 bg-[#2a2521] border border-white/10 rounded-2xl p-5 text-center space-y-2 shadow-xl">'+
                '<div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30"><i data-lucide="wifi-off" class="w-5 h-5"></i></div>'+
                '<p class="text-white font-bold text-sm">Mode Offline (Tidak Ada Internet)</p>'+
                '<p class="text-white/60 text-xs">Putar lagu yang tersimpan sebelumnya di tab Offline PWA.</p>'+
                '<button onclick="App.switch(\'offline\')" class="mt-2 btn-chrome px-4 py-2 text-xs font-bold rounded-xl active:scale-95 transition inline-flex items-center gap-1.5"><i data-lucide="disc" class="w-4 h-4"></i> Buka Lagu Offline</button>'+
            '</div>';
        } else if ((!S.ht || S.ht.length === 0) && Home.fetchFailed) {
            g.innerHTML = '<div class="col-span-2 md:col-span-4 bg-[#2a2521] border border-white/10 rounded-2xl p-5 text-center space-y-3 shadow-xl">' +
                '<div class="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/25"><i data-lucide="cloud-off" class="w-5 h-5"></i></div>' +
                '<p class="text-white font-bold text-sm">Gagal memuat musik</p>' +
                '<p class="text-white/60 text-xs">Periksa koneksi internetmu lalu coba lagi.</p>' +
                '<button onclick="Home.refresh()" class="mt-1 btn-chrome px-5 py-2.5 text-xs font-bold rounded-full active:scale-95 transition inline-flex items-center gap-1.5"><i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Coba Lagi</button>' +
            '</div>';
        } else {
            g.innerHTML = (S.ht || []).slice(0, 6).map(function(t, i) {
                var isCur = S.ct && (
                    S.ct.id === t.id ||
                    S.ct.videoId === t.id ||
                    (S.ct.id && t.videoId && S.ct.id === t.videoId) ||
                    (S.ct.videoId && t.id && S.ct.videoId === t.id) ||
                    (S.ct.title === t.title && S.ct.artist === t.artist)
                );
                var isPlay = isCur && S.ip;
                var isLoad = isCur && S.il;

                var playIconHtml = '';
                if (isLoad) {
                    playIconHtml = '<div class="w-7 h-7 rounded-full btn-chrome flex items-center justify-center shrink-0 ml-auto"><div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>';
                } else if (isPlay) {
                    playIconHtml = '<div class="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto  shadow-white/30 ring-2 ring-white scale-105"><div class="flex items-end justify-center gap-[2px] w-3.5 h-3.5 pb-0.5"><span class="w-[2px] bg-black rounded-full animate-eq-1"></span><span class="w-[2px] bg-black rounded-full animate-eq-2"></span><span class="w-[2px] bg-black rounded-full animate-eq-3"></span></div></div>';
                } else if (isCur) {
                    playIconHtml = '<div class="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto border border-white"><i data-lucide="pause" class="w-3.5 h-3.5 fill-current"></i></div>';
                }

                var cardBg = isPlay ? 'bg-[#433e3b] border border-white/40 shadow-xl' : (isCur ? 'bg-[#3a332f] border border-white/30' : 'bg-[#2a2521] border border-white/10 hover:bg-[#363230]');
                var textStyle = isCur ? 'text-white font-bold' : '';

                return '<div onclick="PK(\'home1\','+i+')" class="home-grid-card '+cardBg+' rounded-2xl p-2.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all duration-300 group shadow-lg shadow-black/25">'+
                    '<img src="'+t.cover+'" class="w-14 h-14 rounded-xl object-cover shrink-0 shadow-md border border-white/10" onerror="this.src=\''+FI+'\'" />'+
                    '<div class="min-w-0 flex-1">'+
                        '<h3 class="home-grid-title font-semibold text-sm text-white truncate '+textStyle+'">'+es(t.title)+'</h3>'+
                        '<p class="text-xs text-white/60 truncate mt-0.5">'+es(t.artist)+'</p>'+
                    '</div>'+
                    '<div class="home-grid-icon shrink-0">'+playIconHtml+'</div>'+
                '</div>';
            }).join('');
        }

        var pls = typeof getUserPlaylists === 'function' ? getUserPlaylists() : [];
        var plHtml = '';

        pls.forEach(function(p, i) {
            plHtml += '<div onclick="Library.open(\''+p.id+'\')" class="flex-shrink-0 w-36 md:w-44 cursor-pointer active:scale-95 transition-all group"><div class="p-2.5 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl group-hover:bg-[#363230] transition-all flex flex-col"><div class="w-full aspect-square rounded-xl overflow-hidden relative shadow-md mb-2"><img src="'+(p.image||(p.songs.length>0?p.songs[0].cover:FI))+'" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src=\''+FI+'\'" /><div class="absolute bottom-2 right-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all shadow-black/40"><i data-lucide="play" class="w-4 h-4 text-white fill-current ml-0.5"></i></div></div><h3 class="font-semibold text-sm text-white truncate px-0.5">'+es(p.name)+'</h3><p class="text-xs text-white/60 truncate mt-0.5 px-0.5">'+p.songs.length+' lagu</p></div></div>';
        });

        plHtml += '<div onclick="if(typeof Library !== \'undefined\') Library.createNew()" class="flex-shrink-0 w-36 md:w-44 cursor-pointer active:scale-95 transition-all group"><div class="p-2.5 rounded-2xl bg-[#2a2521]/50 border border-dashed border-white/20 shadow-xl group-hover:border-white/40 group-hover:bg-[#2a2521] transition-all flex flex-col items-center justify-center aspect-square mb-2"><i data-lucide="plus" class="w-8 h-8 text-white/70"></i><span class="text-xs text-white/70 mt-2 font-medium">Buat Playlist</span></div><h3 class="font-semibold text-sm text-white/70 truncate px-0.5">Buat Baru</h3></div>';

        if (S.hp && S.hp.length > 0) {
            S.hp.slice(0, 8).forEach(function(p, i) {
                plHtml += '<div onclick="Album.open(\''+p.id+'\', \''+(p.cover||FI)+'\')" class="flex-shrink-0 w-36 md:w-44 cursor-pointer active:scale-95 transition-all group"><div class="p-2.5 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl group-hover:bg-[#363230] transition-all flex flex-col"><div class="w-full aspect-square rounded-xl overflow-hidden relative shadow-md mb-2"><img src="'+(p.cover||FI)+'" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src=\''+FI+'\'" /></div><h3 class="font-semibold text-sm text-white truncate px-0.5">'+es(p.title)+'</h3><p class="text-xs text-white/60 truncate mt-0.5 px-0.5">'+es(p.artist)+'</p></div></div>';
            });
        }

        s.innerHTML = plHtml;

        var a = gid('home-artists');
        if (a) {
            if (S.ha && S.ha.length > 0) {
                var artHtml = S.ha.slice(0, 10).map(function(p, i) {
                    var imgUrl = toWebp(p.cover) || FI;
                    return '<div onclick="Artist.open(\''+p.id+'\', \''+esJs(p.name||p.title)+'\', \''+(p.cover||'')+'\')" class="flex-shrink-0 w-32 cursor-pointer active:scale-95 transition-all group"><div class="p-2.5 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl group-hover:bg-[#363230] transition-all flex flex-col items-center"><div class="w-24 h-24 rounded-full overflow-hidden relative shadow-md mb-2 border-2 border-white/10 group-hover:scale-105 transition-transform duration-300"><img src="'+imgUrl+'" class="w-full h-full object-cover" onerror="handleImgError(this)" /></div><h3 class="font-semibold text-center text-xs text-white truncate w-full px-0.5">'+es(p.name||p.title)+'</h3><p class="text-white/60 text-[10px] mt-0.5 uppercase tracking-wider font-semibold">Artist</p></div></div>';
                }).join('');
                a.innerHTML = artHtml;
                a.parentElement.style.display = 'block';
            } else {
                a.parentElement.style.display = 'none';
            }
        }
        lucide.createIcons();
        Home.renderActive();
        if (typeof hideSplashScreen === 'function') {
            setTimeout(hideSplashScreen, 100);
        }
    },

    renderActive() {
        if (Home.activeCategory && Home.activeCategory !== 'Semua') {
            Home.renderActiveCategory();
            return;
        }

        var g = gid('home-grid');
        if (g && g.children && S.ht) {
            var items = S.ht.slice(0, 6);
            var cards = g.querySelectorAll('.home-grid-card');
            cards.forEach(function(el, i) {
                var t = items[i];
                if (!t) return;
                var isCur = S.ct && (
                    S.ct.id === t.id ||
                    S.ct.videoId === t.id ||
                    (S.ct.id && t.videoId && S.ct.id === t.videoId) ||
                    (S.ct.videoId && t.id && S.ct.videoId === t.id) ||
                    (S.ct.title === t.title && S.ct.artist === t.artist)
                );
                var isPlay = isCur && S.ip;
                var isLoad = isCur && S.il;

                var playIconHtml = '';
                if (isLoad) {
                    playIconHtml = '<div class="w-7 h-7 rounded-full btn-chrome flex items-center justify-center shrink-0 ml-auto"><div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>';
                } else if (isPlay) {
                    playIconHtml = '<div class="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto shadow-white/30 ring-2 ring-white scale-105"><div class="flex items-end justify-center gap-[2px] w-3.5 h-3.5 pb-0.5"><span class="w-[2px] bg-black rounded-full animate-eq-1"></span><span class="w-[2px] bg-black rounded-full animate-eq-2"></span><span class="w-[2px] bg-black rounded-full animate-eq-3"></span></div></div>';
                } else if (isCur) {
                    playIconHtml = '<div class="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto border border-white"><svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></div>';
                }

                var cardBg = isPlay ? 'bg-[#433e3b] border border-white/40 shadow-xl' : (isCur ? 'bg-[#3a332f] border border-white/30' : 'bg-[#2a2521] border border-white/10 hover:bg-[#363230]');
                el.className = 'home-grid-card ' + cardBg + ' rounded-2xl p-2.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all duration-300 group shadow-lg shadow-black/25';

                var titleEl = el.querySelector('.home-grid-title');
                if (titleEl) {
                    titleEl.className = 'home-grid-title font-semibold text-sm text-white truncate ' + (isCur ? 'font-black' : '');
                }
                var iconWrap = el.querySelector('.home-grid-icon');
                if (iconWrap) {
                    iconWrap.innerHTML = playIconHtml;
                }
            });
        }
    },

    renderActiveCategory() {
        var catView = gid('home-category-view');
        if (!catView || !S.hc) return;

        var cards = catView.querySelectorAll('.home-cat-card');
        cards.forEach(function(el, i) {
            var t = S.hc[i];
            if (!t) return;

            var isCur = S.ct && (
                S.ct.id === t.id ||
                S.ct.videoId === t.id ||
                (S.ct.id && t.videoId && S.ct.id === t.videoId) ||
                (S.ct.videoId && t.id && S.ct.videoId === t.id) ||
                (S.ct.title === t.title && S.ct.artist === t.artist)
            );
            var isPlay = isCur && S.ip;
            var isLoad = isCur && S.il;

            var playIconHtml = '';
            if (isLoad) {
                playIconHtml = '<div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full btn-chrome flex items-center justify-center shrink-0 ml-auto"><div class="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>';
            } else if (isPlay) {
                playIconHtml = '<div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto shadow-white/30 ring-1 sm:ring-2 ring-white scale-105"><div class="flex items-end justify-center gap-[2px] w-3 sm:w-3.5 h-3 sm:h-3.5 pb-0.5"><span class="w-[2px] bg-black rounded-full animate-eq-1"></span><span class="w-[2px] bg-black rounded-full animate-eq-2"></span><span class="w-[2px] bg-black rounded-full animate-eq-3"></span></div></div>';
            } else if (isCur) {
                playIconHtml = '<div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-auto border border-white"><svg class="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></div>';
            } else {
                playIconHtml = '<div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/5 group-hover:bg-white/20 flex items-center justify-center shrink-0 ml-auto text-white transition-all"><svg class="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current ml-0.5" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg></div>';
            }

            var cardBg = isPlay ? 'bg-[#433e3b] border border-white/40 shadow-xl' : (isCur ? 'bg-[#3a332f] border border-white/30' : 'bg-[#2a2521] border border-white/10 hover:bg-[#363230]');
            var isSnap = el.classList.contains('snap-start');
            el.className = (isSnap ? 'snap-start ' : '') + 'home-cat-card group ' + cardBg + ' rounded-2xl flex items-center gap-3 p-2.5 cursor-pointer active:scale-95 transition-all shadow-lg shadow-black/20' + (isSnap ? ' w-full' : '');

            var titleEl = el.querySelector('h3');
            if (titleEl) {
                titleEl.className = 'font-semibold text-xs sm:text-sm truncate ' + (isCur ? 'text-white font-black' : 'text-white/90');
            }
            var iconWrap = el.querySelector('.home-cat-icon') || el.children[el.children.length - 1];
            if (iconWrap) {
                iconWrap.innerHTML = playIconHtml;
            }
        });
    },

    refresh() {
        if (Home.activeCategory && Home.activeCategory !== 'Semua') {
            Home.fetchCategoryData(Home.activeCategory);
        } else {
            Home.fetch();
        }
        var m = gid('main-area');
        if (m) m.scrollTop = 0;
    }
};
