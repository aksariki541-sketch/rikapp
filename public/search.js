var Search={
    render(){
        gid('view-search').innerHTML=`
        <div class="pt-8 pb-3.5 px-4 sticky top-0 z-30 border-b border-white/10 shadow-2xl transition-all relative overflow-hidden" style="background: linear-gradient(180deg, rgba(232, 120, 159, 0.12) 0%, rgba(13, 13, 12, 0.45) 55%, rgba(13, 13, 12, 0.92) 100%); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
            <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 90% -20%, rgba(var(--accent-2-rgb),0.25), transparent 55%);"></div>
            <h1 class="text-3xl font-black text-white tracking-tight mb-3 relative z-10">Cari</h1>
            <form id="search-form" class="relative z-10" autocomplete="off">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center text-white/50"><i data-lucide="search" class="h-5 w-5"></i></div>
                <input type="text" id="search-input" class="w-full glass-input text-white font-medium rounded-2xl pl-12 pr-24 py-3.5 focus:outline-none placeholder:text-white/40" placeholder="Cari lagu, artis, atau album..." autocomplete="off" />
                <button type="button" id="search-clear-btn" onclick="Search.clear()" class="hidden absolute right-[74px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 flex items-center justify-center transition-all active:scale-90" title="Hapus"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                <button type="submit" id="search-submit-btn" class="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#0b0a09] font-extrabold px-4 py-2.5 rounded-xl active:scale-90 transition-all" style="background:linear-gradient(135deg,var(--accent),var(--accent-2)); box-shadow:0 6px 16px rgba(var(--accent-rgb),0.4);">Cari</button>
            </form>
            <div id="suggestions" class="hidden mt-2 glass-strong rounded-2xl max-h-72 overflow-y-auto hide-scrollbar border border-white/10 relative z-10"></div>
        </div>
        <div id="filter-tabs" class="hidden flex gap-2 p-1.5 glass rounded-full mx-4 mb-3 mt-4 border border-white/10">
            <button onclick="setFilter('songs')" id="f-songs" class="filter-tab active flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all">Musik</button>
            <button onclick="setFilter('playlists')" id="f-playlists" class="filter-tab flex-1 py-2 px-4 rounded-full text-xs font-semibold text-[#9a9490] hover:text-white transition-all">Playlist</button>
            <button onclick="setFilter('artists')" id="f-artists" class="filter-tab flex-1 py-2 px-4 rounded-full text-xs font-semibold text-[#9a9490] hover:text-white transition-all">Artis</button>
        </div>
        <div class="px-4 mt-2" id="search-results"></div>
        <div id="search-recs" class="px-4 mt-2 space-y-6 pb-8"></div>`;
        lucide.createIcons();Search.events();
    },
    query(q){
        App.switch('search');
        var si = gid('search-input');
        if (si) {
            si.value = q;
            var sf = gid('search-form');
            if (sf) sf.dispatchEvent(new Event('submit'));
        }
    },
    onShow(){if(!S.sq){Search.renderRecs();}},
    REC_ROWS:[
        {key:'rec0',label:'Rilis Anyar',q:'baru rilis',icon:'<i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>'},
        {key:'rec1',label:'Barat Top',q:'barat Top',icon:'<i data-lucide="globe" class="w-4 h-4 text-sky-400"></i>'},
        {key:'rec2',label:'Rapp Top',q:'Rapp Top',icon:'<i data-lucide="flame" class="w-4 h-4 text-rose-400"></i>'}
    ],
    renderRecs(){
        var rc=gid('search-recs');if(!rc)return;
        if(S.rec0&&S.rec1&&S.rec2){Search.showRecs();return;}
        rc.innerHTML=Search.REC_ROWS.map(function(row){
            return '<div><div class="h-5 w-32 bg-white/10 rounded mb-3 animate-pulse"></div><div class="flex gap-3 overflow-x-auto hide-scrollbar pb-1">'+
                Array(4).fill(0).map(function(){return '<div class="flex-shrink-0 w-32 animate-pulse"><div class="w-32 h-32 rounded-xl bg-white/5 mb-2"></div><div class="h-3 bg-white/10 rounded w-3/4"></div></div>';}).join('')+
            '</div></div>';
        }).join('');
        Promise.all(Search.REC_ROWS.map(function(row){
            return fetch(API.search+'?query='+encodeURIComponent(row.q)+'&type=songs').then(function(r){return r.json();}).then(function(d){
                S[row.key]=d.status&&d.result.songs?d.result.songs.map(function(s){return{id:s.videoId,videoId:s.videoId,title:cn(s.title),artist:cn(s.artist),artistId:s.artistId||'',cover:toHDCover(s.thumbnail,s.videoId),ytUrl:s.url};}):[];
            }).catch(function(){S[row.key]=[];});
        })).then(function(){Search.showRecs();});
    },
    showRecs(){
        var rc=gid('search-recs');if(!rc)return;
        rc.innerHTML=Search.REC_ROWS.map(function(row){
            var list=(S[row.key]||[]).slice(0,6);
            if(list.length===0)return '';
            var cardsHtml=list.map(function(t,i){
                var isCur = S.ct && (
                    S.ct.id === t.id ||
                    S.ct.videoId === t.id ||
                    (S.ct.id && t.videoId && S.ct.id === t.videoId) ||
                    (S.ct.videoId && t.id && S.ct.videoId === t.id) ||
                    (S.ct.title === t.title && S.ct.artist === t.artist)
                );
                var isPlay = isCur && S.ip;
                var isLoad = isCur && S.il;
                var recBtn = '';
                var ringClass = '';

                if(isLoad) {
                    recBtn = '<div class="absolute bottom-1.5 right-1.5 btn-chrome rounded-full p-2  shadow-black/40"><div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>';
                    ringClass = 'ring-2 ring-white/60 scale-[1.02]  shadow-white/10';
                } else if(isPlay) {
                    recBtn = '<div class="absolute bottom-1.5 right-1.5 bg-white text-black rounded-full p-2  shadow-white/30 ring-2 ring-white scale-105"><div class="flex items-end justify-center gap-[2px] w-3.5 h-3.5 pb-0.5"><span class="w-[2px] bg-black rounded-full animate-eq-1"></span><span class="w-[2px] bg-black rounded-full animate-eq-2"></span><span class="w-[2px] bg-black rounded-full animate-eq-3"></span></div></div>';
                    ringClass = 'ring-2 ring-white scale-[1.02]  shadow-white/20';
                } else if(isCur) {
                    recBtn = '<div class="absolute bottom-1.5 right-1.5 bg-white text-black rounded-full p-2  scale-105 border border-white"><i data-lucide="pause" class="w-3.5 h-3.5 fill-current"></i></div>';
                    ringClass = 'ring-2 ring-white/60 shadow-md';
                } else {
                    recBtn = '<div class="absolute bottom-1.5 right-1.5 btn-chrome rounded-full p-2  shadow-black/40 hover:scale-110 transition-all"><i data-lucide="play" class="w-3.5 h-3.5 fill-current ml-0.5"></i></div>';
                    ringClass = '';
                }

                return '<div onclick="PK(\''+row.key+'\','+i+')" class="search-rec-item flex-shrink-0 w-36 cursor-pointer active:scale-95 group p-2.5 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl hover:bg-[#363230] transition-all flex flex-col animate-card-left" style="animation-delay:'+Math.min(i*50, 450)+'ms"><div class="search-rec-cover w-full aspect-square mb-2 relative rounded-xl overflow-hidden shadow-md transition-all '+ringClass+'"><img src="'+t.cover+'" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onerror="this.src=\''+FI+'\'" /><div class="search-rec-btn">'+recBtn+'</div></div><h3 class="search-rec-title font-semibold text-xs truncate text-white px-0.5 '+(isCur?'font-black':'')+'">'+es(t.title)+'</h3><p class="text-white/60 text-[10px] truncate mt-0.5 px-0.5">'+es(t.artist)+'</p></div>';
            }).join('');
            return '<div class="animate-card-up"><h2 class="text-base font-bold mb-3 flex items-center gap-2 text-white">'+(row.icon||'<span class="w-1.5 h-4 bg-white/90 rounded-full inline-block"></span>')+'<span>'+row.label+'</span></h2><div class="flex gap-3 overflow-x-auto hide-scrollbar pb-1">'+cardsHtml+'</div></div>';
        }).join('');
        lucide.createIcons();
    },
    renderActive(){
        var c = gid('search-results');
        if (c && S.sq && S.filter === 'songs' && S.sr) {
            var items = c.querySelectorAll('.search-song-item');
            items.forEach(function(el, i){
                var t = S.sr[i];
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

                var btnHtml = '';
                if (isLoad) {
                    btnHtml = '<div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-white/10 scale-105"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>';
                } else if (isPlay) {
                    btnHtml = '<div class="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-white/30 ring-2 ring-white scale-105 transition-all"><div class="flex items-end justify-center gap-[2.5px] w-4 h-4 pb-0.5"><span class="w-[2.5px] bg-black rounded-full animate-eq-1"></span><span class="w-[2.5px] bg-black rounded-full animate-eq-2"></span><span class="w-[2.5px] bg-black rounded-full animate-eq-3"></span></div></div>';
                } else if (isCur) {
                    btnHtml = '<div class="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-md transition-all border border-white scale-105"><svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></div>';
                } else {
                    btnHtml = '<div class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 text-white transition-all"><svg class="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg></div>';
                }

                var itemBg = isPlay ? 'bg-[#433e3b] border border-white/40 shadow-xl' : (isCur ? 'bg-[#3a332f] border border-white/30' : 'bg-[#2a2521] border border-white/10 hover:bg-[#363230]');
                var titleColor = isCur ? 'text-white font-black' : 'text-white font-semibold';
                var badgeHtml = isPlay ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-bold uppercase tracking-wider ml-2 border border-white/30">Diputar</span>' : (isCur ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 font-bold uppercase tracking-wider ml-2 border border-white/20">Dijeda</span>' : '');

                el.className = 'search-song-item flex items-center gap-3.5 p-2.5 rounded-2xl cursor-pointer active:scale-[0.98] transition-all shadow-lg shadow-black/25 ' + itemBg;
                var titleEl = el.querySelector('.search-song-title');
                if (titleEl) titleEl.className = 'search-song-title font-medium truncate ' + titleColor;
                var badgeEl = el.querySelector('.search-song-badge');
                if (badgeEl) badgeEl.innerHTML = badgeHtml;
                var btnEl = el.querySelector('.search-song-btn');
                if (btnEl) btnEl.innerHTML = btnHtml;
            });
        }

        var rc = gid('search-recs');
        if (rc && !S.sq) {
            Search.REC_ROWS.forEach(function(row){
                var list = (S[row.key] || []).slice(0, 6);
                list.forEach(function(t, i){
                    var isCur = S.ct && (
                        S.ct.id === t.id ||
                        S.ct.videoId === t.id ||
                        (S.ct.id && t.videoId && S.ct.id === t.videoId) ||
                        (S.ct.videoId && t.id && S.ct.videoId === t.id) ||
                        (S.ct.title === t.title && S.ct.artist === t.artist)
                    );
                    var isPlay = isCur && S.ip;
                    var isLoad = isCur && S.il;
                    var recBtn = '';
                    var ringClass = '';

                    if(isLoad) {
                        recBtn = '<div class="absolute bottom-1.5 right-1.5 btn-chrome rounded-full p-2  shadow-black/40"><div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>';
                        ringClass = 'ring-2 ring-white/60 scale-[1.02]  shadow-white/10';
                    } else if(isPlay) {
                        recBtn = '<div class="absolute bottom-1.5 right-1.5 bg-white text-black rounded-full p-2  shadow-white/30 ring-2 ring-white scale-105"><div class="flex items-end justify-center gap-[2px] w-3.5 h-3.5 pb-0.5"><span class="w-[2px] bg-black rounded-full animate-eq-1"></span><span class="w-[2px] bg-black rounded-full animate-eq-2"></span><span class="w-[2px] bg-black rounded-full animate-eq-3"></span></div></div>';
                        ringClass = 'ring-2 ring-white scale-[1.02]  shadow-white/20';
                    } else if(isCur) {
                        recBtn = '<div class="absolute bottom-1.5 right-1.5 bg-white text-black rounded-full p-2  scale-105 border border-white"><i data-lucide="pause" class="w-3.5 h-3.5 fill-current"></i></div>';
                        ringClass = 'ring-2 ring-white/60 shadow-md';
                    } else {
                        recBtn = '<div class="absolute bottom-1.5 right-1.5 btn-chrome rounded-full p-2  shadow-black/40 hover:scale-110 transition-all"><i data-lucide="play" class="w-3.5 h-3.5 fill-current ml-0.5"></i></div>';
                        ringClass = '';
                    }

                    var card = rc.querySelector('[onclick*="PK(\''+row.key+'\','+i+')"]');
                    if(card) {
                        var cover = card.querySelector('.search-rec-cover');
                        if(cover) cover.className = 'search-rec-cover w-32 h-32 mb-2 relative rounded-xl overflow-hidden glass-edge  transition-all ' + ringClass;
                        var btn = card.querySelector('.search-rec-btn');
                        if(btn) btn.innerHTML = recBtn;
                        var title = card.querySelector('.search-rec-title');
                        if(title) title.className = 'search-rec-title font-semibold text-xs truncate ' + (isCur?'text-white font-black':'');
                    }
                });
            });
        }
        lucide.createIcons();
    },
    clear(){
        var si=gid('search-input');if(!si)return;
        si.value='';si.focus();
        gid('suggestions').classList.add('hidden');
        gid('search-clear-btn').classList.add('hidden');
        S.sq='';S.ar=[];S.pr=[];S.sr=[];
        var ft=gid('filter-tabs');if(ft)ft.classList.add('hidden');
        gid('search-results').innerHTML='';
        history.pushState({},'',location.origin+'/search');
        Search.onShow();
    },
    events(){
        var sf=gid('search-form'),si=gid('search-input');if(!sf||!si)return;
        si.addEventListener('input',function(){
            var cb=gid('search-clear-btn');if(!cb)return;
            cb.classList.toggle('hidden', !this.value.trim());
        });
        sf.addEventListener('submit',async function(e){
            e.preventDefault();S.sq=si.value.trim();gid('suggestions').classList.add('hidden');
            if(!S.sq){S.ar=[];S.pr=[];S.sr=[];Search.show();return;}
            var url=location.origin+'/search/'+encodeURIComponent(S.sq);
            history.pushState({},'',url);
            Search.errorMsg = null;
            Search.show(true);
            try{
                var r=await fetch(API.search+'?query='+encodeURIComponent(S.sq)+'&type=all');
                if(!r.ok) throw new Error('HTTP '+r.status);
                var d=await r.json();
                S.ar=d.status&&d.result.songs?d.result.songs.map(function(s){return{id:s.videoId,videoId:s.videoId,title:cn(s.title),artist:cn(s.artist),artistId:s.artistId||'',cover:toHDCover(s.thumbnail,s.videoId),ytUrl:s.url,duration:s.duration||''};}):[];
                
                var pl = d.status&&d.result.playlists?d.result.playlists:[];
                var al = d.status&&d.result.albums?d.result.albums:[];
                S.pr = [].concat(pl).concat(al); // combine playlists & albums
                S.art = d.status&&d.result.artists?d.result.artists:[];

                gid('filter-tabs').classList.remove('hidden');
                S.filter = 'songs';
                Search.updateFilterUI();
                Search.apply();
            }catch(e){S.ar=[];S.pr=[];S.art=[];Search.errorMsg='Gagal memuat hasil pencarian';Search.show();}
        });
        var suggestTimer = null;
        si.addEventListener('input',function(){
            var q=this.value.trim();
            if(!q){ gid('suggestions').classList.add('hidden'); if(suggestTimer) clearTimeout(suggestTimer); return; }
            if(suggestTimer) clearTimeout(suggestTimer);
            suggestTimer = setTimeout(function(){
                fetch(API.suggest+'?q='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(s){
                    if(!s || !Array.isArray(s) || s.length===0){ gid('suggestions').classList.add('hidden'); return; }
                    gid('suggestions').innerHTML=s.map(function(sg, i){
                        return'<div onclick="selectSuggestion(\''+es(sg).replace(/'/g,"\\'")+'\')" class="px-4 py-3 hover:bg-white/10 cursor-pointer text-sm flex items-center gap-3 transition-colors"><i data-lucide="search" class="w-3.5 h-3.5 text-white/70"></i><span>'+es(sg)+'</span></div>';
                    }).join('');
                    gid('suggestions').classList.remove('hidden');
                    lucide.createIcons();
                }).catch(function(){ gid('suggestions').classList.add('hidden'); });
            }, 300);
        });
        document.addEventListener('click',function(e){if(!e.target.closest('#search-form')&&!e.target.closest('#suggestions'))gid('suggestions').classList.add('hidden');});
    },
    updateFilterUI(){
        document.querySelectorAll('.filter-tab').forEach(function(el){
            el.className = 'filter-tab flex-1 py-2 px-4 rounded-full text-xs font-semibold text-[#9a9490] hover:text-white transition-all';
        });
        var a=gid('f-'+S.filter);
        if(a){a.className = 'filter-tab active flex-1 py-2 px-4 rounded-full text-xs font-bold btn-chrome text-white  border border-white/30 scale-105';}
    },
    retry(){ Search.errorMsg=null; var sf=gid('search-form'); if(sf) sf.dispatchEvent(new Event('submit')); },
    show(loading){
        var c=gid('search-results'),rc=gid('search-recs');if(!c)return;
        if(!S.sq){c.innerHTML='';if(rc)rc.style.display='';return;}
        if(rc)rc.style.display='none';
        if(loading){c.innerHTML='<div class="text-center mt-10 py-8"><div class="w-8 h-8 border-2 border-white/25 border-t-white rounded-full animate-spin mx-auto"></div><p class="text-white/50 text-xs mt-3">Mencari \u201c'+es(S.sq)+'\u201d...</p></div>';return;}
        if(Search.errorMsg){
            c.innerHTML='<div class="text-center mt-10 py-10 px-4 rounded-2xl bg-white/[0.04] border border-white/10"><div class="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-500/25"><i data-lucide="cloud-off" class="w-6 h-6"></i></div><p class="text-white font-bold text-sm mb-1">'+es(Search.errorMsg)+'</p><p class="text-white/60 text-xs mb-4">Periksa koneksi internetmu lalu coba lagi.</p><button onclick="Search.retry()" class="btn-chrome px-5 py-2.5 text-xs font-bold rounded-full active:scale-95 transition inline-flex items-center gap-1.5"><i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Coba Lagi</button></div>';
            lucide.createIcons();
            return;
        }
        if(S.sr.length===0){c.innerHTML='<div class="text-center text-white/60 mt-10 py-8"><i data-lucide="search-x" class="w-10 h-10 mx-auto mb-3 opacity-40"></i><p class="text-sm">Tidak ada hasil untuk \u201c'+es(S.sq)+'\u201d</p></div>';lucide.createIcons();return;}
        
        if (S.filter === 'songs') {
            c.innerHTML=S.sr.map(function(t,i){
                var isCur = S.ct && (
                    S.ct.id === t.id ||
                    S.ct.videoId === t.id ||
                    (S.ct.id && t.videoId && S.ct.id === t.videoId) ||
                    (S.ct.videoId && t.id && S.ct.videoId === t.id) ||
                    (S.ct.title === t.title && S.ct.artist === t.artist)
                );
                var isPlay = isCur && S.ip;
                var isLoad = isCur && S.il;

                var btnHtml = '';
                if (isLoad) {
                    btnHtml = '<div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-white/10 scale-105"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>';
                } else if (isPlay) {
                    btnHtml = '<div class="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-white/30 ring-2 ring-white scale-105 transition-all"><div class="flex items-end justify-center gap-[2.5px] w-4 h-4 pb-0.5"><span class="w-[2.5px] bg-black rounded-full animate-eq-1"></span><span class="w-[2.5px] bg-black rounded-full animate-eq-2"></span><span class="w-[2.5px] bg-black rounded-full animate-eq-3"></span></div></div>';
                } else if (isCur) {
                    btnHtml = '<div class="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-md transition-all border border-white scale-105"><i data-lucide="pause" class="w-4 h-4 fill-current"></i></div>';
                } else {
                    btnHtml = '<div class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 text-white transition-all"><i data-lucide="play" class="w-3.5 h-3.5 fill-current ml-0.5"></i></div>';
                }

                var itemBg = isPlay ? 'bg-[#433e3b] border border-white/40 shadow-xl' : (isCur ? 'bg-[#3a332f] border border-white/30' : 'bg-[#2a2521] border border-white/10 hover:bg-[#363230]');
                var titleColor = isCur ? 'text-white font-black' : 'text-white font-semibold';
                var badgeHtml = isPlay ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-bold uppercase tracking-wider ml-2 border border-white/30">Diputar</span>' : (isCur ? '<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 font-bold uppercase tracking-wider ml-2 border border-white/20">Dijeda</span>' : '');

                return '<div class="search-song-item flex items-center gap-2 p-2.5 mb-2 rounded-2xl cursor-pointer active:scale-[0.98] transition-all shadow-lg shadow-black/25 animate-card-up '+itemBg+'" style="animation-delay:'+Math.min(i*35, 500)+'ms">'+
                    '<div onclick="PK(\'search\','+i+')" class="flex items-center gap-3 flex-1 min-w-0">'+
                        '<img src="'+toWebp(t.cover)+'" loading="lazy" class="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 border border-white/10" onerror="handleImgError(this)" alt="'+es(t.title)+'" />'+
                        '<div class="truncate flex-1 min-w-0"><div class="flex items-center gap-2"><h3 class="search-song-title font-semibold text-sm truncate '+titleColor+'">'+es(t.title)+'</h3><span class="search-song-badge shrink-0">'+badgeHtml+'</span></div><p class="text-white/60 text-xs truncate mt-0.5">'+es(t.artist)+(t.duration?' \u2022 '+es(t.duration):'')+'</p></div>'+
                    '</div>'+
                    '<div class="search-song-btn">'+btnHtml+'</div>'+
                    '<button onclick="event.stopPropagation();openTrackMenu(\'search\','+i+')" class="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center shrink-0 active:scale-90 transition" aria-label="Menu lagu"><i data-lucide="more-vertical" class="w-4 h-4"></i></button>'+
                '</div>';
            }).join('');
            lucide.createIcons();
        } else if (S.filter === 'artists') {
            c.innerHTML='<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-8">'+S.sr.map(function(p, i){
                return '<div onclick="Artist.open(\''+p.id+'\', \''+esJs(p.name||p.title)+'\')" class="p-3 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl hover:bg-[#363230] cursor-pointer active:scale-95 transition-all text-center flex flex-col items-center justify-center group animate-card-up" style="animation-delay:'+Math.min(i*40, 500)+'ms"><div class="relative w-20 h-20 mb-2.5 rounded-full overflow-hidden border-2 border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300"><img src="'+toWebp(p.cover)+'" class="w-full h-full object-cover" onerror="handleImgError(this)" /></div><h3 class="font-bold text-sm truncate text-white w-full px-1">'+es(p.name||p.title)+'</h3><p class="text-white/60 text-[10px] uppercase tracking-wider font-semibold mt-0.5">'+es(p.subtitle||'Artist')+'</p></div>';
            }).join('')+'</div>';
            lucide.createIcons();
        } else {
            c.innerHTML='<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-8">'+S.sr.map(function(p, i){
                return '<div onclick="Album.open(\''+p.id+'\', \''+(p.cover||FI)+'\')" class="p-2.5 rounded-2xl bg-[#2a2521] border border-white/10 shadow-xl hover:bg-[#363230] cursor-pointer active:scale-95 transition-all group flex flex-col animate-card-up" style="animation-delay:'+Math.min(i*40, 500)+'ms"><div class="w-full aspect-square mb-2.5 rounded-xl overflow-hidden shadow-md"><img src="'+toWebp(p.cover)+'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="handleImgError(this)" /></div><h3 class="font-semibold text-sm truncate text-white px-0.5">'+es(p.title)+'</h3><p class="text-white/60 text-xs truncate mt-0.5 px-0.5">'+es(p.artist)+'</p></div>';
            }).join('')+'</div>';
            lucide.createIcons();
        }
    },
    apply(){
        if(S.filter==='songs') S.sr=S.ar||[];
        else if(S.filter==='playlists') S.sr=S.pr||[];
        else if(S.filter==='artists') S.sr=S.art||[];
        Search.show();
    }
};
function selectSuggestion(t){gid('suggestions').classList.add('hidden');gid('search-input').value=t;gid('search-form').dispatchEvent(new Event('submit'));}
function setFilter(f){S.filter=f;Search.updateFilterUI();Search.apply();}
