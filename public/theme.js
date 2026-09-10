/* ==========================================================
   MusifyRik Theme Engine
   10 swappable accent themes, persisted via localStorage,
   applied live via [data-theme] on <html> — no reload needed.
   ========================================================== */
var ThemeEngine = {
    STORAGE_KEY: 'musifyrik_theme',
    themes: [
        { id: 'rose',    name: 'Rose',    swatch: 'linear-gradient(135deg,#e8789f,#d65ff3)' },
        { id: 'violet',  name: 'Violet',  swatch: 'linear-gradient(135deg,#a78bfa,#8b5cf6)' },
        { id: 'purple',  name: 'Purple',  swatch: 'linear-gradient(135deg,#c084fc,#a855f7)' },
        { id: 'pink',    name: 'Pink',    swatch: 'linear-gradient(135deg,#f472b6,#db2777)' },
        { id: 'red',     name: 'Red',     swatch: 'linear-gradient(135deg,#f87171,#dc2626)' },
        { id: 'orange',  name: 'Orange',  swatch: 'linear-gradient(135deg,#fb923c,#ea580c)' },
        { id: 'amber',   name: 'Amber',   swatch: 'linear-gradient(135deg,#fbbf24,#d97706)' },
        { id: 'green',   name: 'Green',   swatch: 'linear-gradient(135deg,#4ade80,#16a34a)' },
        { id: 'emerald', name: 'Emerald', swatch: 'linear-gradient(135deg,#34d399,#059669)' },
        { id: 'blue',    name: 'Blue',    swatch: 'linear-gradient(135deg,#60a5fa,#2563eb)' }
    ],

    getCurrent() {
        try { return localStorage.getItem(ThemeEngine.STORAGE_KEY) || 'rose'; }
        catch (e) { return 'rose'; }
    },

    apply(themeId, opts) {
        opts = opts || {};
        document.documentElement.setAttribute('data-theme', themeId);
        try { localStorage.setItem(ThemeEngine.STORAGE_KEY, themeId); } catch (e) {}
        var sheet = document.getElementById('theme-sheet');
        if (sheet) {
            sheet.querySelectorAll('.theme-swatch').forEach(function (el) {
                el.classList.toggle('selected', el.getAttribute('data-theme-id') === themeId);
            });
        }
        if (!opts.silent) {
            document.dispatchEvent(new CustomEvent('musifyrik:theme-change', { detail: { theme: themeId } }));
        }
    },

    open() {
        var backdrop = document.getElementById('theme-sheet-backdrop');
        if (backdrop) backdrop.classList.add('open');
    },

    close() {
        var backdrop = document.getElementById('theme-sheet-backdrop');
        if (backdrop) backdrop.classList.remove('open');
    },

    init() {
        var current = ThemeEngine.getCurrent();
        ThemeEngine.apply(current, { silent: true });

        var swatchesHtml = ThemeEngine.themes.map(function (t) {
            var sel = (t.id === current) ? ' selected' : '';
            return '<button type="button" class="theme-swatch' + sel + '" data-theme-id="' + t.id + '" ' +
                'style="background:' + t.swatch + '" title="' + t.name + '" ' +
                'onclick="ThemeEngine.apply(\'' + t.id + '\')"></button>';
        }).join('');

        var container = document.getElementById('theme-container');
        if (!container) return;

        container.innerHTML =
            '<button type="button" class="theme-fab" onclick="ThemeEngine.open()" title="Ganti Warna Tema" aria-label="Ganti Warna Tema">' +
                '<i data-lucide="palette" class="w-5 h-5"></i>' +
            '</button>' +
            '<div id="theme-sheet-backdrop" class="theme-sheet-backdrop" onclick="if(event.target===this) ThemeEngine.close()">' +
                '<div id="theme-sheet" class="theme-sheet">' +
                    '<div class="flex items-center justify-between mb-1">' +
                        '<div>' +
                            '<h3 class="text-base font-black text-white">Warna Tema</h3>' +
                            '<p class="text-xs text-white/50 mt-0.5">Pilih aksen warna favoritmu untuk MusifyRik</p>' +
                        '</div>' +
                        '<button type="button" onclick="ThemeEngine.close()" class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 active:scale-90 transition-all">' +
                            '<i data-lucide="x" class="w-4 h-4"></i>' +
                        '</button>' +
                    '</div>' +
                    '<div class="theme-swatch-grid">' + swatchesHtml + '</div>' +
                    '<a href="https://whatsapp.com/channel/0029VbClbR4AInPdUfdBQ53I" target="_blank" rel="noopener noreferrer" class="wa-channel-btn mt-5">' +
                        '<span class="wa-channel-icon"><i data-lucide="message-circle" class="w-5 h-5"></i></span>' +
                        '<span class="flex-1 min-w-0">' +
                            '<span class="block text-sm font-bold">Saluran WhatsApp MusifyRik</span>' +
                            '<span class="block text-[11px] text-white/50">Update rilis &amp; fitur terbaru dari Riki</span>' +
                        '</span>' +
                        '<i data-lucide="chevron-right" class="w-4 h-4 text-white/40"></i>' +
                    '</a>' +
                '</div>' +
            '</div>';

        if (window.lucide) lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('theme-container')) ThemeEngine.init();
});
