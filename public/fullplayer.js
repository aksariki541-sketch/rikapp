var FullPlayer={
    init(){
        gid('full-container').innerHTML=`
        <div id="full-player" class="fixed flex items-stretch justify-center z-[170] text-white p-2.5 pt-safe sm:p-6 sm:pt-safe" style="display:none;transition:transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);will-change:transform;transform:translate3d(0,100%,0);top:0;left:0;right:0;bottom:0;overflow:hidden;touch-action:none;">
        <div id="full-player-card" class="fp-card flex flex-col justify-between p-3.5 pt-safe sm:p-6 sm:pt-safe">

            <!-- Blurred Artwork Background Container -->
            <div class="player-bg-container">
                <img id="full-bg-artwork" src="" class="player-bg-blur-img" alt="" />
                <img id="full-bg-artwork-next" src="" class="player-bg-blur-img transition-opacity duration-300" style="opacity:0; z-index:2;" alt="" />
                <div id="full-bg-glow" class="player-bg-glow"></div>
                <div class="player-bg-vignette"></div>
            </div>

            <!-- Top Header (Padding top 16-20px) -->
            <div class="relative z-10 flex justify-between items-center flex-shrink-0 pt-1 pb-1">
                <button onclick="FullPlayer.close()" class="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full active:scale-90 transition-all cursor-pointer" title="Tutup Player"><i data-lucide="chevron-down" class="w-7 h-7"></i></button>
                <div class="text-center">
                    <p id="full-header-tag" class="text-[9px] uppercase tracking-[0.22em] text-[#9a9490] font-bold transition-all duration-300">Sedang Diputar</p>
                    <p id="full-header-artist" class="text-xs font-bold text-white/90 truncate max-w-[180px] mt-0.5 transition-all duration-300"></p>
                </div>
                <!-- Tombol Opsi dirapatkan ke kanan (hamburger menu) -->
                <div class="flex items-center gap-1">
                    <button onclick="FullPlayer.openMoreSheet()" class="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full active:scale-90 transition-all cursor-pointer" title="Opsi"><i data-lucide="more-vertical" class="w-5 h-5"></i></button>
                </div>
            </div>

            <!-- Toggle Segment: Cover / Lyrics (Posisi Lingkaran Orange) -->
            <div class="relative z-10 flex justify-center items-center my-1 flex-shrink-0">
                <div class="inline-flex items-center bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/15 shadow-inner">
                    <button id="full-tab-cover" onclick="FullPlayer.switchView('cover')" class="px-4 py-1 rounded-full text-xs font-bold transition-all text-white bg-white/20 shadow-md cursor-pointer">
                        Cover
                    </button>
                    <button id="full-tab-lyrics" onclick="FullPlayer.switchView('lyrics')" class="px-4 py-1 rounded-full text-xs font-bold transition-all text-white/60 hover:text-white bg-transparent cursor-pointer">
                        Lirik
                    </button>
                </div>
            </div>

            <!-- Cover Artwork / Compact Lyrics Container (Slightly larger ~85-88% Width) -->
            <div class="relative z-10 flex-1 flex items-center justify-center my-auto px-4 py-1" style="min-height:0;overflow:hidden;">
                <div class="relative w-[86%] sm:w-[88%] max-w-[340px] aspect-square flex items-center justify-center">
                    <!-- 1. Cover View Container -->
                    <div id="full-cover-view" class="w-full h-full relative flex items-center justify-center">
                        <img id="full-cover" src="" class="w-full h-full object-cover rounded-2xl transition-transform duration-300 border border-white/10 shadow-2xl" />
                        
                        <!-- Next Cover Overlay for Smooth Transition -->
                        <div id="full-cover-next-overlay" class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-0 z-10">
                            <img id="full-cover-next-img" src="" class="w-full h-full object-cover rounded-2xl border border-white/10 shadow-2xl" />
                        </div>

                        <!-- Loading & Overlay -->
                        <div id="full-cover-overlay" class="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/65 backdrop-blur-md p-4 transition-opacity duration-200 opacity-0 pointer-events-none z-20">
                            <div id="full-cover-icon" class="mb-3 text-white flex items-center justify-center"></div>
                            <span id="full-cover-text" class="text-xs font-bold text-white leading-relaxed text-center drop-shadow-md px-2"></span>
                        </div>
                    </div>

                    <!-- 2. Compact Inline Lyrics View Container -->
                    <div id="full-lyrics-view" class="hidden w-full h-full relative rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/15 p-3.5 overflow-hidden flex flex-col shadow-2xl">
                        <!-- Header: Thumbnail + Title + Artist (shown above the compact lyrics) -->
                        <div class="flex items-center gap-2.5 pb-2.5 mb-1.5 border-b border-white/10 flex-shrink-0 relative z-20">
                            <img id="full-inline-lyrics-cover" src="" class="w-9 h-9 rounded-lg object-cover shadow-md flex-shrink-0 bg-white/5" alt="" />
                            <div class="flex flex-col min-w-0">
                                <span id="full-inline-lyrics-title" class="font-bold text-white text-xs truncate"></span>
                                <span id="full-inline-lyrics-artist" class="text-white/60 text-[11px] truncate"></span>
                            </div>
                        </div>
                        <!-- Lyrics Scrollable Container -->
                        <div id="full-inline-lyrics-scroll" class="flex-1 w-full overflow-y-auto no-scrollbar scroll-smooth relative z-10">
                            <div id="full-inline-lyrics-loading" class="hidden h-full flex flex-col items-center justify-center text-white/50 text-xs gap-2 py-8">
                                <div class="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span>Memuat lirik...</span>
                            </div>
                            <div id="full-inline-lyrics-empty" class="hidden h-full flex flex-col items-center justify-center text-white/50 text-xs text-center py-8">
                                <svg class="w-8 h-8 opacity-40 mb-2 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                <span>Lirik tidak tersedia</span>
                            </div>
                            <div id="full-inline-lyrics-content" class="min-h-full text-left"></div>
                        </div>

                        <!-- Floating Fullscreen Lyrics & Sync Bar (at bottom of compact box) -->
                        <div class="relative z-20 shrink-0 pt-2 flex items-center justify-between border-t border-white/10 mt-1 gap-2">
                            <!-- Sync +/- buttons -->
                            <div class="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1 border border-white/10">
                                <span class="text-[10px] text-white/60 font-semibold mr-0.5">Sync</span>
                                <button onclick="lyricSyncPrev()" class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition cursor-pointer" title="Lirik Mundur 1 Baris">-</button>
                                <span id="full-inline-sync-badge" class="hidden text-[10px] font-bold text-rose-400"></span>
                                <button onclick="lyricSyncNext()" class="w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition cursor-pointer" title="Lirik Maju 1 Baris">+</button>
                            </div>

                            <button onclick="toggleLyrics()" class="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-bold border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md cursor-pointer" title="Buka Lirik Penuh">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                                <span>Lirik Penuh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Song Info + Progress + Controls + Grid -->
            <div class="relative z-10 flex-shrink-0 w-full max-w-md mx-auto space-y-3 pb-2">
                <!-- Source / Device row (iOS-style "Playing from") -->
                <div class="fp-source-row px-1">
                    <i data-lucide="radio" class="w-3 h-3"></i>
                    <span>MusifyRik</span>
                </div>
                <!-- Song Info (Title + Heart + Offline on same line) -->
                <div class="flex items-center justify-between gap-3 px-1">
                    <div class="flex-1 min-w-0 truncate relative" id="full-meta-container">
                        <div id="full-meta-current" class="transition-opacity duration-300">
                            <div class="flex items-center gap-2">
                                <h2 id="full-title" class="text-xl sm:text-2xl font-black text-white truncate leading-tight">Pilih lagu</h2>
                                <span id="full-status-tag" class="hidden px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border border-white/20 text-white bg-white/10 shrink-0"></span>
                            </div>
                            <p id="full-artist" class="text-white/70 text-xs sm:text-sm font-medium truncate cursor-pointer hover:text-white mt-1" onclick="FullPlayer.openArtist()"></p>
                        </div>

                        <!-- Overlay for Next Title & Artist (Clean Text Crossfade) -->
                        <div id="full-meta-next" class="absolute inset-0 flex flex-col justify-center pointer-events-none transition-opacity duration-300 opacity-0 z-10">
                            <div class="flex items-center gap-2">
                                <h2 id="full-title-next" class="text-xl sm:text-2xl font-black text-white truncate leading-tight"></h2>
                                <span id="full-next-countdown-badge" class="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border border-white/30 text-white bg-white/20 shrink-0">NEXT</span>
                            </div>
                            <p id="full-artist-next" class="text-white/80 text-xs sm:text-sm font-medium truncate mt-1"></p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button id="full-offline-btn" onclick="toggleCurrentOffline(); if(typeof event !== 'undefined') event.stopPropagation();" class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all shrink-0 cursor-pointer shadow-md" title="Simpan ke Mode Offline PWA">
                            <i data-lucide="wifi-off" class="w-5 h-5"></i>
                        </button>
                        <button id="full-like-btn" onclick="toggleCurrentLike(); if(typeof event !== 'undefined') event.stopPropagation();" class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all shrink-0 cursor-pointer shadow-md" title="Sukai Lagu">
                            <i data-lucide="heart" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>

                <!-- Progress Bar (0:45 ───────────── 1:54) -->
                <div class="flex items-center gap-3 px-1 my-2">
                    <span id="time-curr" class="text-[11px] text-white/70 font-mono shrink-0 w-8 text-right font-semibold">0:00</span>
                    <div class="relative flex-1 h-1.5 bg-white/20 rounded-full flex items-center group cursor-pointer">
                        <input type="range" id="seek-bar" min="0" max="100" value="0" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" oninput="SK(this.value)" aria-label="Posisi lagu" />
                        <div id="full-progress" class="relative h-full rounded-full transition-all duration-75" style="width:0%;background:linear-gradient(90deg, var(--fp-accent-2, var(--accent-2)), var(--fp-accent, var(--accent)));">
                            <div class="fp-thumb absolute -right-1.5 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md transition-opacity"></div>
                        </div>
                    </div>
                    <span id="time-dur" class="text-[11px] text-white/70 font-mono shrink-0 w-8 font-semibold">0:00</span>
                </div>

                <!-- Spotify Volume Control -->
                <div class="flex items-center gap-3 px-2 pt-1 pb-1.5">
                    <button id="full-vol-icon-btn" onclick="toggleMute()" class="text-white/70 hover:text-white transition cursor-pointer p-1 rounded-full active:scale-90 shrink-0" title="Mute / Unmute" aria-label="Bisukan atau nyalakan suara">
                        <i id="full-vol-icon" data-lucide="volume-2" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                    </button>
                    <div class="relative flex-1 h-1.5 bg-white/20 rounded-full flex items-center group cursor-pointer">
                        <input type="range" id="vol-bar" min="0" max="100" value="100" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" oninput="setVolume(this.value)" aria-label="Volume" />
                        <div id="full-vol-progress" class="relative h-full bg-white rounded-full transition-all duration-75" style="width:100%;">
                            <div class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <span id="full-vol-text" class="hidden text-[11px] text-white/70 font-mono font-semibold w-8 text-right shrink-0">100%</span>
                    <button id="full-output-btn" onclick="FullPlayer.openOutputMenu()" class="fp-output-btn shrink-0" title="Output Audio (AirPlay)">
                        <i data-lucide="airplay" class="w-4 h-4"></i>
                    </button>
                </div>

                <!-- Music Controls (Shuffle Prev Play Next Repeat) -->
                <div class="flex items-center justify-between px-1 py-1">
                    <button id="full-shuffle-btn" onclick="SF()" class="relative text-white/50 hover:text-white active:scale-90 w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0" title="Acak (Shuffle)" aria-label="Acak (Shuffle)">
                        <i data-lucide="shuffle" class="w-4 h-4"></i>
                        <span id="full-shuffle-dot" class="hidden absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></span>
                    </button>
                    <button id="full-prev-btn" onclick="PV()" class="text-white active:scale-90 w-14 h-14 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0" title="Lagu Sebelumnya" aria-label="Lagu Sebelumnya">
                        <i data-lucide="skip-back" class="w-8 h-8 fill-current"></i>
                    </button>
                    <button onclick="TP()" id="full-play-btn-wrap" class="relative text-[#0b0a09] rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center w-[76px] h-[76px] shrink-0" aria-label="Putar atau Jeda" style="background:linear-gradient(135deg,var(--fp-accent, var(--accent)),var(--fp-accent-2, var(--accent-2))); box-shadow:0 10px 32px rgba(var(--fp-accent-rgb, var(--accent-rgb)),0.55);">
                        <div id="full-play-btn" class="flex items-center justify-center">
                            <i data-lucide="play" class="w-9 h-9 fill-current ml-0.5"></i>
                        </div>
                    </button>
                    <button id="full-next-btn" onclick="NX()" class="text-white active:scale-90 w-14 h-14 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0" title="Lagu Berikutnya" aria-label="Lagu Berikutnya">
                        <i data-lucide="skip-forward" class="w-8 h-8 fill-current"></i>
                    </button>
                    <button onclick="TR()" id="btn-repeat" class="relative text-white/50 hover:text-white active:scale-90 w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0" title="Ulang (Repeat)" aria-label="Mode Ulang">
                        <i data-lucide="repeat" class="w-4 h-4"></i>
                        <span id="repeat-one" class="hidden absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] font-black text-white">1</span>
                    </button>
                </div>

            </div>
        </div>
        </div>`;

                gid('lyrics-container').innerHTML=`
        <div id="lyrics-overlay" class="fixed flex flex-col z-[200] text-white" style="display:none;transition:transform 0.35s ease-out;transform:translateY(105%);left:0;right:0;bottom:0;top:0;width:100%;max-width:640px;margin:0 auto;height:100%;height:100dvh;overflow:hidden;border-radius:0;border:none;box-shadow:0 -20px 60px rgba(0,0,0,0.6);touch-action:none;">

            <!-- Blurred Artwork Background Container -->
            <div class="player-bg-container">
                <img id="lyrics-bg-blur" src="" class="player-bg-blur-img" alt="" />
                <div class="player-bg-vignette"></div>
            </div>

            <!-- Header -->
            <div class="flex justify-between items-center p-3 px-4 pt-safe flex-shrink-0 bg-black/40 backdrop-blur-md border-b border-white/10 relative z-20">
                <div class="flex items-center gap-3 overflow-hidden min-w-0">
                    <img id="lyrics-header-cover" src="" class="w-11 h-11 rounded-lg object-cover shadow-md flex-shrink-0 bg-white/5" alt="" />
                    <div class="flex flex-col min-w-0">
                        <span id="lyrics-header-title" class="font-bold text-white text-sm truncate">Lirik</span>
                        <span id="lyrics-header-artist" class="text-white/60 text-xs truncate"></span>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <div class="flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1 border border-white/10">
                        <button onclick="lyricSyncPrev()" class="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition cursor-pointer" aria-label="Lirik mundur satu baris"><i data-lucide="minus" class="w-3.5 h-3.5"></i></button>
                        <span id="lyric-sync-badge-mobile" class="hidden text-[10px] font-bold text-rose-400"></span>
                        <button onclick="lyricSyncNext()" class="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition cursor-pointer" aria-label="Lirik maju satu baris"><i data-lucide="plus" class="w-3.5 h-3.5"></i></button>
                    </div>
                    <button onclick="toggleLyrics()" class="text-white/70 hover:text-white p-2 rounded-full active:scale-90 transition-all bg-white/10" aria-label="Tutup lirik"><i data-lucide="chevron-down" class="w-5 h-5"></i></button>
                </div>
            </div>

            <div class="flex-1 w-full overflow-hidden relative z-10 flex flex-col" style="min-height:0;">
                <div id="lyrics-scroll-container" class="w-full flex-1 overflow-y-auto px-5 hide-scrollbar relative" style="min-height:0;">
                    <div class="pt-6 pb-16 w-full max-w-xl mx-auto">
                        <div id="lyrics-loading" class="flex justify-center items-center h-[16vh] w-full">
                            <div class="w-8 h-8 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <div id="lyrics-content" class="hidden w-full"></div>
                        <div id="lyrics-empty" class="hidden flex justify-center items-center h-[16vh] w-full text-white/50">
                            <div class="text-center">
                                <i data-lucide="music" class="w-10 h-10 mx-auto mb-2 opacity-30"></i>
                                <p class="text-sm">Lirik tidak tersedia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
    },
    currentViewMode: 'cover',
    switchView(mode) {
        FullPlayer.currentViewMode = mode;
        var coverView = gid('full-cover-view');
        var lyricsView = gid('full-lyrics-view');
        var tabCover = gid('full-tab-cover');
        var tabLyrics = gid('full-tab-lyrics');

        if (mode === 'lyrics') {
            if (coverView) coverView.classList.add('hidden');
            if (lyricsView) lyricsView.classList.remove('hidden');

            if (tabCover) {
                tabCover.className = 'px-4 py-1 rounded-full text-xs font-bold transition-all text-white/60 hover:text-white bg-transparent cursor-pointer';
            }
            if (tabLyrics) {
                tabLyrics.className = 'px-4 py-1 rounded-full text-xs font-bold transition-all text-white bg-white/20 shadow-md cursor-pointer';
            }

            if (typeof setupLyricScrollListener === 'function') {
                setupLyricScrollListener();
            }
            if (typeof ULH === 'function') {
                ULH(typeof S !== 'undefined' ? (S.pt || 0) : 0, true);
            }
        } else {
            if (lyricsView) lyricsView.classList.add('hidden');
            if (coverView) coverView.classList.remove('hidden');

            if (tabCover) {
                tabCover.className = 'px-4 py-1 rounded-full text-xs font-bold transition-all text-white bg-white/20 shadow-md cursor-pointer';
            }
            if (tabLyrics) {
                tabLyrics.className = 'px-4 py-1 rounded-full text-xs font-bold transition-all text-white/60 hover:text-white bg-transparent cursor-pointer';
            }
        }
    },
    isOpen: false,
    open(){
        var fp=gid('full-player');
        if(!fp) return;
        FullPlayer.isOpen = true;
        fp.style.display='flex';
        document.body.style.overflow='hidden';
        void fp.offsetHeight;
        fp.style.transform='translate3d(0,0,0)';
        if(typeof MP !== 'undefined' && MP.hide) MP.hide();
        requestAnimationFrame(function(){
            try{
                updateSleepBadge();
                updateSpeedBadge();
                if(typeof UB==='function')UB();
                if(typeof updateLikeButtons==='function')updateLikeButtons();
                if(typeof updateOfflineButtons==='function')updateOfflineButtons();
                if(typeof updateVolumeUI==='function')updateVolumeUI();
                if(typeof updateRepeatUI==='function')updateRepeatUI();
                if(typeof updateShuffleUI==='function')updateShuffleUI();
                if(S.ct && typeof FullPlayer.updateBeats === 'function') FullPlayer.updateBeats(S.ct);
            }catch(e){}
        });
    },
    close(){
        var fp=gid('full-player');
        if(!fp) return;
        FullPlayer.isOpen = false;
        fp.style.transform='translate3d(0,100%,0)';
        document.body.style.overflow='';
        setTimeout(function(){
            fp.style.display='none';
            if(typeof S!=='undefined'&&!S.lo&&typeof MP!=='undefined')MP.show();
        },350);
    },
    openArtist(){if(S.ct&&S.ct.artistId){FullPlayer.close();setTimeout(function(){Artist.open(S.ct.artistId,S.ct.artist);},400);}},
    openAlbumInfo(){
        if(S.ct && typeof openSongInfo === 'function') openSongInfo(S.ct);
    },
    openOutputMenu(){
        if(typeof showToast==='function') showToast('Output audio browser ini adalah perangkat default');
    },
    closeSheet(id){
        var el = gid(id);
        if(!el) return;
        var panel = el.querySelector('.fp-sheet');
        if (panel) {
            panel.style.transition = 'transform 0.22s cubic-bezier(0.4,0,1,1)';
            panel.style.transform = 'translateY(100%)';
        }
        el.style.transition = 'opacity 0.22s ease';
        el.style.opacity = '0';
        setTimeout(function(){ if(el) el.remove(); }, 220);
    },
    enableSheetSwipe(sheetEl, panelEl, onClose) {
        var startY = 0, currentY = 0, dragging = false;
        panelEl.addEventListener('touchstart', function(e){
            startY = e.touches[0].clientY;
            dragging = true;
            panelEl.style.transition = 'none';
        }, { passive: true });
        panelEl.addEventListener('touchmove', function(e){
            if (!dragging) return;
            currentY = e.touches[0].clientY - startY;
            if (currentY < 0) currentY = 0;
            panelEl.style.transform = 'translateY(' + currentY + 'px)';
        }, { passive: true });
        panelEl.addEventListener('touchend', function(){
            dragging = false;
            panelEl.style.transition = 'transform 0.25s cubic-bezier(0.22,1,0.36,1)';
            if (currentY > 90) {
                onClose();
            } else {
                panelEl.style.transform = 'translateY(0)';
            }
            currentY = 0;
        });
    },
    openMoreSheet() {
        var existing = gid('full-more-sheet');
        if (existing) existing.remove();

        var sheet = document.createElement('div');
        sheet.id = 'full-more-sheet';
        sheet.className = 'fixed inset-0 z-[250] flex items-end justify-center bg-black/65 backdrop-blur-sm transition-opacity duration-200';
        sheet.onclick = function(e) { if (e.target === sheet) FullPlayer.closeSheet('full-more-sheet'); };

        var rows = [
            { icon: 'download', label: 'Download', action: "FullPlayer.closeSheet('full-more-sheet');downloadCurrentSong();" },
            { icon: 'heart', label: 'Tambahkan ke Disukai', action: "FullPlayer.closeSheet('full-more-sheet');toggleCurrentLike();" },
            { icon: 'list-plus', label: 'Tambahkan ke Playlist', action: "FullPlayer.closeSheet('full-more-sheet');addCurrentToPlaylist();" },
            { icon: 'list-music', label: 'Tambahkan ke Antrian', action: "FullPlayer.closeSheet('full-more-sheet');addToQueue(S.ct);" },
            { icon: 'user', label: 'Lihat Artist', action: "FullPlayer.closeSheet('full-more-sheet');FullPlayer.openArtist();" },
            { icon: 'info', label: 'Info Lagu', action: "FullPlayer.closeSheet('full-more-sheet');openSongInfo(S.ct);" },
            { icon: 'share-2', label: 'Bagikan', action: "FullPlayer.closeSheet('full-more-sheet');openShareCard();" }
        ];
        var rowsHtml = rows.map(function(r){
            return '<div class="fp-sheet-row" onclick="' + r.action + '">' +
                '<div class="fp-sheet-icon"><i data-lucide="' + r.icon + '" class="w-[18px] h-[18px] text-white"></i></div>' +
                '<span class="text-sm font-semibold text-white/95">' + r.label + '</span>' +
            '</div>';
        }).join('');

        var extraRows = [
            { icon: 'skip-forward', label: 'Auto Next', on: !!S.autoNext, action: "toggleAutoNext();" },
            { icon: 'clock', label: 'Sleep Timer', action: "FullPlayer.closeSheet('full-more-sheet');openSleepTimer();" },
            { icon: 'gauge', label: 'Kecepatan Putar', action: "FullPlayer.closeSheet('full-more-sheet');openPlaybackSpeed();" },
            { icon: 'list-music', label: 'Antrian', action: "FullPlayer.closeSheet('full-more-sheet');openQueue();" },
            { icon: 'wifi-off', label: 'Simpan Offline', action: "FullPlayer.closeSheet('full-more-sheet');toggleCurrentOffline();" }
        ];
        var extraHtml = extraRows.map(function(r){
            return '<div class="fp-sheet-row" onclick="' + r.action + '" style="' + (r.on ? 'opacity:1;' : '') + '">' +
                '<div class="fp-sheet-icon"><i data-lucide="' + r.icon + '" class="w-[18px] h-[18px] ' + (r.on ? 'text-rose-400' : 'text-white') + '"></i></div>' +
                '<span class="text-sm font-semibold ' + (r.on ? 'text-rose-400' : 'text-white/95') + '">' + r.label + '</span>' +
            '</div>';
        }).join('');

        sheet.innerHTML = `
        <div id="full-more-sheet-panel" class="fp-sheet bg-[#1a1918]/95 backdrop-blur-2xl w-full max-w-md rounded-t-[28px] pt-3 pb-5 px-3 border-t border-white/10 max-h-[80vh] overflow-y-auto hide-scrollbar" style="box-shadow:0 -20px 50px rgba(0,0,0,0.5);">
            <div class="w-10 h-1.5 bg-white/25 rounded-full mx-auto mb-4"></div>

            <div class="flex items-center gap-3 mb-3 p-3 rounded-2xl bg-white/5 mx-1">
                <img src="${(S.ct && S.ct.cover) ? S.ct.cover : FI}" class="w-12 h-12 rounded-xl object-cover" onerror="this.src='${FI}'" />
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-white text-sm truncate">${(S.ct && S.ct.title) ? es(S.ct.title) : 'Pilih Lagu'}</h4>
                    <p class="text-xs text-[#9a9490] truncate">${(S.ct && S.ct.artist) ? es(S.ct.artist) : ''}</p>
                </div>
                <button onclick="FullPlayer.closeSheet('full-more-sheet')" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white active:scale-90 transition cursor-pointer shrink-0"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>

            <div class="px-1">${rowsHtml}</div>
            <div class="h-px bg-white/10 my-2 mx-1"></div>
            <div class="px-1">${extraHtml}</div>
        </div>`;

        document.body.appendChild(sheet);
        lucide.createIcons();

        var panel = gid('full-more-sheet-panel');
        if (panel) FullPlayer.enableSheetSwipe(sheet, panel, function(){ FullPlayer.closeSheet('full-more-sheet'); });
    },
    applyColors(colors) {
        if (typeof S !== 'undefined') {
            S.currentAccentColor = 'var(--accent)';
        }

        // Full Player Progressbar Accent — themed gradient (falls back to theme accent)
        var fullProgress = gid('full-progress');
        if (fullProgress) {
            fullProgress.style.background = 'linear-gradient(90deg, var(--fp-accent-2, var(--accent-2)), var(--fp-accent, var(--accent)))';
        }

        // Play Button Background Accent — themed gradient
        var playBtn = gid('full-play-btn-wrap');
        if (playBtn) {
            playBtn.style.background = 'linear-gradient(135deg, var(--fp-accent, var(--accent)), var(--fp-accent-2, var(--accent-2)))';
            playBtn.style.boxShadow = '0 10px 32px rgba(var(--fp-accent-rgb, var(--accent-rgb)),0.55)';
        }

        // Keep background clean dark without colorful radial gradient blobs
        var fullGlow = gid('full-bg-glow');
        if (fullGlow) {
            fullGlow.style.background = 'none';
        }

        var lyricsGlow = gid('lyrics-bg-glow');
        if (lyricsGlow) {
            lyricsGlow.style.background = 'none';
        }
    },
    // Extract the dominant color from the cover artwork and use it to
    // theme the full-player card background, progress bar and play button.
    applyDynamicColor(rgb) {
        var card = gid('full-player-card');
        if (!card || !rgb) return;
        var r = Math.round(rgb[0]), g = Math.round(rgb[1]), b = Math.round(rgb[2]);

        // Boost saturation a touch so muted covers still read as colorful
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        if (max - min < 25) {
            var boost = 1.25;
            var mid = (r + g + b) / 3;
            r = Math.min(255, Math.max(0, Math.round(mid + (r - mid) * boost)));
            g = Math.min(255, Math.max(0, Math.round(mid + (g - mid) * boost)));
            b = Math.min(255, Math.max(0, Math.round(mid + (b - mid) * boost)));
        }

        var rgbStr = r + ',' + g + ',' + b;
        var accent = 'rgb(' + rgbStr + ')';
        var accent2 = 'rgb(' + Math.round(r * 0.62) + ',' + Math.round(g * 0.62) + ',' + Math.round(b * 0.62) + ')';

        card.style.setProperty('--fp-accent', accent);
        card.style.setProperty('--fp-accent-2', accent2);
        card.style.setProperty('--fp-accent-rgb', rgbStr);
        card.style.background = 'linear-gradient(180deg, rgba(' + rgbStr + ',0.38) 0%, rgba(20,19,18,0.94) 48%, #0b0a09 100%)';

        FullPlayer.applyColors(null);
    },
    extractCoverColor(src, callback) {
        if (!src) { callback(null); return; }
        try {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                try {
                    var size = 24;
                    var canvas = document.createElement('canvas');
                    canvas.width = size; canvas.height = size;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, size, size);
                    var data = ctx.getImageData(0, 0, size, size).data;
                    var rS = 0, gS = 0, bS = 0, cnt = 0, maxSat = -1, best = null;
                    for (var i = 0; i < data.length; i += 4) {
                        if (data[i + 3] < 180) continue;
                        var r = data[i], g = data[i + 1], b = data[i + 2];
                        rS += r; gS += g; bS += b; cnt++;
                        var sat = Math.max(r, g, b) - Math.min(r, g, b);
                        if (sat > maxSat) { maxSat = sat; best = [r, g, b]; }
                    }
                    if (!cnt) { callback(null); return; }
                    callback((best && maxSat > 16) ? best : [rS / cnt, gS / cnt, bS / cnt]);
                } catch (e) { callback(null); }
            };
            img.onerror = function () { callback(null); };
            img.src = src;
        } catch (e) { callback(null); }
    },
    updateBeats(track) {
        if (!track) return;

        if (track.cover) {
            ['full-bg-artwork', 'lyrics-bg-blur'].forEach(function(id) {
                var el = gid(id);
                if (el) el.src = track.cover;
            });
        }

        FullPlayer.applyColors(null);

        if (track.cover) {
            FullPlayer.extractCoverColor(track.cover, function(rgb) {
                if (rgb) FullPlayer.applyDynamicColor(rgb);
            });
        }
    }
};
