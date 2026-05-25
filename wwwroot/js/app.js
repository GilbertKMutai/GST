/**
 * app.js — JavaScript Interop for Gilbert Specialists Tech Blazor WASM
 *
 * All functions exposed under the global `GSTApp` namespace.
 * Called from C# via: await JS.InvokeVoidAsync("GSTApp.someMethod", ...args)
 *
 * This file is referenced in wwwroot/index.html as a regular <script> tag
 * loaded AFTER blazor.webassembly.js.
 */

window.GSTApp = (() => {

    // ── Internal State ───────────────────────────────────────
    let _cursorRAF  = null;
    let _scrollCb   = null;
    let _revealObs  = null;
    let mx = 0, my = 0, rx = 0, ry = 0;

    // ── Cursor ───────────────────────────────────────────────
    function initCursor() {
        const dot  = document.getElementById('cursor');
        const ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            dot.style.left = mx + 'px';
            dot.style.top  = my + 'px';
        });

        function loop() {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.left = rx + 'px';
            ring.style.top  = ry + 'px';
            _cursorRAF = requestAnimationFrame(loop);
        }
        loop();
    }

    // ── Theme ────────────────────────────────────────────────
    function restoreTheme() {
        const saved = localStorage.getItem('gst-theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next    = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('gst-theme', next);
    }

    // ── Nav scroll shrink — called with a .NET object ref ────
    function onScroll(dotNetRef) {
        // Remove previous listener if any (Blazor re-renders on navigation)
        if (_scrollCb) window.removeEventListener('scroll', _scrollCb);

        _scrollCb = () => {
            const scrolled = window.scrollY > 60;
            dotNetRef.invokeMethodAsync('SetScrolled', scrolled);
        };

        window.addEventListener('scroll', _scrollCb, { passive: true });
        // Fire immediately to set initial state
        _scrollCb();
    }

    // ── Body scroll lock (mobile menu) ───────────────────────
    function setBodyScroll(allow) {
        document.body.style.overflow = allow ? '' : 'hidden';
    }

    // ── Scroll Reveal (IntersectionObserver) ─────────────────
    // Called after each page navigation so new .reveal elements get observed.
    function initReveal() {
        // Disconnect previous observer to avoid watching stale elements
        if (_revealObs) _revealObs.disconnect();

        _revealObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.07, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach(el => _revealObs.observe(el));
    }

    // ── Full init (called once by MainLayout on first render) ─
    function init() {
        restoreTheme();
        initCursor();
        initReveal();
    }

    // ── Public API ───────────────────────────────────────────
    return {
        init,
        initReveal,
        toggleTheme,
        onScroll,
        setBodyScroll,
    };

})();
