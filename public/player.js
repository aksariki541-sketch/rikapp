// ============================================================
// MUSIFYRIK - CORE PLAYER (FULL FIX)
// ============================================================
const API={search:'/api/search',artist:'/api/artist',suggest:'/api/suggest',lyrics:'/api/lyrics',ytplay:'/api/ytplay',spotify:'/api/spotify'};
const FI='data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2523374151%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20width%3D%22100%2525%22%20height%3D%22100%2525%22%20fill%3D%22%252318181b%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20fill%3D%22%252327272a%22%20stroke%3D%22none%22%2F%3E%3Cpath%20d%3D%22M9%2017V5l10-2v12%22%20stroke%3D%22%252352525b%22%20stroke-width%3D%221%22%2F%3E%3Ccircle%20cx%3D%226%22%20cy%3D%2217%22%20r%3D%223%22%20fill%3D%22%252352525b%22%20stroke%3D%22none%22%2F%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2215%22%20r%3D%223%22%20fill%3D%22%252352525b%22%20stroke%3D%22none%22%2F%3E%3C%2Fsvg%3E';

function toWebp(url) {
    if (!url) return FI;
    var u = String(url);
    if (u.includes('i.ytimg.com/vi/') || u.includes('img.youtube.com/vi/')) {
        u = u.replace('i.ytimg.com/vi/', 'i.ytimg.com/vi_webp/')
             .replace('img.youtube.com/vi/', 'i.ytimg.com/vi_webp/')
             .replace(/(hqdefault|mqdefault|sddefault|default|maxresdefault)\.(jpg|jpeg|png)/i, '$1.webp');
    } else if (u.includes('i.ytimg.com/vi_webp/')) {
        u = u.replace(/(hqdefault|mqdefault|sddefault|default|maxresdefault)\.(jpg|jpeg|png)/i, '$1.webp');
    }
    if ((u.includes('googleusercontent.com') || u.includes('ggpht.com') || u.includes('yt3.ggpht.com')) && !u.includes('-rw')) {
        if (/=[a-zA-Z0-9\-_]+$/i.test(u)) {
            u = u + '-rw';
        }
    }
    return u;
}

function toHDCover(url, videoId) {
    if (!url && videoId) return 'https://i.ytimg.com/vi_webp/' + videoId + '/hqdefault.webp';
    if (!url) return FI;
    var hd = String(url);
    if (hd.includes('googleusercontent.com') || hd.includes('ggpht.com') || hd.includes('ytimg.com')) {
        if (/=w\d+-h\d+/i.test(hd)) {
            hd = hd.replace(/=w\d+-h\d+[^?#]*/i, '=w800-h800-l90-rj-rw');
        } else if (/=s\d+/i.test(hd)) {
            hd = hd.replace(/=s\d+[^?#]*/i, '=s800-c-k-c0x00ffffff-no-rj-rw');
        } else if (/=w\d+/i.test(hd)) {
            hd = hd.replace(/=w\d+[^?#]*/i, '=w800-h800-l90-rj-rw');
        } else if (/=[a-zA-Z0-9\-_]+$/i.test(hd) && !hd.includes('-rw')) {
            hd = hd + '-rw';
        }
    }
    if (hd.includes('i.ytimg.com/vi/') || hd.includes('img.youtube.com/vi/')) {
        hd = hd.replace('i.ytimg.com/vi/', 'i.ytimg.com/vi_webp/')
               .replace('img.youtube.com/vi/', 'i.ytimg.com/vi_webp/')
               .replace(/(hqdefault|mqdefault|sddefault|default|maxresdefault)\.(jpg|jpeg|png)/i, 'hqdefault.webp');
    } else if (hd.includes('i.ytimg.com/vi_webp/')) {
        hd = hd.replace(/(hqdefault|mqdefault|sddefault|default|maxresdefault)\.(jpg|jpeg|png)/i, 'hqdefault.webp');
    }
    return hd;
}

function handleImgError(img) {
    if (!img) return;
    var retries = parseInt(img.getAttribute('data-img-retry') || '0', 10);
    if (retries >= 3) {
        img.src = '/logo.png';
        return;
    }
    img.setAttribute('data-img-retry', String(retries + 1));
    var src = img.src || '';
    var orig = img.getAttribute('data-original-src');

    if (src.includes('/vi_webp/')) {
        img.src = src.replace('/vi_webp/', '/vi/').replace(/\.webp$/i, '.jpg');
    } else if (src.includes('hqdefault.jpg')) {
        img.src = src.replace('hqdefault.jpg', 'mqdefault.jpg');
    } else if (src.includes('-rw')) {
        img.src = src.replace('-rw', '');
    } else if (orig && img.src !== orig) {
        img.src = orig;
    } else {
        img.src = '/logo.png';
    }
}
const S={ht:[],sr:[],ar:[],hc:[],hcp:[],hca:[],sq:'',filter:'all',ct:null,pl:[],pi:-1,ps:'',ip:false,il:false,rm:'all',isShuffle:false,currentAccentColor:'#e8789f',autoNext:true,iv:null,pt:0,pd:0,at:'home',ld:{type:'none',lines:[]},cli:-1,lo:false,lyricOffset:0,playbackRate:1.0,sleepSecondsLeft:0,sleepEndWithTrack:false,volume:1.0,lastVolume:1.0};
try{S.playbackRate=parseFloat(localStorage.getItem('rikiz_playback_rate'))||1.0;}catch(e){S.playbackRate=1.0;}
try{var storedAutoNext = localStorage.getItem('rikiz_auto_next');if(storedAutoNext!==null){S.autoNext = storedAutoNext==='true';}}catch(e){}
S.shuffleOrder=null;S.shufflePos=0;
try{var storedRm=localStorage.getItem('rikiz_repeat_mode');if(storedRm==='off'||storedRm==='one'||storedRm==='all'){S.rm=storedRm;}}catch(e){}
var audioRetryMap={};
function fm(s){if(isNaN(s))return"0:00";const m=Math.floor(s/60),se=Math.floor(s%60);return m+':'+(se<10?'0':'')+se;}
function es(t){if(!t)return'';const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function esJs(t){if(!t)return'';return String(t).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;').replace(/\n/g,' ').replace(/\r/g,'');}
function cn(t){if(!t)return'Unknown';return t.replace(/[^\x20-\x7E\xA0-\xFF\u0100-\uFFFF]/g,'').replace(/\s*-\s*Topic$/i,'').trim()||'Unknown';}
function gid(id){return document.getElementById(id);}

// ---- AUDIO ENGINE (elemen <audio> native, sumber stream dari /api/ytplay) ----
var AU=gid('audio-player');
if(!AU){AU=document.createElement('audio');AU.id='audio-player';AU.preload='auto';AU.style.display='none';document.body.appendChild(AU);}
AU.addEventListener('timeupdate',function(){
    if(!AU.paused){
        S.pt=AU.currentTime||0;
        S.pd=AU.duration||0;
        renderProgress();
        checkAndPreloadNext();
    }
});
AU.addEventListener('play',function(){S.ip=true;S.il=false;UB();SP();try{AU.playbackRate=S.playbackRate||1.0;}catch(ex){}updateMediaSessionPlaybackState();});
AU.addEventListener('pause',function(){if(!AU.ended){S.ip=false;UB();ST();}updateMediaSessionPlaybackState();});
AU.addEventListener('waiting',function(){S.il=true;UB();});
AU.addEventListener('playing',function(){S.il=false;UB();updateMediaSessionPlaybackState();});
AU.addEventListener('ended',function(){
    ST();
    if(typeof handleTrackEnded==='function' && handleTrackEnded()) return;
    if(S.rm==='one'){
        AU.currentTime=0;
        var p=AU.play(); if(p&&p.catch)p.catch(function(){});
        return;
    }
    if(S.rm==='off'){
        S.ip=false;S.il=false;UB();updateMediaSessionPlaybackState();
        return;
    }
    NX();
});
AU.addEventListener('error',function(){
    if(!AU.src) return;
    var vid = S.ct ? (S.ct.videoId || S.ct.id) : null;
    if(!vid) { S.il=false;S.ip=false;UB(); return; }
    if(!audioRetryMap[vid]){
        audioRetryMap[vid] = 1;
        refetchAudioAndResume(vid);
    } else {
        S.il=false;S.ip=false;UB();
        if(typeof showToast==='function') showToast('Gagal memutar lagu ini');
    }
});

// ---- MEDIA SESSION API (kontrol Next/Prev/Play/Pause di lockscreen & notifikasi OS) ----
function updateMediaSessionPlaybackState(){
    if(!('mediaSession' in navigator))return;
    try{
        navigator.mediaSession.playbackState = S.ip ? 'playing' : (S.ct ? 'paused' : 'none');
    }catch(e){}
}
function updateMediaSessionPositionState(){
    if(!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState)return;
    try{
        var dur = AU.duration;
        if(!dur || !isFinite(dur) || dur <= 0)return;
        var pos = AU.currentTime || 0;
        if(pos > dur) pos = dur;
        navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: AU.playbackRate || 1.0,
            position: pos
        });
    }catch(e){}
}
if('mediaSession' in navigator){
    try{
        navigator.mediaSession.setActionHandler('play', function(){ TP(); });
        navigator.mediaSession.setActionHandler('pause', function(){ TP(); });
        navigator.mediaSession.setActionHandler('previoustrack', function(){ PV(); });
        navigator.mediaSession.setActionHandler('nexttrack', function(){ NX(); });
        navigator.mediaSession.setActionHandler('seekbackward', function(details){
            var skip = (details && details.seekOffset) || 10;
            AU.currentTime = Math.max(0, (AU.currentTime || 0) - skip);
            updateMediaSessionPositionState();
        });
        navigator.mediaSession.setActionHandler('seekforward', function(details){
            var skip = (details && details.seekOffset) || 10;
            AU.currentTime = Math.min(AU.duration || Infinity, (AU.currentTime || 0) + skip);
            updateMediaSessionPositionState();
        });
        navigator.mediaSession.setActionHandler('seekto', function(details){
            if(details && typeof details.seekTime === 'number'){
                AU.currentTime = details.seekTime;
                S.pt = details.seekTime;
                renderProgress();
                updateMediaSessionPositionState();
            }
        });
        navigator.mediaSession.setActionHandler('stop', function(){ AU.pause(); AU.currentTime = 0; });
    }catch(e){}
}
AU.addEventListener('loadedmetadata', updateMediaSessionPositionState);
AU.addEventListener('timeupdate', function(){
    if(!AU.paused){ updateMediaSessionPositionState(); }
});

// ---- VOLUME CONTROL ENGINE (SPOTIFY STYLE) ----
try {
    var storedVol = parseFloat(localStorage.getItem('rikiz_volume'));
    if (!isNaN(storedVol) && storedVol >= 0 && storedVol <= 1) {
        S.volume = storedVol;
    } else {
        S.volume = 1.0;
    }
} catch(e) { S.volume = 1.0; }
S.lastVolume = S.volume > 0 ? S.volume : 1.0;
if (AU) AU.volume = S.volume;

function applyVolume(vol) {
    vol = Math.max(0, Math.min(1, vol));
    S.volume = vol;
    if (AU) AU.volume = vol;
    try { localStorage.setItem('rikiz_volume', String(vol)); } catch(e){}
    updateVolumeUI();
}

function setVolume(valPercent) {
    var vol = parseFloat(valPercent) / 100;
    if (vol > 0) S.lastVolume = vol;
    applyVolume(vol);
}

function toggleMute() {
    var curVol = AU ? AU.volume : S.volume;
    if (curVol > 0) {
        S.lastVolume = curVol;
        applyVolume(0);
    } else {
        applyVolume(S.lastVolume || 1.0);
    }
}

function updateVolumeUI() {
    var curVol = AU ? AU.volume : (S.volume ?? 1.0);
    var pct = Math.round(curVol * 100);

    var volBar = gid('vol-bar');
    if (volBar) volBar.value = pct;

    var volProgress = gid('full-vol-progress');
    if (volProgress) volProgress.style.width = pct + '%';

    var volText = gid('full-vol-text');
    if (volText) volText.innerText = pct + '%';

    var volIcon = gid('full-vol-icon');
    if (volIcon) {
        var iconName = 'volume-2';
        if (pct === 0) iconName = 'volume-x';
        else if (pct < 35) iconName = 'volume-1';
        else iconName = 'volume-2';

        volIcon.setAttribute('data-lucide', iconName);
        if (window.lucide) lucide.createIcons();
    }
}

var audioUrlCache = {};
try {
    var storedAudio = localStorage.getItem('pwa_audio_cache');
    if (storedAudio) audioUrlCache = JSON.parse(storedAudio);
} catch(e) {}

var lyricsCache = {};
try {
    var storedLyrics = localStorage.getItem('pwa_lyrics_cache');
    if (storedLyrics) lyricsCache = JSON.parse(storedLyrics);
} catch(e) {}

function savePwaCaches() {
    try {
        var lKeys = Object.keys(lyricsCache);
        if (lKeys.length > 80) delete lyricsCache[lKeys[0]];
        localStorage.setItem('pwa_lyrics_cache', JSON.stringify(lyricsCache));

        var aKeys = Object.keys(audioUrlCache);
        if (aKeys.length > 80) delete audioUrlCache[aKeys[0]];
        localStorage.setItem('pwa_audio_cache', JSON.stringify(audioUrlCache));
    } catch(e) {}
}

var hasPrefetchedNext = false;
var isPreloadingNext = false;

function checkAndPreloadNext() {
    if (hasPrefetchedNext || isPreloadingNext) return;
    if (S.pd > 0 && (S.pd - S.pt <= 40 || S.pt >= S.pd * 0.7)) {
        hasPrefetchedNext = true;
        triggerPreloadNextTrack();
    }
}

function getUpcomingIndex(){
    if(!S.pl || !S.pl.length) return -1;
    if(S.isShuffle){
        if(!S.shuffleOrder || !S.shuffleOrder.length) buildShuffleOrder();
        var pos = S.shufflePos + 1;
        if(pos >= S.shuffleOrder.length) pos = 0;
        return S.shuffleOrder[pos];
    }
    var ni = S.pi + 1;
    if(ni >= S.pl.length) return -1;
    return ni;
}

async function triggerPreloadNextTrack(){
    if (isPreloadingNext) return;
    isPreloadingNext = true;
    try {
        if (!S.ct) return;

        var nextTrack = null;
        var upIdx = getUpcomingIndex();
        if (upIdx >= 0 && S.pl[upIdx]) {
            nextTrack = S.pl[upIdx];
        } else if (S.autoNext) {
            var fetched = await fetchAutoNextRecommendations(S.ct);
            if (fetched && S.pl && S.pi + 1 < S.pl.length) {
                nextTrack = S.pl[S.pi + 1];
            }
        }

        if (!nextTrack) return;
        var nextVid = nextTrack.videoId || nextTrack.id;
        if (!nextVid) return;

        // Pre-fetch lyrics for next track
        if (typeof lyricsCache !== 'undefined' && !lyricsCache[nextVid]) {
            var nTitle = nextTrack.title ? '&title=' + encodeURIComponent(nextTrack.title) : '';
            var nArtist = nextTrack.artist ? '&artist=' + encodeURIComponent(nextTrack.artist) : '';
            fetch(API.lyrics + '?id=' + nextVid + nTitle + nArtist).then(function(r){ return r.json(); }).then(function(d){
                if (d && d.status && d.result && d.result.lyrics && d.result.lyrics.lines) {
                    lyricsCache[nextVid] = {
                        vid: nextVid,
                        type: d.result.lyrics.type,
                        lines: d.result.lyrics.lines
                    };
                }
            }).catch(function(){});
        }

        // Pre-fetch audio URL
        if (!audioUrlCache[nextVid]) {
            var nextYtUrl = nextTrack.ytUrl || ('https://youtube.com/watch?v=' + nextVid);
            var r = await fetch(API.ytplay, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query: nextYtUrl})
            });
            var d = await r.json();
            if (d && d.status && d.result && d.result.download && d.result.download.audio) {
                var rawAudioUrl = d.result.download.audio;
                audioUrlCache[nextVid] = rawAudioUrl;

                var preAudio = new Audio();
                preAudio.preload = 'auto';
                preAudio.src = rawAudioUrl;
            }
        }
    } catch(e) {
    } finally {
        isPreloadingNext = false;
    }
}

function SP(){
    ST();
    S.iv=setInterval(function(){
        if(!AU.paused){S.pt=AU.currentTime||0;S.pd=AU.duration||0;renderProgress();}
    },100);
}
function ST(){if(S.iv){clearInterval(S.iv);S.iv=null;}}
function renderProgress(){
    var p=S.pd>0?(S.pt/S.pd)*100:0;
    var mp=gid('mini-progress'),fp=gid('full-progress'),sb=gid('seek-bar'),tc=gid('time-curr'),td=gid('time-dur');
    if(mp)mp.style.width=p+'%';if(fp)fp.style.width=p+'%';if(sb)sb.value=p;if(tc)tc.innerText=fm(S.pt);if(td)td.innerText=fm(S.pd);ULH(S.pt);

    var mcp = gid('mini-circle-progress');
    if (mcp) {
        var totalLen = 131.95;
        var offset = totalLen * (1 - (p / 100));
        mcp.style.strokeDashoffset = Math.max(0, offset);
    }

    checkAutoNextTransition();
}

function checkAutoNextTransition() {
    if (!S.ip || AU.paused || !S.pd || S.pd <= 0) {
        resetAutoNextTransition();
        return;
    }

    var remaining = S.pd - S.pt;
    var windowSec = Math.min(10, S.pd > 0 ? S.pd : 10);

    if (remaining > 0 && remaining <= windowSec) {
        var nextTrack = null;
        var upIdx2 = getUpcomingIndex();
        if (upIdx2 >= 0 && S.pl[upIdx2]) {
            nextTrack = S.pl[upIdx2];
        }

        if (nextTrack) {
            var progress = Math.min(100, Math.max(0, ((windowSec - remaining) / windowSec) * 100));
            updateAutoNextTransition(progress, nextTrack);
            return;
        }
    }
    resetAutoNextTransition();
}

function updateAutoNextTransition(progress, nextTrack) {
    if (!nextTrack || progress <= 0) {
        resetAutoNextTransition();
        return;
    }

    var nextVid = nextTrack.videoId || nextTrack.id;
    var nextCover = toHDCover(nextTrack.cover, nextVid);
    var nextTitle = nextTrack.title || '';
    var nextArtist = nextTrack.artist || '';
    var remainingSec = Math.max(1, Math.ceil(S.pd - S.pt));

    var opacityRatio = (progress / 100).toFixed(2);
    var curOpacityRatio = (1 - progress / 100).toFixed(2);

    // 1. Miniplayer Transition Overlay
    var miniOverlay = gid('mini-next-overlay');
    var miniCover = gid('mini-cover-next');
    var miniTitle = gid('mini-title-next');
    var miniArtist = gid('mini-artist-next');
    var miniBadge = gid('mini-next-badge');

    if (miniOverlay) {
        miniOverlay.style.display = 'flex';
        miniOverlay.style.clipPath = 'none';
        miniOverlay.style.webkitClipPath = 'none';
        if (miniCover) {
            if (miniCover.getAttribute('data-vid') !== nextVid) {
                miniCover.src = nextCover;
                miniCover.onerror = function(){ handleImgError(this); };
                miniCover.setAttribute('data-vid', nextVid);
            }
            var curMiniCover = gid('mini-cover');
            if (curMiniCover) {
                miniCover.style.animationPlayState = curMiniCover.style.animationPlayState || 'running';
            }
        }
        if (miniTitle) miniTitle.innerText = nextTitle;
        if (miniArtist) miniArtist.innerText = nextArtist;
        if (miniBadge) miniBadge.innerText = 'NEXT (' + remainingSec + 's)';

        miniOverlay.style.maskImage = 'none';
        miniOverlay.style.webkitMaskImage = 'none';
        miniOverlay.style.opacity = opacityRatio;
    }

    // 2. Full Player Top Header Artist & Tag
    var fullHeaderTag = gid('full-header-tag');
    var fullHeaderArtist = gid('full-header-artist');
    if (fullHeaderTag) {
        fullHeaderTag.innerText = 'BERIKUTNYA (' + remainingSec + 's)';
    }
    if (fullHeaderArtist) {
        fullHeaderArtist.innerText = progress >= 50 ? nextArtist : (S.ct ? S.ct.artist : '');
    }

    // 3. Full Player Background Blur Artwork
    var fullBgNext = gid('full-bg-artwork-next');
    if (fullBgNext) {
        fullBgNext.style.display = 'block';
        if (fullBgNext.getAttribute('data-vid') !== nextVid) {
            fullBgNext.src = nextCover;
            fullBgNext.onerror = function(){ handleImgError(this); };
            fullBgNext.setAttribute('data-vid', nextVid);
        }
        fullBgNext.style.maskImage = 'none';
        fullBgNext.style.webkitMaskImage = 'none';
        fullBgNext.style.opacity = opacityRatio;
    }

    // 4. Full Player Cover Artwork (Clean crossfade transition in-place, no mask crop)
    var fullCoverCur = gid('full-cover');
    var fullCoverNext = gid('full-cover-next-overlay');
    var fullCoverImg = gid('full-cover-next-img');

    if (fullCoverCur) {
        fullCoverCur.style.opacity = curOpacityRatio;
        fullCoverCur.style.transform = 'none';
    }

    if (fullCoverNext) {
        fullCoverNext.style.display = 'block';
        if (fullCoverImg && fullCoverImg.getAttribute('data-vid') !== nextVid) {
            fullCoverImg.src = nextCover;
            fullCoverImg.onerror = function(){ handleImgError(this); };
            fullCoverImg.setAttribute('data-vid', nextVid);
            fullCoverImg.style.transform = 'none';
            if (fullCoverImg.style.display === 'none') fullCoverImg.style.display = 'block';
        }
        fullCoverNext.style.maskImage = 'none';
        fullCoverNext.style.webkitMaskImage = 'none';
        fullCoverNext.style.opacity = opacityRatio;
    }

    // Update Favicon during transition when progress >= 50%
    if (progress >= 50 && nextCover) {
        setFavicon(nextCover);
    }

    // 5. Full Player Metadata Title & Artist
    var fullMetaCurrent = gid('full-meta-current');
    var fullMetaNext = gid('full-meta-next');
    var fullTitleNext = gid('full-title-next');
    var fullArtistNext = gid('full-artist-next');
    var fullBadgeNext = gid('full-next-countdown-badge');

    if (fullMetaNext) {
        if (fullTitleNext) fullTitleNext.innerText = nextTitle;
        if (fullArtistNext) fullArtistNext.innerText = nextArtist;
        if (fullBadgeNext) fullBadgeNext.innerText = 'NEXT (' + remainingSec + 's)';

        fullMetaNext.style.display = 'flex';
        fullMetaNext.style.maskImage = 'none';
        fullMetaNext.style.webkitMaskImage = 'none';
        fullMetaNext.style.opacity = opacityRatio;
    }
    if (fullMetaCurrent) {
        fullMetaCurrent.style.opacity = curOpacityRatio;
    }
}

function resetAutoNextTransition() {
    var miniOverlay = gid('mini-next-overlay');
    if (miniOverlay) {
        miniOverlay.style.maskImage = 'none';
        miniOverlay.style.webkitMaskImage = 'none';
        miniOverlay.style.opacity = '0';
        miniOverlay.style.display = 'none';
    }

    var fullHeaderTag = gid('full-header-tag');
    if (fullHeaderTag) {
        fullHeaderTag.innerText = 'SEDANG DIPUTAR';
    }
    var fullHeaderArtist = gid('full-header-artist');
    if (fullHeaderArtist) {
        fullHeaderArtist.innerText = S.ct ? S.ct.artist : '';
        fullHeaderArtist.style.opacity = '1';
    }

    var fullBgNext = gid('full-bg-artwork-next');
    if (fullBgNext) {
        fullBgNext.style.maskImage = 'none';
        fullBgNext.style.webkitMaskImage = 'none';
        fullBgNext.style.opacity = '0';
        fullBgNext.style.display = 'none';
    }

    var fullCoverCur = gid('full-cover');
    if (fullCoverCur) {
        fullCoverCur.style.opacity = '1';
        fullCoverCur.style.transform = '';
    }

    var fullCoverNext = gid('full-cover-next-overlay');
    if (fullCoverNext) {
        fullCoverNext.style.maskImage = 'none';
        fullCoverNext.style.webkitMaskImage = 'none';
        fullCoverNext.style.opacity = '0';
        fullCoverNext.style.display = 'none';
    }

    var fullCoverImg = gid('full-cover-next-img');
    if (fullCoverImg) {
        fullCoverImg.style.transform = '';
        fullCoverImg.style.maskImage = 'none';
        fullCoverImg.style.webkitMaskImage = 'none';
        fullCoverImg.style.opacity = '0';
        fullCoverImg.style.display = 'none';
    }

    var fullMetaCurrent = gid('full-meta-current');
    if (fullMetaCurrent) {
        fullMetaCurrent.style.opacity = '1';
    }

    var fullMetaNext = gid('full-meta-next');
    if (fullMetaNext) {
        fullMetaNext.style.maskImage = 'none';
        fullMetaNext.style.webkitMaskImage = 'none';
        fullMetaNext.style.opacity = '0';
        fullMetaNext.style.display = 'none';
    }
}

function updateServerLoadingToast() {
    var toast = gid('server-loading-toast');
    if (S.il) {
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'server-loading-toast';
            toast.className = 'fixed top-3 left-1/2 -translate-x-1/2 z-[350] bg-black/85 text-white/90 px-3 py-1 rounded-full border border-white/10 shadow-sm flex items-center gap-2 transition-all duration-150 transform -translate-y-2 opacity-0 pointer-events-none text-[11px] font-normal';
            toast.innerHTML = `
                <div class="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin shrink-0"></div>
                <span>Menyiapkan lagu...</span>
            `;
            document.body.appendChild(toast);
        }
        setTimeout(function() {
            if (toast) {
                toast.classList.remove('-translate-y-2', 'opacity-0', 'pointer-events-none');
                toast.classList.add('translate-y-0', 'opacity-100');
            }
        }, 20);
    } else {
        if (toast) {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('-translate-y-2', 'opacity-0', 'pointer-events-none');
            setTimeout(function() {
                if (toast && !S.il && toast.parentElement) {
                    toast.remove();
                }
            }, 150);
        }
    }
}

function UB(){
    var mi=gid('mini-play-btn'),fu=gid('full-play-btn');
    var coverOverlay=gid('full-cover-overlay'),coverIcon=gid('full-cover-icon'),coverText=gid('full-cover-text');
    var fullCover=gid('full-cover');
    var statusTag=gid('full-status-tag');
    var playWrap=gid('full-play-btn-wrap');

    updateServerLoadingToast();

    var miniCover = gid('mini-cover');
    if (miniCover) {
        miniCover.style.animationPlayState = S.ip ? 'running' : 'paused';
    }

    if(!mi||!fu)return;

    var accent = S.currentAccentColor || '#e8789f';

    if(S.il){
        mi.innerHTML='<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
        fu.innerHTML='<div class="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>';

        if(coverOverlay){
            coverOverlay.classList.remove('opacity-0', 'pointer-events-none');
            coverOverlay.classList.add('opacity-100');
            if(coverIcon) coverIcon.innerHTML='<div class="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900/80 border border-white/10 p-2"><img src="/logo.png" class="w-8 h-8 object-contain animate-pulse" alt="Logo"/><div class="absolute inset-0 border-2 border-white/10 border-t-white rounded-2xl animate-spin"></div></div>';
            if(coverText) {
                coverText.className = 'text-xs font-semibold text-zinc-300 leading-relaxed text-center drop-shadow-md px-2';
                coverText.innerText='Sabar yaa, server kami perlu waktu buat siapin lagu';
            }
        }
        if(fullCover){
            fullCover.style.transform='scale(0.95)';
            fullCover.style.filter='brightness(0.75)';
        }
        if(statusTag){
            statusTag.classList.remove('hidden', 'bg-white/10', 'text-white/80', 'border-white/20');
            statusTag.classList.add('inline-block', 'bg-white/20', 'text-white', 'border-white/30', 'animate-pulse');
            statusTag.innerText='MENYIAPKAN';
        }
    }
    else if(S.ip){
        mi.innerHTML='<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        fu.innerHTML='<svg class="w-7 h-7 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

        if(coverOverlay){
            coverOverlay.classList.remove('opacity-100');
            coverOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
        if(fullCover){
            fullCover.style.transform='scale(1)';
            fullCover.style.filter='brightness(1)';
        }
        if(statusTag){
            statusTag.classList.add('hidden');
            statusTag.classList.remove('inline-block', 'animate-pulse');
        }
    }
    else{
        mi.innerHTML='<svg class="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
        fu.innerHTML='<svg class="w-7 h-7 fill-current ml-0.5" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

        if(coverOverlay){
            if(S.ct){
                coverOverlay.classList.remove('opacity-0', 'pointer-events-none');
                coverOverlay.classList.add('opacity-100');
                if(coverIcon) coverIcon.innerHTML='<svg class="w-12 h-12 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>';
                if(coverText) coverText.innerText='DIPAUSE';
            }else{
                coverOverlay.classList.remove('opacity-100');
                coverOverlay.classList.add('opacity-0', 'pointer-events-none');
            }
        }
        if(fullCover){
            if(S.ct){
                fullCover.style.transform='scale(0.96)';
                fullCover.style.filter='brightness(0.85)';
            }else{
                fullCover.style.transform='scale(1)';
                fullCover.style.filter='brightness(1)';
            }
        }
        if(statusTag){
            if(S.ct){
                statusTag.classList.remove('hidden', 'bg-white/20', 'animate-pulse');
                statusTag.classList.add('inline-block', 'bg-white/10', 'text-white/80', 'border-white/20');
                statusTag.innerText='PAUSED';
            }else{
                statusTag.classList.add('hidden');
                statusTag.classList.remove('inline-block');
            }
        }
    }

    if(playWrap){
        playWrap.style.backgroundColor = accent;
    }
    if(mi){
        mi.style.borderColor = accent + '88';
        mi.style.color = '#ffffff';
    }

    var miniBeats = gid('mini-beats-bg');
    if(miniBeats) {
        if(S.ip) {
            miniBeats.classList.remove('opacity-0');
            miniBeats.classList.add('opacity-100');
            miniBeats.querySelectorAll('.mini-beat-bar').forEach(function(b){ b.style.animationPlayState = 'running'; });
        } else {
            miniBeats.classList.remove('opacity-100');
            miniBeats.classList.add('opacity-30');
            miniBeats.querySelectorAll('.mini-beat-bar').forEach(function(b){ b.style.animationPlayState = 'paused'; });
        }
    }

    try {
        if (typeof Home !== 'undefined' && typeof Home.renderActive === 'function') Home.renderActive();
        if (typeof Album !== 'undefined' && typeof Album.renderActive === 'function') Album.renderActive();
        if (typeof Search !== 'undefined' && typeof Search.renderActive === 'function') Search.renderActive();
        if (typeof Artist !== 'undefined' && typeof Artist.renderActive === 'function') Artist.renderActive();
    } catch(e) {}
}

function setMetaTag(name, content, isProperty) {
    var attr = isProperty ? 'property' : 'name';
    var el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setFavicon(url) {
    var targetUrl = url || '/logo.png';

    // Remove existing favicon tags to force browsers to re-render dynamic favicons
    var existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach(function(el) {
        if (el.parentNode) el.parentNode.removeChild(el);
    });

    var newIcon = document.createElement('link');
    newIcon.rel = 'icon';
    newIcon.href = targetUrl;
    document.head.appendChild(newIcon);

    var shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.href = targetUrl;
    document.head.appendChild(shortcutIcon);

    var appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = targetUrl;
    document.head.appendChild(appleIcon);
}

function updateCoverWithTransition(imgEl, newSrc, origCover, useScale) {
    if (!imgEl) return;
    var target = newSrc || origCover || 'https://www.gobox.my.id/file/R0ym4wqfznmp.png';
    if (origCover) imgEl.setAttribute('data-original-src', origCover);
    imgEl.removeAttribute('data-img-retry');

    var currentActive = imgEl.getAttribute('data-active-hd-src');
    if (currentActive === target && imgEl.src && imgEl.src.indexOf(target) !== -1) return;

    imgEl.setAttribute('data-active-hd-src', target);

    // Apply smooth feather transition style
    imgEl.style.transition = useScale ? 'opacity 0.28s cubic-bezier(0.25, 1, 0.5, 1), transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)' : 'opacity 0.28s cubic-bezier(0.25, 1, 0.5, 1)';
    imgEl.style.opacity = '0.35';
    if (useScale) imgEl.style.transform = 'scale(0.96)';

    // Immediately set src so image changes right away and doesn't get stuck showing previous track cover
    imgEl.src = target;

    var tempImg = new Image();
    tempImg.onload = function() {
        imgEl.src = target;
        imgEl.style.opacity = '1';
        if (useScale) imgEl.style.transform = 'scale(1)';
    };
    tempImg.onerror = function() {
        if (origCover && origCover !== target) {
            imgEl.src = origCover;
        } else {
            handleImgError(imgEl);
        }
        imgEl.style.opacity = '1';
        if (useScale) imgEl.style.transform = 'scale(1)';
    };
    tempImg.src = target;
}

function updateOG(title, cover, artist) {
    if (title && cover) {
        var fullTitle = artist ? (title + ' - ' + artist) : title;
        var docTitle = fullTitle + ' | MusifyRik';
        var description = 'Dengarkan ' + fullTitle + ' di MusifyRik';

        document.title = docTitle;

        setMetaTag('og:title', fullTitle, true);
        setMetaTag('og:description', description, true);
        setMetaTag('og:image', cover, true);
        setMetaTag('og:image:width', '600', true);
        setMetaTag('og:image:height', '600', true);
        setMetaTag('og:url', location.href, true);
        setMetaTag('twitter:card', 'summary_large_image', false);
        setMetaTag('twitter:title', fullTitle, false);
        setMetaTag('twitter:description', description, false);
        setMetaTag('twitter:image', cover, false);

        setFavicon(cover);
    } else {
        var defaultCover = 'https://www.gobox.my.id/file/R0ym4wqfznmp.png';
        document.title = 'MusifyRik';

        setMetaTag('og:title', 'MusifyRik', true);
        setMetaTag('og:description', 'MusifyRik - Web Music Player', true);
        setMetaTag('og:image', defaultCover, true);
        setMetaTag('og:image:width', '600', true);
        setMetaTag('og:image:height', '600', true);
        setMetaTag('og:url', location.href, true);
        setMetaTag('twitter:card', 'summary_large_image', false);
        setMetaTag('twitter:title', 'MusifyRik', false);
        setMetaTag('twitter:description', 'MusifyRik - Web Music Player', false);
        setMetaTag('twitter:image', defaultCover, false);

        setFavicon(null);
    }
}

function updateOGForArtist(artistName, coverUrl) {
    if (!artistName) return;
    var name = cn(artistName);
    var docTitle = name + ' - Artist | MusifyRik';
    var description = 'Dengarkan lagu dan album terbaik dari ' + name + ' di MusifyRik';
    var cover = (coverUrl && coverUrl !== FI) ? coverUrl : 'https://www.gobox.my.id/file/R0ym4wqfznmp.png';

    document.title = docTitle;

    setMetaTag('og:title', name + ' (Artist)', true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', cover, true);
    setMetaTag('og:image:width', '600', true);
    setMetaTag('og:image:height', '600', true);
    setMetaTag('og:url', location.href, true);
    setMetaTag('twitter:card', 'summary_large_image', false);
    setMetaTag('twitter:title', name + ' (Artist)', false);
    setMetaTag('twitter:description', description, false);
    setMetaTag('twitter:image', cover, false);

    setFavicon(cover);
}

function updateOGForAlbum(albumTitle, coverUrl, artistName) {
    if (!albumTitle) return;
    var title = albumTitle;
    var fullTitle = artistName ? (title + ' - ' + artistName) : title;
    var docTitle = fullTitle + ' - Album | MusifyRik';
    var description = 'Dengarkan album ' + fullTitle + ' di MusifyRik';
    var cover = (coverUrl && coverUrl !== FI) ? coverUrl : 'https://www.gobox.my.id/file/R0ym4wqfznmp.png';

    document.title = docTitle;

    setMetaTag('og:title', fullTitle + ' (Album)', true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', cover, true);
    setMetaTag('og:image:width', '600', true);
    setMetaTag('og:image:height', '600', true);
    setMetaTag('og:url', location.href, true);
    setMetaTag('twitter:card', 'summary_large_image', false);
    setMetaTag('twitter:title', fullTitle + ' (Album)', false);
    setMetaTag('twitter:description', description, false);
    setMetaTag('twitter:image', cover, false);

    setFavicon(cover);
}

function UU(){
    resetAutoNextTransition();
    if(!S.ct) {
        updateOG(null);
        if(typeof MP !== 'undefined' && MP.hide) MP.hide();
        return;
    }
    var origCover = S.ct.cover || '';
    var hdCover = toHDCover(origCover, S.ct.videoId || S.ct.id);

    var mc=gid('mini-cover'),mt=gid('mini-title'),ma=gid('mini-artist'),fc=gid('full-cover'),ft=gid('full-title'),fa=gid('full-artist'),fh=gid('full-header-artist'),fb=gid('full-bg-blur'),fba=gid('full-bg-artwork');
    var ilc=gid('full-inline-lyrics-cover'),ilt=gid('full-inline-lyrics-title'),ila=gid('full-inline-lyrics-artist');
    if(mc) updateCoverWithTransition(mc, hdCover, origCover, false);
    if(mt) mt.innerText=S.ct.title;
    if(ma) ma.innerText=S.ct.artist;
    if(fc) {
        updateCoverWithTransition(fc, hdCover, origCover, true);
        fc.classList.remove('fp-cover-anim');
        void fc.offsetWidth;
        fc.classList.add('fp-cover-anim');
    }
    if(ft) ft.innerText=S.ct.title;
    if(fa) fa.innerText=S.ct.artist;
    if(fh) fh.innerText=S.ct.artist;
    if(fb) updateCoverWithTransition(fb, hdCover, origCover, false);
    if(fba) updateCoverWithTransition(fba, hdCover, origCover, false);
    if(ilc) ilc.src = hdCover || origCover || FI;
    if(ilt) ilt.innerText = S.ct.title || 'Unknown';
    if(ila) ila.innerText = S.ct.artist || 'Unknown';

    updateOG(S.ct.title, hdCover, S.ct.artist);
    if(typeof updateLikeButtons==='function')updateLikeButtons();
    if(typeof updateOfflineButtons==='function')updateOfflineButtons();
    if(typeof MP !== 'undefined' && MP.updateBeats) MP.updateBeats(S.ct);
    if(typeof FullPlayer !== 'undefined' && FullPlayer.updateBeats) FullPlayer.updateBeats(S.ct);
    updateMediaSessionMetadata(hdCover);
}
function updateMediaSessionMetadata(hdCover){
    if(!('mediaSession' in navigator) || !S.ct)return;
    try{
        var art = hdCover || S.ct.cover || '/logo.png';
        navigator.mediaSession.metadata = new MediaMetadata({
            title: S.ct.title || 'Unknown',
            artist: S.ct.artist || '',
            album: 'MusifyRik',
            artwork: [
                {src: art, sizes: '96x96', type: 'image/jpeg'},
                {src: art, sizes: '256x256', type: 'image/jpeg'},
                {src: art, sizes: '512x512', type: 'image/jpeg'}
            ]
        });
        updateMediaSessionPlaybackState();
    }catch(e){}
}

function PK(s,i){
    var l=[];
    if(s==='home1')l=(S.ht||[]).slice(0,6);
    else if(s==='home2')l=(S.ht||[]).slice(6,12);
    else if(s==='homecat')l=S.hc||[];
    else if(s==='search')l=S.sr||[];
    else if(s==='rec0')l=(S.rec0||[]).slice(0,6);
    else if(s==='rec1')l=(S.rec1||[]).slice(0,6);
    else if(s==='rec2')l=(S.rec2||[]).slice(0,6);
    else if(s==='liked')l=typeof getLikedSongs==='function'?getLikedSongs():[];
    else if(s==='offline')l=typeof getOfflineSongs==='function'?getOfflineSongs():[];
    else if(s==='recent')l=typeof getRecent==='function'?getRecent():[];
    else if(S.pl && S.pl.length > 0)l=S.pl;

    if((!l || !l[i]) && S.pl && S.pl[i]){
        l = S.pl;
    }

    if(!l || !l[i]) return;

    if(S.ct && ((S.ct.id && S.ct.id === l[i].id) || (S.ct.videoId && S.ct.videoId === l[i].videoId)) && AU.src && !AU.paused){
        TP();
        return;
    }

    S.ps=s;S.pl=l;S.pi=i;S.ct=l[i];
    var url=location.origin+'/play/'+(S.ct.videoId||S.ct.id);history.pushState({},'',url);
    UU();MP.show();S.il=true;UB();
    
    resetLyricsUI(S.ct.videoId||S.ct.id);
    loadTrack(S.ct);
}

function loadTrack(track,resumeAt){
    if(!track)return;
    recordRecent(track);
    var rv = track.videoId || track.id;
    audioRetryMap[rv] = 0;
    hasPrefetchedNext = false;
    isPreloadingNext = false;
    ST();
    try{AU.pause();}catch(e){}
    fetchAudioAndPlay(track,resumeAt);
}

async function fetchAudioAndPlay(track,resumeAt){
    S.il=true;UB();
    var vid = track.videoId || track.id;
    try{
        var audioUrl = audioUrlCache[vid];
        if (!audioUrl) {
            if (!navigator.onLine) {
                S.il = false; S.ip = false; UB();
                if(typeof showToast === 'function') showToast('Mode Offline: Lagu ini belum tersimpan di cache PWA');
                return;
            }
            var ytUrl=track.ytUrl||('https://youtube.com/watch?v='+vid);
            var r=await fetch(API.ytplay,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:ytUrl})});
            if(!r.ok) throw new Error('HTTP '+r.status);
            var d=await r.json();
            if(d&&d.status&&d.result&&d.result.download&&d.result.download.audio){
                audioUrl = d.result.download.audio;
                audioUrlCache[vid] = audioUrl;
                savePwaCaches();
            }
        }
        if(S.ct!==track)return;
        if(audioUrl){
            AU.removeAttribute('crossorigin');
            AU.src = audioUrl;
            if(resumeAt){
                var onMeta=function(){AU.currentTime=resumeAt;AU.removeEventListener('loadedmetadata',onMeta);};
                AU.addEventListener('loadedmetadata',onMeta);
            }
            var p = AU.play();
            if(p !== undefined && p.then){
                p.then(function(){
                    audioRetryMap[vid] = 0;
                    S.il = false;
                    S.ip = true;
                    UB();
                }).catch(function(err){
                    // Browser blocked autoplay or requires user interaction
                    S.il = false;
                    S.ip = false;
                    UB();
                });
            } else {
                S.il = false;
                UB();
            }
        }else{
            S.il=false;S.ip=false;UB();
            if(typeof showToast === 'function') showToast('Gagal memuat audio lagu ini');
        }
    }catch(e){
        if(S.ct===track){S.il=false;S.ip=false;UB();}
    }
}

function TP(){
    if(!S.ct)return;
    if(!AU.src){
        loadTrack(S.ct);
        return;
    }
    if(AU.paused){
        S.il=true;UB();
        var p = AU.play();
        if(p !== undefined && p.then){
            p.then(function(){
                S.il = false;
                S.ip = true;
                UB();
            }).catch(function(){
                S.il = false;
                S.ip = false;
                UB();
            });
        }
    } else {
        AU.pause();
        S.ip = false;
        S.il = false;
        UB();
    }
}

async function fetchAutoNextRecommendations(track) {
    if (!track) return false;
    try {
        var query = track.artist ? (track.artist + ' songs') : track.title;
        var r = await fetch(API.search + '?query=' + encodeURIComponent(query));
        var d = await r.json();
        if (d && d.status && d.result && d.result.songs && d.result.songs.length > 0) {
            var currId = track.videoId || track.id;
            var newSongs = d.result.songs.filter(function(s) {
                return (s.videoId || s.id) !== currId;
            });
            if (newSongs.length > 0) {
                S.pl = S.pl.concat(newSongs);
                return true;
            }
        }
    } catch (e) {}
    return false;
}

async function NX(){
    if(!S.pl || !S.pl.length){
        if(S.ct){ S.pl = [S.ct]; S.pi = 0; }
        else { return; }
    }

    // Shuffle: advance through the pre-built shuffled order (no repeats until full cycle)
    if(S.isShuffle && S.pl.length > 1){
        var ri = nextShuffleIndex();
        if(ri >= 0 && ri < S.pl.length){ PK(S.ps || 'queue', ri); }
        return;
    }

    var ni = S.pi + 1;
    if(ni >= S.pl.length){
        // End of queue
        if(S.autoNext && S.ct){
            S.il = true; UB();
            var fetched = false;
            try { fetched = await fetchAutoNextRecommendations(S.ct); } catch(e){}
            S.il = false; UB();
            if(fetched){ PK(S.ps || 'queue', S.pi + 1); return; }
        }
        if(S.rm === 'off'){
            AU.pause();
            S.ip = false; S.il = false; UB();
            if(typeof showToast==='function') showToast('Akhir antrian');
        } else {
            PK(S.ps || 'queue', 0);
        }
        return;
    }
    PK(S.ps || 'queue', ni);
}
function PV(){
    if(!S.pl || !S.pl.length) return;
    if(S.pt > 3){
        AU.currentTime = 0;
        S.pt = 0;
        renderProgress();
        return;
    }
    if(S.isShuffle && S.pl.length > 1){
        var pi = prevShuffleIndex();
        if(pi >= 0 && pi < S.pl.length){ PK(S.ps || 'queue', pi); }
        return;
    }
    var pn = S.pi - 1;
    if(pn < 0) pn = S.pl.length - 1;
    PK(S.ps || 'queue', pn);
}
function SK(v){
    if(AU.duration){
        var ct=(parseFloat(v)/100)*AU.duration;
        AU.currentTime=ct;
        S.pt=ct;
        renderProgress();
    }
}
function TR(){
    if(S.rm==='all') S.rm='one';
    else if(S.rm==='one') S.rm='off';
    else S.rm='all';
    try { localStorage.setItem('rikiz_repeat_mode', S.rm); } catch(e) {}
    updateRepeatUI();
    if(typeof showToast === 'function'){
        showToast(S.rm==='all' ? 'Ulangi semua lagu' : (S.rm==='one' ? 'Ulangi satu lagu' : 'Ulangi dimatikan'));
    }
}
function updateRepeatUI(){
    var b = gid('btn-repeat');
    if(!b) return;
    if(S.rm==='one'){
        b.style.color = 'var(--accent)';
        b.innerHTML = '<i data-lucide="repeat-1" class="w-4 h-4"></i>';
    } else if(S.rm==='all'){
        b.style.color = 'var(--accent)';
        b.innerHTML = '<i data-lucide="repeat" class="w-4 h-4"></i>';
    } else {
        b.style.color = 'rgba(255,255,255,0.45)';
        b.innerHTML = '<i data-lucide="repeat" class="w-4 h-4"></i>';
    }
    if(window.lucide && lucide.createIcons) lucide.createIcons();
}
function updateShuffleUI(){
    var btn = gid('full-shuffle-btn');
    var dot = gid('full-shuffle-dot');
    var accent = 'var(--accent)';
    if(btn){
        if(S.isShuffle){
            btn.style.color = accent;
            if(dot){ dot.classList.remove('hidden'); dot.style.backgroundColor = accent; }
        }else{
            btn.style.color = 'rgba(255,255,255,0.45)';
            if(dot) dot.classList.add('hidden');
        }
    }
}
function toggleAutoNext(){
    S.autoNext = !S.autoNext;
    try { localStorage.setItem('rikiz_auto_next', S.autoNext); } catch(e) {}
    if(typeof showToast === 'function'){
        showToast(S.autoNext ? 'Auto Next diaktifkan' : 'Auto Next dimatikan');
    }
}
function buildShuffleOrder(){
    var n = S.pl ? S.pl.length : 0;
    if(!n){ S.shuffleOrder = []; S.shufflePos = 0; return; }
    var cur = (S.pi >= 0 && S.pi < n) ? S.pi : 0;
    var order = [cur];
    var others = [];
    for(var i=0;i<n;i++){ if(i!==cur) others.push(i); }
    for(var j=others.length-1;j>0;j--){
        var k = Math.floor(Math.random()*(j+1));
        var tmp = others[j]; others[j] = others[k]; others[k] = tmp;
    }
    order = order.concat(others);
    S.shuffleOrder = order;
    S.shufflePos = 0;
}
function nextShuffleIndex(){
    if(!S.shuffleOrder || !S.shuffleOrder.length) buildShuffleOrder();
    S.shufflePos++;
    if(S.shufflePos >= S.shuffleOrder.length){
        buildShuffleOrder();
        S.shufflePos = (S.shuffleOrder && S.shuffleOrder.length > 1) ? 1 : 0;
    }
    return S.shuffleOrder[S.shufflePos];
}
function prevShuffleIndex(){
    if(!S.shuffleOrder || !S.shuffleOrder.length) buildShuffleOrder();
    S.shufflePos--;
    if(S.shufflePos < 0) S.shufflePos = S.shuffleOrder.length - 1;
    return S.shuffleOrder[S.shufflePos];
}
function SF(){
    S.isShuffle = !S.isShuffle;
    if(S.isShuffle){ buildShuffleOrder(); }
    else { S.shuffleOrder = null; S.shufflePos = 0; }
    updateShuffleUI();
    if(typeof showToast === 'function'){
        showToast(S.isShuffle ? 'Mode acak (Shuffle) diaktifkan' : 'Mode acak (Shuffle) dimatikan');
    }
}

function shareTrack(){
    if(!S.ct || !(S.ct.videoId || S.ct.id)) return;
    shareTrackFor(S.ct);
}

var fetchingLyricsVid = null;

function resetLyricsUI(vid){
    S.ld={vid:vid, type:'none',lines:[]};S.cli=-1;S.lyricOffset=0;
    var lc=gid('lyrics-loading'),cc=gid('lyrics-content'),ec=gid('lyrics-empty');
    var il=gid('full-inline-lyrics-loading'),ic=gid('full-inline-lyrics-content'),ie=gid('full-inline-lyrics-empty');
    
    if(lyricsCache[vid]) {
        S.ld = lyricsCache[vid];
    }

    if(lc)lc.classList.remove('hidden');
    if(il)il.classList.remove('hidden');

    if(cc){cc.classList.add('hidden');cc.innerHTML='';}
    if(ic){ic.classList.add('hidden');ic.innerHTML='';}

    if(ec)ec.classList.add('hidden');
    if(ie)ie.classList.add('hidden');
    updateSyncBadge();
    
    // Update header track info
    if (S.ct) {
        var cov = S.ct.cover || FI;
        ['lyrics-header-cover', 'lyrics-desktop-cover', 'lyrics-bg-blur'].forEach(function(id){
            var el = gid(id); if(el) updateCoverWithTransition(el, cov, cov, false);
        });
        ['lyrics-header-title', 'lyrics-desktop-title'].forEach(function(id){
            var el = gid(id); if(el) el.innerText = S.ct.title || 'Unknown';
        });
        ['lyrics-header-artist', 'lyrics-desktop-artist'].forEach(function(id){
            var el = gid(id); if(el) el.innerText = S.ct.artist || 'Unknown';
        });
        if (typeof FullPlayer !== 'undefined' && FullPlayer.updateBeats) {
            FullPlayer.updateBeats(S.ct);
        }
    }

    if(vid)FL(vid);
}

var lastUserLyricScroll = 0;
var lastUserInlineLyricScroll = 0;

function setupLyricScrollListener() {
    var container = gid('lyrics-scroll-container');
    if (container && !container._hasLyricScrollListener) {
        container._hasLyricScrollListener = true;
        var onUserTouch = function() {
            lastUserLyricScroll = Date.now();
        };
        container.addEventListener('touchstart', onUserTouch, { passive: true });
        container.addEventListener('touchmove', onUserTouch, { passive: true });
        container.addEventListener('wheel', onUserTouch, { passive: true });
        container.addEventListener('mousedown', onUserTouch, { passive: true });
    }

    var inlineContainer = gid('full-inline-lyrics-scroll');
    if (inlineContainer && !inlineContainer._hasLyricScrollListener) {
        inlineContainer._hasLyricScrollListener = true;
        var onUserInlineTouch = function() {
            lastUserInlineLyricScroll = Date.now();
        };
        inlineContainer.addEventListener('touchstart', onUserInlineTouch, { passive: true });
        inlineContainer.addEventListener('touchmove', onUserInlineTouch, { passive: true });
        inlineContainer.addEventListener('wheel', onUserInlineTouch, { passive: true });
        inlineContainer.addEventListener('mousedown', onUserInlineTouch, { passive: true });
    }
}

var lyricScrollAnim = null;
function smoothScrollLyricContainer(container, targetTop, duration) {
    if (!container) return;
    if (duration === 0) {
        container.scrollTop = targetTop;
        return;
    }
    try {
        container.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
    } catch (e) {
        container.scrollTop = targetTop;
    }
}

function renderLyricsDOM(ld) {
    var l=gid('lyrics-loading'),c=gid('lyrics-content'),e=gid('lyrics-empty');
    var il=gid('full-inline-lyrics-loading'),ic=gid('full-inline-lyrics-content'),ie=gid('full-inline-lyrics-empty');

    if(l) l.classList.add('hidden');
    if(il) il.classList.add('hidden');

    if (!ld || !ld.lines || ld.lines.length === 0) {
        if(e) e.classList.remove('hidden');
        if(ie) ie.classList.remove('hidden');
        if(c) c.classList.add('hidden');
        if(ic) ic.classList.add('hidden');
        return;
    }

    if(e) e.classList.add('hidden');
    if(ie) ie.classList.add('hidden');

    var html='';
    var inlineHtml='';
    var isPlain = ld.type === 'plain';

    ld.lines.forEach(function(li,i){
        var transHtml = '';
        if (li.translation && li.translation.trim()) {
            transHtml = '<span class="lyric-translation">(' + es(li.translation) + ')</span>';
        }
        if (isPlain) {
            html+='<p class="lyric-line text-left py-2.5 text-white/80 font-bold">'+es(li.text)+transHtml+'</p>';
            inlineHtml+='<p class="inline-lyric-line text-left py-1.5 text-white/80 font-bold">'+es(li.text)+transHtml+'</p>';
        } else {
            html+='<p class="lyric-line text-left py-2.5 cursor-pointer font-bold" data-time="'+li.time+'" onclick="SLT('+li.time+')">'+es(li.text)+transHtml+'</p>';
            inlineHtml+='<p class="inline-lyric-line text-left py-1.5 cursor-pointer font-bold" data-time="'+li.time+'" onclick="SLT('+li.time+')">'+es(li.text)+transHtml+'</p>';
        }
    });
    html+='<p class="text-left text-[#5a4e44] text-sm mt-12 mb-4 opacity-50 tracking-widest">——— end ———</p>';
    inlineHtml+='<p class="text-left text-[#5a4e44] text-xs mt-8 mb-2 opacity-50 tracking-widest">——— end ———</p>';

    if(c) {
         c.innerHTML='<div class="pt-2 pb-16 space-y-1 sm:space-y-2">'+html+'</div>';
         c.classList.remove('hidden');
         delete c._lyricLines;
         delete c._activeLine;
    }
    if(ic) {
         ic.innerHTML='<div class="pt-2 pb-16 space-y-1">'+inlineHtml+'</div>';
         ic.classList.remove('hidden');
         delete ic._lyricLines;
         delete ic._activeLine;
    }

    S.cli = -2;
    if (!isPlain) ULH(S.pt, true);
}

async function FL(vid){
    if (!vid) return;

    if (!lyricsCache[vid]) {
        var offlineList = typeof getOfflineSongs === 'function' ? getOfflineSongs() : [];
        var offlineTrack = offlineList.find(function(s){ return (s.videoId === vid || s.id === vid); });
        if (offlineTrack && offlineTrack.lyrics) {
            lyricsCache[vid] = offlineTrack.lyrics;
            if (typeof savePwaCaches === 'function') savePwaCaches();
        }
    }

    if (lyricsCache[vid] && lyricsCache[vid].lines && lyricsCache[vid].lines.length > 0) {
        S.ld = lyricsCache[vid];
        renderLyricsDOM(S.ld);
        return;
    }

    if (fetchingLyricsVid === vid) {
        return;
    }

    var l=gid('lyrics-loading'),c=gid('lyrics-content'),e=gid('lyrics-empty');
    var il=gid('full-inline-lyrics-loading'),ic=gid('full-inline-lyrics-content'),ie=gid('full-inline-lyrics-empty');

    if(l) l.classList.remove('hidden');
    if(il) il.classList.remove('hidden');

    if(c) { c.classList.add('hidden'); c.innerHTML=''; delete c._lyricLines; delete c._activeLine; }
    if(ic) { ic.classList.add('hidden'); ic.innerHTML=''; delete ic._lyricLines; delete ic._activeLine; }

    if(e) e.classList.add('hidden');
    if(ie) ie.classList.add('hidden');

    S.ld={vid:vid, type:'none',lines:[]};S.cli=-1;S.lyricOffset=0;updateSyncBadge();
    fetchingLyricsVid = vid;

    try{
        if (!navigator.onLine) {
            if (fetchingLyricsVid === vid) fetchingLyricsVid = null;
            var activeVid = S.ct ? (S.ct.videoId || S.ct.id) : null;
            var cachedOffline = lyricsCache[vid];
            if (!cachedOffline) {
                var offlineList = typeof getOfflineSongs === 'function' ? getOfflineSongs() : [];
                var offlineTrack = offlineList.find(function(s){ return (s.videoId === vid || s.id === vid); });
                if (offlineTrack && offlineTrack.lyrics) {
                    cachedOffline = offlineTrack.lyrics;
                    lyricsCache[vid] = cachedOffline;
                }
            }
            if (cachedOffline) {
                if (activeVid === vid) {
                    S.ld = cachedOffline;
                    renderLyricsDOM(S.ld);
                }
            } else if (activeVid === vid) {
                if(l)l.classList.add('hidden');if(e)e.classList.remove('hidden');
                if(il)il.classList.add('hidden');if(ie)ie.classList.remove('hidden');
            }
            return;
        }

        var curTitle = (S.ct && S.ct.title) ? '&title=' + encodeURIComponent(S.ct.title) : '';
        var curArtist = (S.ct && S.ct.artist) ? '&artist=' + encodeURIComponent(S.ct.artist) : '';
        var r = await fetch(API.lyrics + '?id=' + vid + curTitle + curArtist);
        var d=await r.json();

        if (fetchingLyricsVid === vid) {
            fetchingLyricsVid = null;
        }

        var activeVid = S.ct ? (S.ct.videoId || S.ct.id) : null;

        if(d.status && d.result && d.result.lyrics && d.result.lyrics.lines && d.result.lyrics.lines.length > 0){
            var resLyrics = {
                vid: vid,
                type: d.result.lyrics.type,
                lines: d.result.lyrics.lines
            };
            lyricsCache[vid] = resLyrics;
            savePwaCaches();
            if (activeVid === vid) {
                S.ld = resLyrics;
                renderLyricsDOM(S.ld);
            }
        }else{
            var emptyLyrics = { vid: vid, type: 'none', lines: [] };
            lyricsCache[vid] = emptyLyrics;
            savePwaCaches();
            if (activeVid === vid) {
                S.ld = emptyLyrics;
                renderLyricsDOM(S.ld);
            }
        }
    }catch(er){
        if (fetchingLyricsVid === vid) {
            fetchingLyricsVid = null;
        }
        var activeVid = S.ct ? (S.ct.videoId || S.ct.id) : null;
        if (activeVid === vid) {
            if(l)l.classList.add('hidden');if(e)e.classList.remove('hidden');
            if(il)il.classList.add('hidden');if(ie)ie.classList.remove('hidden');
        }
    }
}

function ULH(ct, forceScroll){
    if(!S.ld || !S.ld.lines || S.ld.lines.length===0 || S.ld.type === 'plain') return;
    
    // Slight time lead (+0.18s) to trigger highlighting exactly as vocal begins
    var checkTime = ct + 0.18;
    var ni=-1;
    for(var i=0; i<S.ld.lines.length; i++){
        if(checkTime >= S.ld.lines[i].time){ ni=i; }
    }
    var off=S.lyricOffset||0;
    var ei=ni+off;
    if(ei<-1) ei=-1;
    if(ei>S.ld.lines.length-1) ei=S.ld.lines.length-1;
    
    if(ei === S.cli && !forceScroll) return;
    S.cli = ei;

    // 1. Fullscreen Overlay Lyrics Container
    if (S.lo) {
        var container = gid('lyrics-scroll-container');
        var content = gid('lyrics-content');
        if(content) {
            if(!content._lyricLines || content._lyricLines.length === 0){
                content._lyricLines = content.querySelectorAll('.lyric-line');
            }

            if(content._lyricLines && content._lyricLines.length > 0) {
                content._lyricLines.forEach(function(line, idx){
                    if(idx === ei) {
                        line.classList.add('active-lyric');
                        line.classList.remove('past-lyric');
                    } else if (idx < ei) {
                        line.classList.remove('active-lyric');
                        line.classList.add('past-lyric');
                    } else {
                        line.classList.remove('active-lyric');
                        line.classList.remove('past-lyric');
                    }
                });
            }

            if(ei >= 0 && content._lyricLines) {
                var targetLine = content._lyricLines[ei];
                if(targetLine && container && (forceScroll || Date.now() - lastUserLyricScroll > 2500)) {
                    var targetTop = targetLine.offsetTop;
                    var targetHeight = targetLine.offsetHeight;
                    var containerHeight = container.clientHeight;
                    var offset = Math.max(0, Math.floor(targetTop - (containerHeight / 2) + (targetHeight / 2)));
                    smoothScrollLyricContainer(container, offset, forceScroll ? 0 : 300);
                }
            }
        }
    }

    // 2. Compact Inline FullPlayer Cover Lyrics Container
    var inlineContainer = gid('full-inline-lyrics-scroll');
    var inlineContent = gid('full-inline-lyrics-content');
    if(inlineContent) {
        if(!inlineContent._lyricLines || inlineContent._lyricLines.length === 0){
            inlineContent._lyricLines = inlineContent.querySelectorAll('.inline-lyric-line');
        }

        if(inlineContent._lyricLines && inlineContent._lyricLines.length > 0) {
            inlineContent._lyricLines.forEach(function(line, idx){
                if(idx === ei) {
                    line.classList.add('active-lyric');
                    line.classList.remove('past-lyric');
                } else if (idx < ei) {
                    line.classList.remove('active-lyric');
                    line.classList.add('past-lyric');
                } else {
                    line.classList.remove('active-lyric');
                    line.classList.remove('past-lyric');
                }
            });
        }

        if(ei >= 0 && inlineContent._lyricLines) {
            var targetInlineLine = inlineContent._lyricLines[ei];
            if(targetInlineLine && inlineContainer && (forceScroll || Date.now() - lastUserInlineLyricScroll > 2500)) {
                var targetInlineTop = targetInlineLine.offsetTop;
                var targetInlineHeight = targetInlineLine.offsetHeight;
                var containerInlineHeight = inlineContainer.clientHeight;
                var inlineOffset = Math.max(0, Math.floor(targetInlineTop - (containerInlineHeight / 2) + (targetInlineHeight / 2)));
                smoothScrollLyricContainer(inlineContainer, inlineOffset, forceScroll ? 0 : 250);
            }
        }
    }
}

function SLT(t){
    if(AU){
        AU.currentTime=t;
        S.pt=t;
        ULH(t, true);
    }
}

function adjustLyricSync(delta){
    if(!S.ld||!S.ld.lines||S.ld.lines.length===0){showToast('Lirik belum tersedia');return;}
    var max=S.ld.lines.length-1;
    S.lyricOffset=(S.lyricOffset||0)+delta;
    if(S.lyricOffset>max)S.lyricOffset=max;
    if(S.lyricOffset<-max)S.lyricOffset=-max;
    S.cli=-2;
    ULH(S.pt, true);
    updateSyncBadge();
    showToast((delta>0?'Lirik maju':'Lirik mundur')+' 1 baris');
}
function lyricSyncNext(){adjustLyricSync(1);}
function lyricSyncPrev(){adjustLyricSync(-1);}
function updateSyncBadge(){
    var o=S.lyricOffset||0;
    var badgeText = o===0 ? '' : (o>0?'+':'')+o;
    var dBadge = gid('lyric-sync-badge-desktop');
    var mBadge = gid('lyric-sync-badge-mobile');
    var iBadge = gid('full-inline-sync-badge');
    
    if(o===0){
        if(dBadge) dBadge.classList.add('hidden');
        if(mBadge) mBadge.classList.add('hidden');
        if(iBadge) iBadge.classList.add('hidden');
    }else{
        if(dBadge){ dBadge.classList.remove('hidden'); dBadge.innerText=badgeText; }
        if(mBadge){ mBadge.classList.remove('hidden'); mBadge.innerText=badgeText; }
        if(iBadge){ iBadge.classList.remove('hidden'); iBadge.innerText=badgeText; }
    }
}

function toggleLyrics(){
    var o=gid('lyrics-overlay');
    var fp=gid('full-player');
    if(S.lo){
        o.style.transform='translateY(100%)';
        setTimeout(function(){o.style.display='none';},350);
        S.lo=false;
        if(S.lfp) {
            S.lfp = false;
            if(typeof FullPlayer!=='undefined') FullPlayer.open();
        } else {
            if(typeof MP!=='undefined') MP.show();
        }
    }else{
        var isFpOpen = (typeof FullPlayer !== 'undefined' && FullPlayer.isOpen) || 
                       (fp && fp.style.display === 'flex' && fp.style.transform !== 'translate3d(0, 100%, 0)' && fp.style.transform !== 'translate3d(0px, 100%, 0px)' && fp.style.transform !== 'translateY(100%)');
        
        if(isFpOpen) {
            S.lfp = true;
            if(typeof FullPlayer!=='undefined') FullPlayer.close();
        } else {
            S.lfp = false;
        }

        o.style.display='flex';
        
        // Update header track info
        if (S.ct) {
            ['lyrics-header-cover', 'lyrics-desktop-cover', 'lyrics-bg-blur'].forEach(function(id){
                var el = gid(id); if(el) el.src = S.ct.cover || FI;
            });
            ['lyrics-header-title', 'lyrics-desktop-title'].forEach(function(id){
                var el = gid(id); if(el) el.innerText = S.ct.title || 'Unknown';
            });
            ['lyrics-header-artist', 'lyrics-desktop-artist'].forEach(function(id){
                var el = gid(id); if(el) el.innerText = S.ct.artist || 'Unknown';
            });
        }
        
        requestAnimationFrame(function(){
            requestAnimationFrame(function(){
                o.style.transform='translateY(0)';
            });
        });
        S.lo=true;
        if(!S.lfp) MP.hide();
        setupLyricScrollListener();
        if(S.ct&&S.ct.videoId&&S.ld.lines.length===0){
            FL(S.ct.videoId);
        } else {
            S.cli = -2;
            ULH(S.pt, true);
        }
    }
}

// ============================================================
// MUSIFYRIK 3.0 — RECENTLY PLAYED / QUEUE / TRACK MENU / SHARE
// ============================================================

// ---- Recently Played (persistent, capped at 20) ----
function getRecent(){
    try { return JSON.parse(localStorage.getItem('rikiz_recent') || '[]'); } catch(e) { return []; }
}
function recordRecent(track){
    if(!track) return;
    var vId = track.videoId || track.id;
    if(!vId) return;
    try {
        var list = getRecent().filter(function(t){ return (t.videoId || t.id) !== vId; });
        list.unshift({
            id: vId, videoId: vId,
            title: track.title || 'Unknown',
            artist: track.artist || 'Unknown',
            cover: track.cover || toHDCover('', vId),
            artistId: track.artistId || '',
            ytUrl: track.ytUrl || ('https://youtube.com/watch?v=' + vId)
        });
        if(list.length > 20) list = list.slice(0, 20);
        localStorage.setItem('rikiz_recent', JSON.stringify(list));
    } catch(e) {}
}

// ---- Resolve a track by (source, index) — same rules as PK ----
function resolveTrack(source, index){
    var l = [];
    if(source==='home1') l=(S.ht||[]).slice(0,6);
    else if(source==='home2') l=(S.ht||[]).slice(6,12);
    else if(source==='homecat') l=S.hc||[];
    else if(source==='search') l=S.sr||[];
    else if(source==='rec0') l=(S.rec0||[]).slice(0,6);
    else if(source==='rec1') l=(S.rec1||[]).slice(0,6);
    else if(source==='rec2') l=(S.rec2||[]).slice(0,6);
    else if(source==='liked') l=(typeof getLikedSongs==='function')?getLikedSongs():[];
    else if(source==='offline') l=(typeof getOfflineSongs==='function')?getOfflineSongs():[];
    else if(source==='recent') l=getRecent();
    else if(S.pl && S.pl.length > 0) l=S.pl;
    if((!l || !l[index]) && S.pl && S.pl[index]) l = S.pl;
    return (l && l[index]) || null;
}

// ---- Queue helpers ----
function addToQueue(track){
    if(!track) return;
    S.pl = S.pl || [];
    S.pl.push(track);
    if(typeof refreshQueue === 'function') refreshQueue();
    if(typeof showToast === 'function') showToast('Ditambahkan ke antrian');
}
function playNext(track){
    if(!track) return;
    if(!S.ct){
        S.pl = S.pl || [];
        S.pl.push(track);
        PK('queue', S.pl.length - 1);
        return;
    }
    S.pl = S.pl || [];
    S.pl.splice(S.pi + 1, 0, track);
    if(typeof refreshQueue === 'function') refreshQueue();
    if(typeof showToast === 'function') showToast('Akan diputar berikutnya');
}
function removeFromQueue(index){
    if(!S.pl) return;
    if(index === S.pi){
        var wasPlaying = S.ip;
        S.pl.splice(index, 1);
        if(S.pl.length === 0){
            S.ct = null; S.pi = -1;
            try { AU.pause(); AU.removeAttribute('src'); AU.load(); } catch(e){}
            S.ip = false; S.il = false; UB(); UU();
            if(typeof MP !== 'undefined' && MP.hide) MP.hide();
            if(typeof refreshQueue === 'function') refreshQueue();
            return;
        }
        if(index >= S.pl.length) index = S.pl.length - 1;
        S.pi = index; S.ct = S.pl[index];
        UU(); S.il = true; UB();
        resetLyricsUI(S.ct.videoId || S.ct.id);
        loadTrack(S.ct);
    } else {
        if(index < S.pi) S.pi--;
        S.pl.splice(index, 1);
    }
    if(typeof refreshQueue === 'function') refreshQueue();
}
function clearQueue(){
    var cur = S.ct;
    S.pl = cur ? [cur] : [];
    S.pi = cur ? 0 : -1;
    if(typeof refreshQueue === 'function') refreshQueue();
    if(typeof showToast === 'function') showToast('Antrian dibersihkan');
}
function moveQueueItem(from, to){
    if(!S.pl || from < 0 || to < 0 || from >= S.pl.length || to >= S.pl.length) return;
    var item = S.pl.splice(from, 1)[0];
    S.pl.splice(to, 0, item);
    // keep pi pointing at the same track
    if(from === S.pi) S.pi = to;
    else if(from < S.pi && to >= S.pi) S.pi--;
    else if(from > S.pi && to <= S.pi) S.pi++;
    if(typeof refreshQueue === 'function') refreshQueue();
}

// ---- Three-dot track menu ----
function openTrackMenu(source, index){
    var track = resolveTrack(source, index);
    if(track) openTrackMenuFor(track);
}
function openTrackMenuFor(track){
    if(!track) return;
    S.menuTrack = track;
    var vId = track.videoId || track.id;
    var liked = isLikedSong(vId);
    var popup = document.createElement('div');
    popup.id = 'track-menu-popup';
    popup.className = 'fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
    popup.onclick = function(e){ if(e.target === popup) closeTrackMenu(); };

    var rows = [
        { icon: 'play', label: 'Putar Sekarang', act: 'menuPlayNow()' },
        { icon: 'skip-forward', label: 'Putar Berikutnya', act: 'menuPlayNext()' },
        { icon: 'list-plus', label: 'Tambahkan ke Antrian', act: 'menuAddQueue()' },
        { icon: 'folder-plus', label: 'Tambahkan ke Playlist', act: 'menuAddPlaylist()' },
        { icon: 'heart', label: liked ? 'Hapus dari Disukai' : 'Tambahkan ke Disukai', act: 'menuFavorite()', red: liked },
        { icon: 'share-2', label: 'Bagikan', act: 'menuShare()' },
        { icon: 'info', label: 'Info Lagu', act: 'menuInfo()' }
    ];
    var rowsHtml = rows.map(function(r){
        return '<button class="w-full text-left p-3.5 rounded-xl hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer" onclick="' + r.act + '">' +
            '<span class="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 ' + (r.red ? 'text-rose-400' : 'text-white') + '"><i data-lucide="' + r.icon + '" class="w-[18px] h-[18px]"></i></span>' +
            '<span class="text-sm font-medium ' + (r.red ? 'text-rose-300' : 'text-white/90') + '">' + r.label + '</span>' +
        '</button>';
    }).join('');

    popup.innerHTML = '<div class="w-full max-w-md rounded-t-3xl p-4 pb-6 border-t border-white/10 glass-strong" style="animation:slideUp 0.3s ease-out forwards; background: var(--bg-color);">' +
        '<div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>' +
        '<div class="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-white/5 mx-1">' +
            '<img src="' + (track.cover || FI) + '" class="w-12 h-12 rounded-xl object-cover shrink-0" onerror="handleImgError(this)" alt="' + es(track.title || '') + '" />' +
            '<div class="min-w-0 flex-1">' +
                '<h4 class="font-bold text-white text-sm truncate">' + es(track.title || 'Unknown') + '</h4>' +
                '<p class="text-xs text-white/50 truncate">' + es(track.artist || 'Unknown') + '</p>' +
            '</div>' +
            '<button onclick="closeTrackMenu()" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 active:scale-90 transition shrink-0 cursor-pointer" aria-label="Tutup menu"><i data-lucide="x" class="w-4 h-4"></i></button>' +
        '</div>' +
        '<div class="space-y-1 px-1">' + rowsHtml + '</div>' +
    '</div>';
    document.body.appendChild(popup);
    if(window.lucide) lucide.createIcons();
}
function closeTrackMenu(){
    var el = document.getElementById('track-menu-popup');
    if(el) el.remove();
    S.menuTrack = null;
}
function menuPlayNow(){ var t = S.menuTrack; closeTrackMenu(); if(t) PKByTrack(t); }
function menuPlayNext(){ var t = S.menuTrack; closeTrackMenu(); if(t) playNext(t); }
function menuAddQueue(){ var t = S.menuTrack; closeTrackMenu(); if(t) addToQueue(t); }
function menuAddPlaylist(){
    var t = S.menuTrack; closeTrackMenu();
    if(!t) return;
    if(getUserPlaylists().length === 0){ showToast('Belum ada playlist! Buat di Library dulu'); return; }
    showPlaylistPicker(t);
}
function menuFavorite(){ var t = S.menuTrack; closeTrackMenu(); if(t) toggleLikeSong(t); }
function menuShare(){ var t = S.menuTrack; closeTrackMenu(); if(t) shareTrackFor(t); }
function menuInfo(){ var t = S.menuTrack; closeTrackMenu(); if(t) openSongInfo(t); }

function PKByTrack(track){
    if(!track) return;
    var vId = track.videoId || track.id;
    var idx = -1;
    if(S.pl && S.pl.length){
        for(var i=0;i<S.pl.length;i++){
            var t = S.pl[i];
            if((t.videoId || t.id) === vId){ idx = i; break; }
        }
    }
    if(idx >= 0){
        PK(S.ps || 'queue', idx);
    } else {
        S.pl = S.pl || [];
        S.pl.push(track);
        PK('queue', S.pl.length - 1);
    }
}

// ---- Share helpers ----
function copyText(text, okMsg){
    if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
            showToast(okMsg || 'Tautan berhasil disalin!');
        }).catch(function(){ fallbackCopy(text, okMsg); });
    } else {
        fallbackCopy(text, okMsg);
    }
}
function fallbackCopy(text, okMsg){
    try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch(e) {}
        document.body.removeChild(ta);
        showToast(ok ? (okMsg || 'Tautan berhasil disalin!') : 'Gagal menyalin tautan');
    } catch(e) { showToast('Gagal menyalin tautan'); }
}
function shareTrackFor(track){
    if(!track || !(track.videoId || track.id)) return;
    var vId = track.videoId || track.id;
    var title = track.title || 'Lagu';
    var url = location.origin + '/play/' + vId + '?share=true&title=' + encodeURIComponent(title) + '&artist=' + encodeURIComponent(track.artist || '') + '&cover=' + encodeURIComponent(track.cover || '');
    if(navigator.share){
        navigator.share({ title: title, text: 'Dengarkan ' + title + (track.artist ? (' - ' + track.artist) : '') + ' di MusifyRik!', url: url }).catch(function(){});
    } else {
        copyText(url, 'Link lagu berhasil disalin!');
    }
}

// ---- Song info sheet ----
function openSongInfo(track){
    if(!track) return;
    var vId = track.videoId || track.id;
    var popup = document.createElement('div');
    popup.className = 'fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
    popup.onclick = function(e){ if(e.target === popup) popup.remove(); };
    popup.innerHTML = '<div class="w-full max-w-md rounded-t-3xl p-6 border-t border-white/10 glass-strong" style="animation:slideUp 0.3s ease-out forwards; background: var(--bg-color);">' +
        '<div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>' +
        '<div class="flex items-center gap-4 mb-5">' +
            '<img src="' + (track.cover || FI) + '" class="w-16 h-16 rounded-xl object-cover shrink-0" onerror="handleImgError(this)" alt="" />' +
            '<div class="min-w-0"><h3 class="font-bold text-white truncate">' + es(track.title || 'Unknown') + '</h3><p class="text-white/70 text-sm truncate">' + es(track.artist || 'Unknown') + '</p></div>' +
        '</div>' +
        '<div class="space-y-3 text-sm">' +
            '<div class="flex justify-between gap-4"><span class="text-white/50 shrink-0">Judul</span><span class="text-white font-medium text-right truncate">' + es(track.title || '-') + '</span></div>' +
            '<div class="flex justify-between gap-4"><span class="text-white/50 shrink-0">Artis</span><span class="text-white font-medium text-right truncate">' + es(track.artist || '-') + '</span></div>' +
            (track.duration ? '<div class="flex justify-between gap-4"><span class="text-white/50 shrink-0">Durasi</span><span class="text-white font-medium">' + es(track.duration) + '</span></div>' : '') +
            '<div class="flex justify-between gap-4"><span class="text-white/50 shrink-0">Video ID</span><span class="text-white font-mono text-xs">' + es(vId || '-') + '</span></div>' +
        '</div>' +
        '<button onclick="this.closest(\'.fixed\').remove()" class="w-full mt-5 py-3 rounded-full btn-chrome font-bold">Tutup</button>' +
    '</div>';
    document.body.appendChild(popup);
    if(window.lucide) lucide.createIcons();
}

// ---- Retry audio once on playback error (expired URL etc.) ----
async function refetchAudioAndResume(vid){
    try {
        if(!navigator.onLine){ S.il=false; S.ip=false; UB(); if(typeof showToast==='function') showToast('Tidak ada koneksi internet'); return; }
        var track = S.ct;
        if(!track) return;
        var ytUrl = track.ytUrl || ('https://youtube.com/watch?v=' + vid);
        var r = await fetch(API.ytplay, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query: ytUrl }) });
        if(!r.ok) throw new Error('HTTP ' + r.status);
        var d = await r.json();
        if(d && d.status && d.result && d.result.download && d.result.download.audio){
            audioUrlCache[vid] = d.result.download.audio;
            savePwaCaches();
            var pos = AU.currentTime || 0;
            AU.removeAttribute('crossorigin');
            AU.src = d.result.download.audio;
            var onMeta = function(){ try { AU.currentTime = pos; } catch(e){} AU.removeEventListener('loadedmetadata', onMeta); };
            AU.addEventListener('loadedmetadata', onMeta);
            AU.play().then(function(){ audioRetryMap[vid] = 0; S.il=false; S.ip=true; UB(); }).catch(function(){});
        } else {
            S.il=false; S.ip=false; UB();
            if(typeof showToast==='function') showToast('Gagal memutar lagu ini');
        }
    } catch(e) {
        S.il=false; S.ip=false; UB();
        if(typeof showToast==='function') showToast('Gagal memutar lagu ini');
    }
}

// LIKED SONGS SYSTEM
function getLikedSongs(){
    try{return JSON.parse(localStorage.getItem('rikiz_liked_songs')||'[]');}catch(e){return[];}
}
function saveLikedSongs(songs){
    try{localStorage.setItem('rikiz_liked_songs',JSON.stringify(songs));}catch(e){}
}
function isLikedSong(videoId){
    if(!videoId) return false;
    var songs = getLikedSongs();
    return songs.some(function(s){ return (s.videoId === videoId || s.id === videoId); });
}
function toggleLikeSong(track){
    if(!track) return;
    var vId = track.videoId || track.id;
    if(!vId) return;
    var songs = getLikedSongs();
    var index = songs.findIndex(function(s){ return (s.videoId === vId || s.id === vId); });
    if(index >= 0){
        songs.splice(index, 1);
        saveLikedSongs(songs);
        showToast('Dihapus dari Lagu Disukai');
    } else {
        songs.unshift({
            id: vId,
            videoId: vId,
            title: track.title || 'Unknown',
            artist: track.artist || 'Unknown',
            cover: track.cover || track.thumbnail || '',
            artistId: track.artistId || '',
            ytUrl: track.ytUrl || ('https://youtube.com/watch?v=' + vId)
        });
        saveLikedSongs(songs);
        showToast('Ditambahkan ke Lagu Disukai');
    }
    updateLikeButtons();
    if(S.at === 'library' && typeof Library !== 'undefined') {
        Library.render();
    }
    if(S.at === 'liked' && typeof App !== 'undefined' && App.renderLiked) {
        App.renderLiked();
    }
}
function toggleCurrentLike(){
    if(!S.ct) return;
    toggleLikeSong(S.ct);
}

// LIKED ARTISTS SYSTEM
function getLikedArtists(){
    try{return JSON.parse(localStorage.getItem('rikiz_liked_artists')||'[]');}catch(e){return[];}
}
function saveLikedArtists(artists){
    try{localStorage.setItem('rikiz_liked_artists',JSON.stringify(artists));}catch(e){}
}
function isArtistLiked(artistId){
    if(!artistId) return false;
    var artists = getLikedArtists();
    return artists.some(function(a){ return a.artistId === artistId; });
}
function toggleLikeArtist(artist){
    if(!artist || !artist.artistId) return;
    var artists = getLikedArtists();
    var index = artists.findIndex(function(a){ return a.artistId === artist.artistId; });
    if(index >= 0){
        artists.splice(index, 1);
        saveLikedArtists(artists);
        showToast('Dihapus dari Artist Disukai');
    } else {
        artists.unshift({
            artistId: artist.artistId,
            name: artist.name,
            thumbnail: artist.thumbnail
        });
        saveLikedArtists(artists);
        showToast('Ditambahkan ke Artist Disukai');
    }
    if(S.at === 'library' && typeof Library !== 'undefined') {
        Library.render();
    }
    if(typeof Artist !== 'undefined' && Artist.currentArtistId === artist.artistId) {
        Artist.updateLikeBtn();
    }
}

function updateLikeButtons(){
    var isLiked = S.ct ? isLikedSong(S.ct.videoId) : false;
    var miniBtn = gid('mini-like-btn');
    var fullBtn = gid('full-like-btn');

    if(miniBtn){
        if(isLiked){
            miniBtn.innerHTML = '<i data-lucide="heart" class="w-4 h-4 text-rose-500 fill-rose-500"></i>';
            miniBtn.classList.add('text-rose-500');
        } else {
            miniBtn.innerHTML = '<i data-lucide="heart" class="w-4 h-4"></i>';
            miniBtn.classList.remove('text-rose-500');
        }
    }

    if(fullBtn){
        if(isLiked){
            fullBtn.innerHTML = '<i data-lucide="heart" class="w-5 h-5 text-rose-500 fill-rose-500"></i>';
            fullBtn.classList.add('bg-rose-500/20', 'border-rose-500/40');
            fullBtn.classList.remove('bg-black/50', 'border-white/20');
        } else {
            fullBtn.innerHTML = '<i data-lucide="heart" class="w-5 h-5 text-white"></i>';
            fullBtn.classList.remove('bg-rose-500/20', 'border-rose-500/40');
            fullBtn.classList.add('bg-black/50', 'border-white/20');
        }
    }
    if(typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

// PLAYLIST SYSTEM
function getUserPlaylists(){
    try{
        var pls=JSON.parse(localStorage.getItem('rikiz_playlists')||'[]');
        var changed=false;
        pls.forEach(function(p){
            if(p.image && (p.image.includes('uZKDQkZ3c5VK.png') || p.image.includes('R0ym4wqfznmp.png') || p.image.includes('logo.png'))){
                p.image='';
                changed=true;
            }
            if(p.songs && p.songs.length){
                p.songs.forEach(function(s){
                    if(!s.cover || s.cover.includes('uZKDQkZ3c5VK.png') || s.cover.includes('logo.png')){
                        s.cover = toHDCover('', s.videoId);
                        changed=true;
                    }
                });
            }
            if(!p.image&&p.songs&&p.songs.length>0){
                p.image=p.songs[0].cover;
                changed=true;
            }
        });
        if(changed){
            localStorage.setItem('rikiz_playlists',JSON.stringify(pls));
        }
        return pls;
    }catch(e){return[];}
}
function saveUserPlaylists(pls){try{localStorage.setItem('rikiz_playlists',JSON.stringify(pls));}catch(e){}}
function createPlaylist(name,image){var pls=getUserPlaylists();var id='pl_'+Date.now();pls.push({id:id,name:name,image:image||'',songs:[]});saveUserPlaylists(pls);return id;}
function updateUserPlaylist(id,name,image){var pls=getUserPlaylists();var pl=pls.find(function(p){return p.id===id;});if(!pl)return;if(name)pl.name=name;if(image)pl.image=image;saveUserPlaylists(pls);}
function deleteUserPlaylist(id){var pls=getUserPlaylists().filter(function(p){return p.id!==id;});saveUserPlaylists(pls);}
function addToPlaylistById(playlistId,track){var pls=getUserPlaylists();var pl=pls.find(function(p){return p.id===playlistId;});if(!pl)return;if(pl.songs.length>=100){showToast('Playlist penuh (Max 100 lagu)');return;}var exists=pl.songs.find(function(s){return s.videoId===track.videoId;});if(!exists){pl.songs.push({id:track.id,videoId:track.videoId,title:track.title,artist:track.artist,cover:track.cover,artistId:track.artistId||'',ytUrl:track.ytUrl});if(!pl.image&&pl.songs.length===1){pl.image=track.cover;}saveUserPlaylists(pls);showToast('Ditambahkan ke '+pl.name);}else{showToast('Sudah ada di playlist');}}
var appToastTimeout = null;
function showToast(msg){
    var toast = gid('app-global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-global-toast';
        document.body.appendChild(toast);
    }
    if (appToastTimeout) clearTimeout(appToastTimeout);
    
    var m = (msg || '').toLowerCase();
    var iconSvg = '<svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

    if (/gagal|belum|penuh|batal|error|tidak/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    } else if (/hapus|dihapus/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';
    } else if (/disukai|suka/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-rose-400 shrink-0 fill-rose-400" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    } else if (/timer|tidur|menit/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    } else if (/acak|shuffle/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>';
    } else if (/volume|suara|mute/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
    } else if (/unduh|download|install/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    } else if (/link|salin|clipboard/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    } else if (/kecepatan/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-amber-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    } else if (/playlist|tersimpan/i.test(m)) {
        iconSvg = '<svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    }

    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] bg-black/85 text-white/90 text-[11px] font-medium px-3 py-1.5 rounded-full border border-white/10 shadow-sm flex items-center gap-1.5 pointer-events-none transition-all duration-150 opacity-0 translate-y-2 scale-95';
    toast.innerHTML = iconSvg + '<span class="truncate max-w-[80vw]">' + es(msg) + '</span>';
    
    requestAnimationFrame(function(){
        toast.classList.remove('opacity-0', 'translate-y-2', 'scale-95');
        toast.classList.add('opacity-100', 'translate-y-0', 'scale-100');
    });
    
    appToastTimeout = setTimeout(function(){
        if (toast) {
            toast.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
            toast.classList.add('opacity-0', 'translate-y-1', 'scale-95');
            setTimeout(function(){
                if (toast && toast.parentElement && toast.classList.contains('opacity-0')) {
                    toast.remove();
                }
            }, 150);
        }
    }, 1600);
}
function addCurrentToPlaylist(){if(!S.ct)return;var pls=getUserPlaylists();if(pls.length===0){showToast('Belum ada playlist! Buat di Library dulu');return;}showPlaylistPicker(S.ct);}
function showPlaylistPicker(track){
    S.pickerTrack = track || S.ct;
    var pls = getUserPlaylists();
    var popup = document.createElement('div');
    popup.className = 'fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
    popup.onclick = function(e){ if(e.target === popup) popup.remove(); };
    var listHtml = pls.map(function(p){
        return '<button onclick="addToPlaylistById(\'' + p.id + '\',S.pickerTrack);this.closest(\'.fixed\').remove();" class="w-full text-left p-4 hover:bg-white/5 flex items-center gap-3 border-b border-white/5 transition-colors cursor-pointer">' +
            '<img src="' + (p.image || (p.songs.length > 0 ? p.songs[0].cover : FI)) + '" class="w-10 h-10 rounded-lg object-cover shrink-0" onerror="this.src=\'' + FI + '\'" alt="" />' +
            '<div class="min-w-0"><p class="font-medium text-white truncate">' + es(p.name) + '</p><p class="text-white/50 text-xs">' + p.songs.length + ' lagu</p></div>' +
        '</button>';
    }).join('');
    popup.innerHTML = '<div class="w-full max-w-md rounded-t-3xl p-6 border-t border-white/10 glass-strong" style="animation:slideUp 0.3s ease-out forwards; background: var(--bg-color);">' +
        '<div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>' +
        '<h3 class="font-bold text-white mb-3">Tambah ke Playlist</h3>' +
        '<div class="max-h-72 overflow-y-auto hide-scrollbar">' + listHtml + '</div>' +
        '<button onclick="this.closest(\'.fixed\').remove()" class="w-full mt-3 py-3 border border-white/20 text-white rounded-full">Batal</button>' +
    '</div>';
    document.body.appendChild(popup);
}

// ============================================================
// SHARE CARD FEATURES
// ============================================================

function handleTrackEnded() {
    if (S.sleepEndWithTrack) {
        triggerSleep();
        return true;
    }
    return false;
}

var sleepIntervalId = null;

function startSleepTimer(minutes) {
    clearSleepTimer();
    var seconds = minutes * 60;
    S.sleepSecondsLeft = seconds;
    S.sleepEndWithTrack = false;
    
    updateSleepBadge();
    
    sleepIntervalId = setInterval(function() {
        if (S.sleepSecondsLeft > 0) {
            S.sleepSecondsLeft--;
            updateSleepBadge();
            var timerDisplay = gid('sleep-countdown-display');
            if (timerDisplay) {
                timerDisplay.innerText = fm(S.sleepSecondsLeft);
            }
        } else {
            triggerSleep();
        }
    }, 1000);
    
    showToast('Timer tidur diatur: ' + minutes + ' menit');
    closeSleepTimer();
}

function startSleepAtTrackEnd() {
    clearSleepTimer();
    S.sleepEndWithTrack = true;
    updateSleepBadge();
    showToast('Musik akan berhenti di akhir lagu ini');
    closeSleepTimer();
}

function clearSleepTimer() {
    if (sleepIntervalId) {
        clearInterval(sleepIntervalId);
        sleepIntervalId = null;
    }
    S.sleepSecondsLeft = 0;
    S.sleepEndWithTrack = false;
    updateSleepBadge();
    
    var popup = gid('sleep-timer-popup');
    if (popup) {
        closeSleepTimer();
        setTimeout(openSleepTimer, 100);
    }
}

function triggerSleep() {
    if (sleepIntervalId) {
        clearInterval(sleepIntervalId);
        sleepIntervalId = null;
    }
    S.sleepSecondsLeft = 0;
    S.sleepEndWithTrack = false;
    updateSleepBadge();
    
    if (AU) {
        try { AU.pause(); } catch(e){}
    }
    S.ip = false;
    UB();
    ST();
    showToast('Timer tidur selesai, musik dihentikan');
}

function updateSleepBadge() {
    var badge = gid('sleep-badge');
    var dot = gid('sleep-dot');
    if (!badge) return;
    
    if (S.sleepSecondsLeft > 0) {
        var mins = Math.ceil(S.sleepSecondsLeft / 60);
        badge.innerText = mins + 'm';
        if (dot) dot.classList.remove('hidden');
    } else if (S.sleepEndWithTrack) {
        badge.innerText = 'Akhir Lagu';
        if (dot) dot.classList.remove('hidden');
    } else {
        badge.innerText = 'Timer';
        if (dot) dot.classList.add('hidden');
    }
}

function openSleepTimer() {
    if (gid('sleep-timer-popup')) return;
    
    var popup = document.createElement('div');
    popup.id = 'sleep-timer-popup';
    popup.className = 'fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
    popup.onclick = function(e) { if(e.target === popup) closeSleepTimer(); };
    
    var contentHtml = '';
    
    if (S.sleepSecondsLeft > 0) {
        contentHtml = '<div class="text-center mb-6">' +
            '<p class="text-xs text-[#8a7668] uppercase tracking-wider mb-1">Timer Sedang Berjalan</p>' +
            '<h4 id="sleep-countdown-display" class="text-3xl font-black font-mono text-white">' + fm(S.sleepSecondsLeft) + '</h4>' +
            '<button onclick="clearSleepTimer()" class="mt-4 px-6 py-2.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all">Batalkan Timer</button>' +
        '</div>';
    } else if (S.sleepEndWithTrack) {
        contentHtml = '<div class="text-center mb-6">' +
            '<p class="text-sm text-[#e8d6c4] font-bold mb-1">Berhenti di akhir lagu aktif</p>' +
            '<p class="text-[11px] text-[#8a7668] mb-4">Lagu akan berhenti setelah lagu ini selesai diputar.</p>' +
            '<button onclick="clearSleepTimer()" class="px-6 py-2.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all">Batalkan Timer</button>' +
        '</div>';
    } else {
        var options = [5, 10, 15, 30, 45, 60];
        var gridHtml = options.map(function(m) {
            return '<button onclick="startSleepTimer(' + m + ')" class="py-3 px-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white font-medium hover:bg-white/10 active:scale-95 transition-all">' + m + ' Menit</button>';
        }).join('');
        
        contentHtml = '<div class="grid grid-cols-3 gap-3 mb-4">' + gridHtml + '</div>' +
            '<button onclick="startSleepAtTrackEnd()" class="w-full py-3.5 px-4 rounded-2xl bg-[#e8d6c4]/10 hover:bg-[#e8d6c4]/20 border border-white/10 text-xs text-white font-bold active:scale-95 transition-all flex items-center justify-center gap-2">' +
                '<i data-lucide="music-4" class="w-4 h-4"></i> Hentikan di Akhir Lagu' +
            '</button>';
    }
    
    popup.innerHTML = '<div class="w-full max-w-md rounded-t-3xl p-6 border-t border-white/10 glass-strong" style="animation:slideUp 0.3s ease-out forwards; background: var(--bg-color);">' +
        '<div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>' +
        '<div class="flex justify-between items-center mb-5">' +
            '<div>' +
                '<h3 class="font-black text-white text-lg">Timer Tidur</h3>' +
                '<p class="text-[#8a7668] text-xs">Hentikan musik secara otomatis saat tidur</p>' +
            '</div>' +
            '<button onclick="closeSleepTimer()" class="text-[#8a7668] hover:text-white p-1"><i data-lucide="x" class="w-5 h-5"></i></button>' +
        '</div>' +
        contentHtml +
    '</div>';
    
    document.body.appendChild(popup);
    lucide.createIcons();
}

function closeSleepTimer() {
    var p = gid('sleep-timer-popup');
    if (p) p.remove();
}

function openPlaybackSpeed() {
    if (gid('playback-speed-popup')) return;
    
    var popup = document.createElement('div');
    popup.id = 'playback-speed-popup';
    popup.className = 'fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
    popup.onclick = function(e) { if(e.target === popup) closePlaybackSpeed(); };
    
    var speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    var currentSpeed = S.playbackRate || 1.0;
    
    var optionsHtml = speeds.map(function(sp) {
        var isSelected = currentSpeed === sp;
        var btnStyle = isSelected 
            ? 'bg-[#e8d6c4] text-black font-bold border-[#e8d6c4]' 
            : 'bg-white/5 hover:bg-white/10 text-white border-white/5';
        var label = sp === 1.0 ? '1.0x (Normal)' : sp + 'x';
        return '<button onclick="setPlaybackSpeed(' + sp + ')" class="w-full py-3.5 px-4 rounded-2xl border text-sm font-medium active:scale-98 transition-all flex items-center justify-between ' + btnStyle + '">' +
            '<span>' + label + '</span>' +
            (isSelected ? '<i data-lucide="check" class="w-4 h-4 text-black"></i>' : '') +
        '</button>';
    }).join('');
    
    popup.innerHTML = '<div class="w-full max-w-md rounded-t-3xl p-6 border-t border-white/10 glass-strong" style="animation:slideUp 0.3s ease-out forwards; background: var(--bg-color); max-height: 80vh; overflow-y: auto;">' +
        '<div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>' +
        '<div class="flex justify-between items-center mb-5">' +
            '<div>' +
                '<h3 class="font-black text-white text-lg">Kecepatan Putar</h3>' +
                '<p class="text-[#8a7668] text-xs">Atur kecepatan putar lagu sesuai seleramu</p>' +
            '</div>' +
            '<button onclick="closePlaybackSpeed()" class="text-[#8a7668] hover:text-white p-1"><i data-lucide="x" class="w-5 h-5"></i></button>' +
        '</div>' +
        '<div class="flex flex-col gap-2 mb-4">' +
            optionsHtml +
        '</div>' +
    '</div>';
    
    document.body.appendChild(popup);
    lucide.createIcons();
}

function setPlaybackSpeed(speed) {
    S.playbackRate = speed;
    try {
        localStorage.setItem('rikiz_playback_rate', speed);
    } catch(e) {}
    
    applyPlaybackSpeed();
    closePlaybackSpeed();
    showToast('Kecepatan putar diatur ke ' + (speed === 1.0 ? 'Normal' : speed + 'x'));
}

function applyPlaybackSpeed() {
    var speed = S.playbackRate || 1.0;
    if (AU) {
        try { AU.playbackRate = speed; } catch(e) {}
    }
    updateSpeedBadge();
}

function updateSpeedBadge() {
    var badge = gid('speed-badge');
    if (!badge) return;
    var speed = S.playbackRate || 1.0;
    badge.innerText = speed === 1.0 ? 'Normal' : speed + 'x';
}

function closePlaybackSpeed() {
    var p = gid('playback-speed-popup');
    if (p) p.remove();
}

function openShareCard() {
    if (!S.ct) {
        showToast('Putar lagu terlebih dahulu');
        return;
    }

    var popup = document.createElement('div');
    popup.id = 'share-card-popup';
    popup.className = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4';
    popup.onclick = function(e) { if(e.target === popup) popup.remove(); };

    var accentRgb = (typeof S !== 'undefined' && S.currentAccentColor && S.currentAccentColor.indexOf('rgb') === 0)
        ? S.currentAccentColor.replace(/[^\d,]/g, '')
        : 'var(--accent-rgb)';

    popup.innerHTML = '<div class="share-card-anim w-full max-w-sm rounded-[28px] p-5 border border-white/10 text-center relative overflow-hidden" ' +
        'style="background: linear-gradient(180deg, rgba(' + accentRgb + ',0.35) 0%, #12100e 55%, #0b0a09 100%); box-shadow:0 24px 60px rgba(0,0,0,0.6);">' +
        '<div class="flex justify-between items-center mb-4 relative z-10">' +
            '<h3 class="font-bold text-base text-white">Bagikan Lagu</h3>' +
            '<button onclick="document.getElementById(\'share-card-popup\').remove()" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition cursor-pointer"><i data-lucide="x" class="w-4 h-4"></i></button>' +
        '</div>' +

        '<div id="share-card-preview" class="p-5 rounded-[22px] mb-5 flex flex-col items-center gap-4 relative overflow-hidden bg-black/30 backdrop-blur-xl border border-white/10">' +
            '<img src="' + S.ct.cover + '" class="w-full aspect-square max-w-[220px] object-cover rounded-2xl border border-white/10 shadow-2xl" />' +
            '<div class="w-full truncate">' +
                '<p class="text-white font-black text-xl truncate">' + es(S.ct.title) + '</p>' +
                '<p class="text-white/70 text-sm font-semibold mt-1 truncate">' + es(S.ct.artist) + '</p>' +
            '</div>' +
            '<div class="border-t border-white/10 w-full pt-3 mt-1 flex items-center justify-center gap-1.5">' +
                '<img src="/logo.png" class="w-3.5 h-3.5 object-contain opacity-90" onerror="this.style.display=\'none\'" />' +
                '<span class="text-[10px] text-white/60 tracking-[0.15em] font-bold uppercase">MusifyRik</span>' +
            '</div>' +
        '</div>' +

        '<div class="grid grid-cols-2 gap-2.5 relative z-10">' +
            '<button onclick="triggerNativeShare()" class="py-3 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 text-[#0b0a09] active:scale-95 transition cursor-pointer" style="background:linear-gradient(135deg, var(--accent), var(--accent-2));">' +
                '<i data-lucide="share-2" class="w-4 h-4"></i> Bagikan' +
            '</button>' +
            '<button onclick="copyShareLink()" class="py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-1.5 text-white bg-white/10 border border-white/15 hover:bg-white/15 active:scale-95 transition cursor-pointer">' +
                '<i data-lucide="copy" class="w-4 h-4"></i> Salin Link' +
            '</button>' +
        '</div>' +
        '<button onclick="downloadShareCard()" class="w-full mt-2.5 py-2.5 text-xs font-semibold text-white/70 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer relative z-10">' +
            '<i data-lucide="download" class="w-3.5 h-3.5"></i> Unduh Gambar Card' +
        '</button>' +
    '</div>';

    document.body.appendChild(popup);
    lucide.createIcons();
}

function copyShareLink() {
    if(!S.ct || !S.ct.videoId) return;
    var url = location.origin + '/play/' + S.ct.videoId + '?share=true&title=' + encodeURIComponent(S.ct.title) + '&artist=' + encodeURIComponent(S.ct.artist) + '&cover=' + encodeURIComponent(S.ct.cover);
    navigator.clipboard.writeText(url).then(function() {
        showToast('Link berhasil disalin ke clipboard!');
    }).catch(function() {
        showToast('Gagal menyalin link');
    });
}

function triggerNativeShare() {
    if(!S.ct || !S.ct.videoId) return;
    var url = location.origin + '/play/' + S.ct.videoId + '?share=true&title=' + encodeURIComponent(S.ct.title) + '&artist=' + encodeURIComponent(S.ct.artist) + '&cover=' + encodeURIComponent(S.ct.cover);
    if (navigator.share) {
        navigator.share({
            title: S.ct.title,
            text: 'Dengarkan ' + S.ct.title + ' - ' + S.ct.artist + ' di MusifyRik!',
            url: url
        }).catch(function() {});
    } else {
        copyShareLink();
    }
}

function downloadShareCard() {
    if (!S.ct) return;
    var canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    var ctx = canvas.getContext('2d');
    
    var grad = ctx.createLinearGradient(0, 0, 0, 800);
    var isLight = localStorage.getItem('theme') === 'light';
    if (isLight) {
        grad.addColorStop(0, '#e0e5ec');
        grad.addColorStop(1, '#c8d0db');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 800);
    } else {
        grad.addColorStop(0, '#141413');
        grad.addColorStop(1, '#12100e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 800);
    }
    
    ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 540, 740);
    
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        ctx.save();
        var rx = 100, ry = 80, rw = 400, rh = 400, radius = 24;
        ctx.beginPath();
        ctx.moveTo(rx + radius, ry);
        ctx.lineTo(rx + rw - radius, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
        ctx.lineTo(rx + rw, ry + rh - radius);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
        ctx.lineTo(rx + radius, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
        ctx.lineTo(rx, ry + radius);
        ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, rx, ry, rw, rh);
        ctx.restore();
        
        ctx.fillStyle = isLight ? '#2d3748' : '#ffffff';
        ctx.font = '900 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(S.ct.title, 300, 540, 480);
        
        ctx.fillStyle = isLight ? '#718096' : '#9a9490';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(S.ct.artist, 300, 585, 480);
        
        ctx.fillStyle = isLight ? '#a0aec0' : '#4a5568';
        ctx.font = '16px monospace';
        ctx.fillText('DIDENGARKAN DI MUSIFYRIK', 300, 710);
        
        try {
            var dataUrl = canvas.toDataURL('image/png');
            var a = document.createElement('a');
            a.download = S.ct.title.replace(/[^a-zA-Z0-9]/g, '_') + '_musifyrik.png';
            a.href = dataUrl;
            a.click();
            showToast('Berhasil mengunduh Share Card!');
        } catch(e) {
            showToast('Gagal unduh karena CORS gambar, silakan screenshot layar!');
        }
    };
    img.onerror = function() {
        ctx.fillStyle = isLight ? '#2d3748' : '#ffffff';
        ctx.font = '900 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(S.ct.title, 300, 300, 480);
        
        ctx.fillStyle = isLight ? '#718096' : '#9a9490';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(S.ct.artist, 300, 360, 480);
        
        ctx.fillStyle = isLight ? '#a0aec0' : '#4a5568';
        ctx.font = '16px monospace';
        ctx.fillText('DIDENGARKAN DI MUSIFYRIK', 300, 710);
        
        try {
            var dataUrl = canvas.toDataURL('image/png');
            var a = document.createElement('a');
            a.download = S.ct.title.replace(/[^a-zA-Z0-9]/g, '_') + '_musifyrik.png';
            a.href = dataUrl;
            a.click();
            showToast('Berhasil mengunduh Share Card (tanpa cover)!');
        } catch(ex) {
            showToast('Gagal mengunduh Share Card');
        }
    };
    img.src = S.ct.cover || FI;
}

// DAFTAR ANTRIAN (QUEUE)
function queueListHtml(){
    if(!S.pl || S.pl.length === 0){
        return '<div class="text-center text-white/50 py-10"><i data-lucide="list-music" class="w-12 h-12 mx-auto mb-3 opacity-30"></i><p class="text-sm">Antrian kosong</p><p class="text-xs text-white/40 mt-1">Pilih lagu lalu ketuk “Tambahkan ke Antrian”</p></div>';
    }
    return S.pl.map(function(t, i){
        var active = (i === S.pi);
        var isFirst = i === 0;
        var isLast = i === S.pl.length - 1;
        return '<div class="flex items-center gap-1.5 p-2 rounded-xl ' + (active ? 'bg-white/10 border border-white/15' : 'hover:bg-white/5 border border-transparent') + '">' +
            '<div onclick="playQueueIndex(' + i + ')" class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">' +
                '<img src="' + (t.cover || FI) + '" class="w-11 h-11 rounded-lg object-cover flex-shrink-0" onerror="this.src=\'' + FI + '\'" alt="" />' +
                '<div class="flex-1 min-w-0"><p class="text-sm font-medium truncate ' + (active ? 'text-white' : 'text-white/90') + '">' + es(t.title) + '</p><p class="text-white/50 text-xs truncate">' + es(t.artist) + (active ? ' \u2022 Sedang diputar' : '') + '</p></div>' +
            '</div>' +
            (active ? '<i data-lucide="volume-2" class="w-4 h-4 text-white/80 flex-shrink-0"></i>' : '') +
            '<button onclick="moveQueueItem(' + i + ',' + (i-1) + ')" class="w-7 h-7 rounded-full text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0 ' + (isFirst ? 'invisible' : '') + '" aria-label="Naikkan urutan"><i data-lucide="chevron-up" class="w-4 h-4"></i></button>' +
            '<button onclick="moveQueueItem(' + i + ',' + (i+1) + ')" class="w-7 h-7 rounded-full text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0 ' + (isLast ? 'invisible' : '') + '" aria-label="Turunkan urutan"><i data-lucide="chevron-down" class="w-4 h-4"></i></button>' +
            '<button onclick="removeFromQueue(' + i + ')" class="w-7 h-7 rounded-full text-white/50 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center shrink-0" aria-label="Hapus dari antrian"><i data-lucide="x" class="w-4 h-4"></i></button>' +
        '</div>';
    }).join('');
}
function openQueue(){
    if(gid('queue-popup')) return;
    var popup = document.createElement('div');
    popup.id = 'queue-popup';
    popup.className = 'fixed inset-0 z-[300] flex items-end justify-center bg-black/60';
    popup.onclick = function(e){ if(e.target === popup) closeQueue(); };
    popup.innerHTML = '<div class="w-full max-w-md rounded-t-3xl p-6 border-t border-white/10 glass-strong" style="animation:slideUp 0.3s ease-out forwards; background: var(--bg-color); max-height:75vh; display:flex; flex-direction:column;">' +
        '<div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 flex-shrink-0"></div>' +
        '<div class="flex justify-between items-center mb-3 flex-shrink-0">' +
            '<div><h3 class="font-black text-white text-lg">Daftar Antrian</h3><p class="text-white/50 text-xs">' + (S.pl ? S.pl.length : 0) + ' lagu dalam antrian</p></div>' +
            '<div class="flex items-center gap-2">' +
                '<button onclick="clearQueue()" class="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 font-semibold transition active:scale-95"' + (S.pl && S.pl.length ? '' : ' style="display:none"') + '>Bersihkan</button>' +
                '<button onclick="closeQueue()" class="text-white/60 hover:text-white p-1" aria-label="Tutup"><i data-lucide="x" class="w-5 h-5"></i></button>' +
            '</div>' +
        '</div>' +
        '<div id="queue-list" class="overflow-y-auto hide-scrollbar space-y-1 flex-1 -mx-1 px-1">' + queueListHtml() + '</div>' +
    '</div>';
    document.body.appendChild(popup);
    if(window.lucide) lucide.createIcons();
}
function closeQueue(){ var p = gid('queue-popup'); if(p) p.remove(); }
function refreshQueue(){
    var listEl = gid('queue-list');
    if(!listEl){ openQueue(); return; }
    listEl.innerHTML = queueListHtml();
    if(window.lucide) lucide.createIcons();
}
function playQueueIndex(i){
    if(!S.pl || !S.pl[i]) return;
    closeQueue();
    PK('queue', i);
}

// UNDUH LAGU (AUDIO)
function downloadCurrentSong(){
    if(!S.ct)return;
    showToast('Menyiapkan unduhan...');
    var ytUrl=S.ct.ytUrl||('https://youtube.com/watch?v='+S.ct.videoId);
    fetch(API.ytplay,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:ytUrl})})
        .then(function(r){return r.json();})
        .then(function(d){
            if(d&&d.status&&d.result&&d.result.download&&d.result.download.audio){
                var audioUrl=d.result.download.audio;
                var a=document.createElement('a');
                a.href='/api/proxy-audio?url='+encodeURIComponent(audioUrl);
                a.download=(S.ct.title||'lagu').replace(/[^a-zA-Z0-9]/g,'_')+'.mp3';
                document.body.appendChild(a);
                a.click();
                a.remove();
                showToast('Unduhan dimulai!');
            }else{
                showToast('Gagal mengambil link unduhan');
            }
        })
        .catch(function(){showToast('Gagal mengunduh lagu');});
}
