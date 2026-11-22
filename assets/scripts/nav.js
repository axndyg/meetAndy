// Loaded (non-deferred) in the <head> of every page.

// 1. Only fade in when someone lands on the site, not when they're clicking between pages.
//    'no-intro' skips the card fade; 'arrived' also skips the first pane's fade
//    and is removed on the first click (see render.js / window.css) so tab switches still animate.
//    "Already seen" is remembered per browser tab (sessionStorage), so a new tab
//    or a fresh visit gets the intro again. Works on file://, localhost and the live site.
try {
    if (sessionStorage.getItem('introPlayed')) {
        document.documentElement.classList.add('no-intro', 'arrived');
    } else {
        sessionStorage.setItem('introPlayed', '1');
    }
} catch (e) { /* storage blocked (e.g. strict privacy mode) — just play the intro */ }

// 2. Start loading a page in the background as soon as its nav link is hovered,
//    so the click itself is near-instant. (Chrome/Edge; other browsers ignore this.)
if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    const rules = document.createElement('script');
    rules.type = 'speculationrules';
    rules.textContent = JSON.stringify({
        prerender: [{ source: 'document', where: { selector_matches: 'nav.footer a' }, eagerness: 'moderate' }],
    });
    document.head.appendChild(rules);
}
