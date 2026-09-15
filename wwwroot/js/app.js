/**
 * app.js — JavaScript Interop for Gilbert Specialists Tech Blazor WASM
 *
 * All functions exposed under the global `GSTApp` namespace.
 * Called from C# via: await JS.InvokeVoidAsync("GSTApp.someMethod", ...args)
 */

window.GSTApp = (() => {

    let _scrollCb  = null;
    let _revealObs = null;

    // ── Nav scroll shrink — called with a .NET object ref ────
    function onScroll(dotNetRef) {
        if (_scrollCb) window.removeEventListener('scroll', _scrollCb);

        _scrollCb = () => {
            const scrolled = window.scrollY > 24;
            dotNetRef.invokeMethodAsync('SetScrolled', scrolled);
        };

        window.addEventListener('scroll', _scrollCb, { passive: true });
        _scrollCb();
    }

    // ── Body scroll lock (mobile menu) ───────────────────────
    function setBodyScroll(allow) {
        document.body.style.overflow = allow ? '' : 'hidden';
    }

    // ── Scroll Reveal (IntersectionObserver) ─────────────────
    // Called after each page navigation so new .reveal elements get observed.
    function initReveal() {
        if (_revealObs) _revealObs.disconnect();

        _revealObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => _revealObs.observe(el));
    }

    // ── Full init (called once by MainLayout on first render) ─
    function init() {
        initReveal();
    }

    return {
        init,
        initReveal,
        onScroll,
        setBodyScroll,
    };

})();
