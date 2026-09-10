var MP={
    init(){
        gid('mini-container').innerHTML=`
        <div id="mini-player" class="hidden fixed left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[160]" style="bottom:82px;transition:transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);will-change:transform;transform:translate3d(0,150px,0);">
            <div id="mini-player-inner" onclick="FullPlayer.open()" class="rounded-2xl px-3.5 py-2.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden bg-[rgba(54,50,48,0.55)] backdrop-blur-2xl border border-[rgba(232,120,159,0.12)] shadow-2xl group" style="box-shadow: 0 14px 34px rgba(0,0,0,0.55), 0 0 0 1px rgba(var(--accent-rgb),0.10);">
                
                <!-- Overlay for Next Song Transition (AutoNext last 10s) -->
                <div id="mini-next-overlay" class="absolute inset-0 pointer-events-none opacity-0 z-20 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#161514]/95 border border-white/30 backdrop-blur-2xl overflow-hidden">
                    <div class="relative w-11 h-11 shrink-0 flex items-center justify-center">
                        <div class="w-[34px] h-[34px] rounded-full overflow-hidden border border-white/20">
                            <img id="mini-cover-next" src="" class="w-full h-full object-cover rounded-full spin-record" style="animation-play-state: paused;" />
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div id="mini-title-next" class="font-bold text-xs sm:text-sm text-white truncate"></div>
                        <div id="mini-artist-next" class="text-white/70 text-[11px] truncate mt-0.5"></div>
                    </div>
                    <span id="mini-next-badge" class="text-[9px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/20 shrink-0 mr-12">NEXT</span>
                </div>
                
                <!-- Beat Visualizer Ambient Background (Khusus Beat) -->
                <div id="mini-beats-bg" class="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-500 overflow-hidden rounded-full z-0 hidden">
                    <div id="mini-beats-bg-gradient" class="absolute inset-0 transition-all duration-700"></div>
                </div>

                <!-- Thumbnail Bulat Berputar + Circular Progress Bar (Lingkaran Hitam) -->
                <div class="relative w-11 h-11 shrink-0 flex items-center justify-center z-10" onclick="FullPlayer.open(); if(typeof event !== 'undefined') event.stopPropagation();">
                    <svg class="w-11 h-11 -rotate-90 pointer-events-none absolute inset-0 z-10" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2.5"></circle>
                        <circle id="mini-circle-progress" cx="24" cy="24" r="21" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="131.95" stroke-dashoffset="131.95" stroke-linecap="round" class="transition-all duration-150"></circle>
                    </svg>
                    <div class="w-[34px] h-[34px] rounded-full overflow-hidden  z-0 border border-white/10">
                        <img id="mini-cover" src="" class="w-full h-full object-cover rounded-full spin-record" style="animation-play-state: paused;" />
                    </div>
                </div>

                <!-- Meta Info Judul & Artis (Lingkaran Putih Area) -->
                <div class="flex-1 min-w-0 z-10">
                    <div id="mini-title" class="font-bold text-xs sm:text-sm text-white truncate drop-shadow-sm">Pilih lagu</div>
                    <div id="mini-artist" class="text-[#9a9490] text-[11px] truncate mt-0.5"></div>
                </div>

                <!-- Controls: Prev, Play/Pause, Next and Heart -->
                <div class="flex items-center gap-1 z-10 shrink-0">
                    <button id="mini-prev-btn" onclick="PV(); if(typeof event !== 'undefined') event.stopPropagation();" class="text-white/70 hover:text-white active:scale-90 p-0.5 cursor-pointer transition-all duration-200" title="Lagu Sebelumnya" aria-label="Lagu Sebelumnya">
                        <div class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10 active:bg-white/20">
                            <i data-lucide="skip-back" class="w-3.5 h-3.5 fill-current"></i>
                        </div>
                    </button>
                    <button onclick="TP(); if(typeof event !== 'undefined') event.stopPropagation();" class="text-white active:scale-90 p-0.5 cursor-pointer" title="Putar/Jeda" aria-label="Putar atau Jeda">
                        <div id="mini-play-btn" class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 bg-white/10 border border-white/20 hover:bg-white/20">
                            <i data-lucide="play" class="w-4 h-4 fill-current ml-0.5"></i>
                        </div>
                    </button>
                    <button id="mini-next-btn" onclick="NX(); if(typeof event !== 'undefined') event.stopPropagation();" class="text-white/70 hover:text-white active:scale-90 p-0.5 cursor-pointer transition-all duration-200" title="Lagu Berikutnya" aria-label="Lagu Berikutnya">
                        <div class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10 active:bg-white/20">
                            <i data-lucide="skip-forward" class="w-3.5 h-3.5 fill-current"></i>
                        </div>
                    </button>
                    <button id="mini-like-btn" onclick="toggleCurrentLike(); if(typeof event !== 'undefined') event.stopPropagation();" class="text-[#9a9490] hover:text-rose-400 active:scale-90 p-1 cursor-pointer" title="Sukai Lagu" aria-label="Sukai Lagu">
                        <i data-lucide="heart" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
    },
    show(){
        if (!S || !S.ct || (!S.ct.id && !S.ct.videoId && !S.ct.title)) {
            return;
        }
        var mp=gid('mini-player');
        if(!mp) return;
        mp.classList.remove('hidden');
        void mp.offsetHeight;
        mp.style.transform='translate3d(0,0,0)';
        if (typeof S !== 'undefined' && S.ct) {
            MP.updateBeats(S.ct);
        }
    },
    hide(){
        var mp=gid('mini-player');
        if(!mp) return;
        mp.style.transform='translate3d(0,150px,0)';
        setTimeout(function(){mp.classList.add('hidden');},300);
    },
    getTrackColors(track) {
        if (!track) return ['#e8789f', '#7c3aed', '#2563eb', '#059669', '#d97706'];
        var str = (track.videoId || '') + (track.title || '') + (track.artist || '');
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        hash = Math.abs(hash);
        var baseHue = hash % 360;
        return [
            'hsl(' + baseHue + ', 88%, 50%)',
            'hsl(' + ((baseHue + 55) % 360) + ', 92%, 55%)',
            'hsl(' + ((baseHue + 140) % 360) + ', 82%, 46%)',
            'hsl(' + ((baseHue + 215) % 360) + ', 86%, 49%)',
            'hsl(' + ((baseHue + 295) % 360) + ', 84%, 48%)'
        ];
    },
    applyColors(colors) {
        var inner = gid("mini-player-inner");
        if (inner) inner.style.background = "linear-gradient(to right, rgba(var(--accent-rgb), 0.16), rgba(26, 25, 24, 0.92) 72%)";
        if (typeof S !== 'undefined') S.currentAccentColor = 'var(--accent)';

        var circleProgress = gid('mini-circle-progress');
        if (circleProgress) circleProgress.style.stroke = 'var(--accent)';

        var playBtn = gid('mini-play-btn');
        if (playBtn) playBtn.style.borderColor = 'rgba(var(--accent-rgb), 0.4)';

        if (typeof FullPlayer !== 'undefined' && FullPlayer.applyColors) {
            FullPlayer.applyColors(colors);
        }
    },
    extractFromImage(img) {
        try {
            var canvas = document.createElement('canvas');
            var size = 32;
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);
            var imgData = ctx.getImageData(0, 0, size, size).data;

            var regions = [
                { x0: 0, x1: 16, y0: 0, y1: 16 },   // Top-Left region
                { x0: 16, x1: 32, y0: 0, y1: 16 },  // Top-Right region
                { x0: 8, x1: 24, y0: 8, y1: 24 },   // Center region
                { x0: 0, x1: 16, y0: 16, y1: 32 },  // Bottom-Left region
                { x0: 16, x1: 32, y0: 16, y1: 32 }  // Bottom-Right region
            ];

            function formatColor(r, g, b) {
                var maxC = Math.max(r, g, b);
                if (maxC < 30) {
                    var factor = 30 / (maxC || 1);
                    r = Math.min(255, Math.round(r * factor + 12));
                    g = Math.min(255, Math.round(g * factor + 12));
                    b = Math.min(255, Math.round(b * factor + 12));
                }
                return 'rgb(' + r + ',' + g + ',' + b + ')';
            }

            function getRegionColor(reg) {
                var maxSat = -1, bestRGB = null;
                var rS = 0, gS = 0, bS = 0, cnt = 0;
                for (var y = reg.y0; y < reg.y1; y++) {
                    for (var x = reg.x0; x < reg.x1; x++) {
                        var idx = (y * size + x) * 4;
                        var r = imgData[idx], g = imgData[idx+1], b = imgData[idx+2];
                        rS += r; gS += g; bS += b; cnt++;
                        var maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
                        var sat = maxC - minC;
                        if (sat > maxSat) {
                            maxSat = sat;
                            bestRGB = [r, g, b];
                        }
                    }
                }
                if (bestRGB && maxSat > 12) {
                    return formatColor(bestRGB[0], bestRGB[1], bestRGB[2]);
                }
                if (cnt > 0) {
                    return formatColor(Math.round(rS/cnt), Math.round(gS/cnt), Math.round(bS/cnt));
                }
                return null;
            }

            var colors = regions.map(getRegionColor).filter(Boolean);
            if (colors.length >= 2) {
                while (colors.length < 5) {
                    colors.push(colors[colors.length % colors.length]);
                }
                return colors;
            }
        } catch(e) {}
        return null;
    },
    updateBeats(track) {
        if (!track) return;
        var palette = MP.getTrackColors(track);
        MP.applyColors(palette);
    }
};