var Profile = {
    render() {
        var el = gid('view-dev');
        if(!el) return;
        el.innerHTML = `
        <div class="pt-8 pb-3.5 px-4 sticky top-0 z-30 border-b border-white/10 shadow-2xl transition-all" style="background: linear-gradient(180deg, rgba(232, 120, 159, 0.12) 0%, rgba(13, 13, 12, 0.45) 55%, rgba(13, 13, 12, 0.92) 100%); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
            <h1 class="text-3xl font-black text-white tracking-tight drop-shadow-md">Profil</h1>
        </div>
        <div class="pt-6 px-4 text-center">
            <div class="relative w-24 h-24 rounded-full mx-auto mb-6 glass-strong shine-sweep flex items-center justify-center overflow-hidden shadow-black/50">
                <i data-lucide="music" class="w-12 h-12 text-white/60 absolute"></i>
                <img src="/logo.png" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display='none'" />
            </div>
            <h1 class="text-3xl font-black chrome-text mb-1">MusifyRik</h1>
            <p class="text-[#9a9490] text-sm mb-6">Streaming Musik YouTube dengan Lirik</p>
            
            <div class="glass rounded-2xl p-5 max-w-sm mx-auto space-y-3 text-left mb-6">
                <h3 class="text-white font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                    <i data-lucide="smartphone" class="w-4 h-4 text-rose-400"></i> Aplikasi & PWA
                </h3>
                <div class="flex justify-between"><span class="text-white/70 text-sm">Nama</span><span class="text-white font-medium text-sm">MusifyRik</span></div>
                <div class="flex justify-between"><span class="text-white/70 text-sm">Versi</span><span class="text-white font-medium text-sm">v3.0.0</span></div>
                <div class="flex justify-between"><span class="text-white/70 text-sm">Mode Offline PWA</span><span class="text-emerald-400 font-bold text-sm flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Aktif</span></div>
                <div class="flex justify-between"><span class="text-white/70 text-sm">Service Worker</span><span class="text-white font-medium text-sm">${'serviceWorker' in navigator ? 'Terdaftar' : 'Tidak didukung'}</span></div>
                <div class="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span class="text-white/70 text-xs">Cache PWA tersimpan</span>
                    <button onclick="if(typeof clearPwaCache==='function') clearPwaCache();" class="text-xs text-rose-400 hover:text-rose-300 font-semibold underline active:scale-95">Bersihkan Cache</button>
                </div>
            </div>

            <div class="glass rounded-2xl p-5 max-w-sm mx-auto space-y-4 text-left mb-6">
                <h3 class="text-white font-bold text-sm uppercase tracking-wider mb-2 border-b border-white/10 pb-2 flex items-center gap-2">
                    <i data-lucide="code" class="w-4 h-4 text-rose-400"></i> Developer Profile
                </h3>
                <div class="flex justify-between items-center">
                    <span class="text-white/70 text-sm font-medium">Developed by</span>
                    <div class="flex items-center gap-2">
                        <img src="/dev.png" class="w-6 h-6 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" onerror="this.src='/logo.png'" />
                        <span class="text-white font-bold text-sm">Riki</span>
                    </div>
                </div>

                <div class="pt-1">
                    <div class="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <i data-lucide="heart" class="w-3.5 h-3.5 text-red-400 fill-current"></i> Lagu Yang Disukai
                    </div>
                    <p class="text-sm font-medium text-white/90 bg-white/5 p-2.5 rounded-xl border border-white/5">Semua lagu Raim Laode, Tulus & Hindia</p>
                </div>

                <div>
                    <div class="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <i data-lucide="disc" class="w-3.5 h-3.5 text-purple-400"></i> Playlist Yang Disukai
                    </div>
                    <p class="text-sm font-medium text-white/90 bg-white/5 p-2.5 rounded-xl border border-white/5">Semua album Raim Laode, Tulus & Hindia</p>
                </div>
            </div>
            
            <button onclick="if(typeof ThemeEngine!=='undefined') ThemeEngine.open();" class="w-full max-w-sm mx-auto btn-chrome font-bold py-4 rounded-full active:scale-95 transition-all text-center flex items-center justify-center gap-2 mb-3">
                <i data-lucide="palette" class="w-5 h-5"></i> Ganti Warna Tema
            </button>

            <button id="pwa-install-btn" onclick="installPWA()" class="${typeof isStandaloneApp !== 'undefined' && isStandaloneApp ? 'hidden ' : ''}w-full max-w-sm mx-auto btn-chrome font-bold py-4 rounded-full active:scale-95 transition-all text-center flex items-center justify-center gap-2 mb-3">
                <i data-lucide="download" class="w-5 h-5"></i> Install Aplikasi
            </button>

            <a href="https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I" target="_blank" rel="noopener noreferrer" class="wa-channel-btn max-w-sm mx-auto mb-3">
                <span class="wa-channel-icon"><i data-lucide="message-circle" class="w-5 h-5"></i></span>
                <span class="flex-1 min-w-0 text-left">
                    <span class="block text-sm font-bold">Saluran WhatsApp MusifyRik</span>
                    <span class="block text-[11px] text-white/50">Gabung untuk update rilis terbaru</span>
                </span>
                <i data-lucide="chevron-right" class="w-4 h-4 text-white/40"></i>
            </a>
        </div>`;
        lucide.createIcons();
    }
};

var Dev = Profile;
