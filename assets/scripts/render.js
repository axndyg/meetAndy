// Fills the window on experience / projects / slices-of-life from window.PAGE_DATA
// (set by one of the files in assets/data/).
//
// Text fields may contain HTML (links, <i>, <strong>, ...) and are inserted as-is.
// Paths that don't start with http(s) are treated as relative to assets/.

(function () {
    const ASSETS = '../assets/';

    const asset = path => /^https?:\/\//.test(path) ? path : ASSETS + path;
    const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const ext = href => `href="${attr(asset(href))}" target="_blank" rel="noopener"`;
    const slug = s => String(s).toLowerCase().replace(/<[^>]*>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const data = window.PAGE_DATA;
    const head = document.querySelector('.window-head');
    const body = document.querySelector('.window-body');

    // First click anywhere re-enables the small pane fade (skipped on arrival, see nav.js)
    document.addEventListener('click', () => document.documentElement.classList.remove('arrived'), { once: true });

    head.innerHTML = `<span class="eyebrow">${data.title}</span>`;

    // ---------- shared pieces ----------

    function linksRow(links) {
        if (!links) return '';
        const items = links.items.map(l => `<a ${ext(l.href)} class="archive-link">${l.text}</a>`).join(', ');
        return `<p class="links-row"><span class="label">${links.label}</span>${items}</p>`;
    }

    function tagRow(tags) {
        if (!tags || !tags.length) return '';
        const pills = tags.map(t => typeof t === 'string' ? `<span class="sk">${t}</span>` : t.html).join('');
        return `<div class="tag-row">${pills}</div>`;
    }

    // ← 1 / 3 → under a list that's too long for one page. Buttons carry data-step="-1" / "1".
    function pagerView(page, pages, what) {
        if (pages < 2) return '';
        return `
            <div class="pager">
                <button class="pager-btn" data-step="-1" aria-label="previous ${what}"${page === 0 ? ' disabled' : ''}>←</button>
                <span>${page + 1} / ${pages}</span>
                <button class="pager-btn" data-step="1" aria-label="next ${what}"${page === pages - 1 ? ' disabled' : ''}>→</button>
            </div>`;
    }
    const onPager = (root, go) => root.querySelectorAll('.pager-btn').forEach(b =>
        b.addEventListener('click', () => go(Number(b.dataset.step))));

    // A list split into pages that each fit the room it has, measured in the browser, so it
    // never scrolls whatever the text length or screen size. On phones the card grows with
    // its content instead, so everything shows on one page.
    //   host   element the list + arrows are drawn into
    //   rows   one HTML string per item; wrap(html) puts them in the list element
    //   room   () => px available inside host
    //   after  () => called after every draw (mark the selected item, bind hovers, ...)
    const PAGER_H = 46;   // the arrows' row, with its margin
    const phone = () => window.matchMedia('(max-width: 930px)').matches;

    function fittedList({ host, rows, wrap, room, what = 'page', after }) {
        let pages = [[0, rows.length]], page = 0, focus = -1;
        const fit = () => {
            pages = [[0, rows.length]];
            const space = phone() ? 0 : room();
            if (!space || !rows.length) return;
            host.innerHTML = wrap(rows.join(''));
            const box = [...host.firstElementChild.children].map(el => el.getBoundingClientRect());
            if (box[box.length - 1].bottom - box[0].top <= space) return;   // all fit, no arrows needed
            const fits = space - PAGER_H;
            pages = [];
            let start = 0;
            box.forEach((b, j) => {
                if (j > start && b.bottom - box[start].top > fits) { pages.push([start, j]); start = j; }
            });
            pages.push([start, rows.length]);
        };
        const draw = () => {
            page = Math.min(Math.max(page, 0), pages.length - 1);
            const [a, b] = pages[page];
            host.innerHTML = wrap(rows.slice(a, b).join('')) + pagerView(page, pages.length, what);
            onPager(host, step => { page += step; draw(); });
            if (after) after();
        };
        // open on the page holding item i (or stay put when i is -1)
        const show = i => {
            focus = i;
            const at = pages.findIndex(([a, b]) => i >= a && i < b);
            if (at >= 0) page = at;
            draw();
        };
        const api = {
            show(i) { fit(); show(i); },                        // re-measured each time: cheap, and never stale
            refit() { if (host.offsetParent) api.show(focus); }, // skipped while its tab is hidden
        };
        let t;
        window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(api.refit, 120); });
        if (document.fonts) document.fonts.ready.then(api.refit);   // text sizes change once the font loads
        return api;
    }

    // ═════════════ EXPERIENCE + PROJECTS: list (right) → main card ═════════════
    // Same layout as the slices journals: the list runs down the right and the picked item
    // fills the main card. #item-name in the URL keeps the pick (the first item by default).

    function listAndDetail({ label, listClass, items, key, row, detail }) {
        body.innerHTML = `
            <section class="tab-panel split">
                <div class="stage"></div>
                <aside class="journal">
                    <div class="journal-head eyebrow">${label}<span>${items.length}</span></div>
                    <div class="side-list"></div>
                </aside>
            </section>`;
        const stage = body.querySelector('.stage');
        const journal = body.querySelector('.journal');
        const host = body.querySelector('.side-list');
        let current = items[0];
        const list = fittedList({
            host,
            rows: items.map(it => `<li>${row(it, '#' + key(it))}</li>`),
            wrap: html => `<ol class="${listClass}">${html}</ol>`,
            room: () => journal.getBoundingClientRect().bottom - host.getBoundingClientRect().top,
            after: () => host.querySelectorAll('li > a').forEach(a =>
                a.classList.toggle('selected', a.getAttribute('href') === '#' + key(current))),
        });
        const show = () => {
            const picked = items.find(it => key(it) === decodeURIComponent(location.hash.slice(1)));
            current = picked || items[0];
            stage.innerHTML = detail(current);
            stage.scrollTop = 0;
            list.show(items.indexOf(current));   // the page the picked item is on
            if (picked && phone()) stage.scrollIntoView({ behavior: 'smooth' });
        };
        window.addEventListener('hashchange', show);
        show();
    }

    function jobView(job) {
        return `
            <div class="pane job-view">
                <span class="kicker">${job.org}</span>
                <h3>${job.role}</h3>
                <span class="date-tag">${job.dates}</span>
                <p>${job.description}</p>
                ${linksRow(job.links)}
            </div>`;
    }

    function renderExperience() {
        listAndDetail({
            label: 'timeline', listClass: 'timeline', items: data.entries,
            key: job => slug(job.role),
            row: (job, href) => `
                <a class="job" href="${href}">
                    <span class="job-role">${job.role}</span>
                    <span class="kicker job-org">${job.org}</span>
                    <span class="date-tag job-dates">${job.dates}</span>
                </a>`,
            detail: jobView,
        });
    }

    const BUTTON_ICONS = { code: 'images/icon/code-icon.png', file: 'images/icon/file-icon.png' };

    function projectDetail(p) {
        const live = p.live ? `
            <button class="live-btn">
                <a ${ext(p.live.href)}>
                    <img src="${asset(BUTTON_ICONS[p.live.icon || 'code'])}" class="button-icon" alt="">${p.live.text ?? 'live'}
                </a>
            </button>` : '';
        return `
            <div class="project-detail pane">
                <div class="project-detail-head">
                    ${p.logo ? `<img src="${asset(p.logo)}" alt="${attr(p.logoAlt || p.tab + ' logo')}">` : ''}
                    <h3>${p.title}</h3>
                    ${live}
                </div>
                <div class="project-specs kicker">
                    <span>${p.subtitle}</span>
                    <span class="date-tag">${p.dates}</span>
                </div>
                <p>${p.description}</p>
                ${linksRow(p.links)}
                ${tagRow(p.tags)}
            </div>`;
    }

    function renderProjects() {
        listAndDetail({
            label: 'portfolio', listClass: 'project-list', items: data.entries,
            key: p => slug(p.tab),
            row: (p, href) => `
                <a class="proj" href="${href}">
                    ${p.logo ? `<img src="${asset(p.logo)}" alt="">` : '<span></span>'}
                    <span class="proj-text">
                        <span class="proj-title">${p.title}</span>
                        <span class="kicker">${p.subtitle}</span>
                    </span>
                </a>`,
            detail: projectDetail,
        });
    }

    // ═════════════ SLICES OF LIFE ═════════════
    // URL keeps the state: #readings → tab, #readings/the-mark-of-zorro → that entry on the tab's set.

    // --- journal column: a pile of books / VHS tapes / DVD cases, newest on top ---
    // A pile holds STACK_MAX items; the rest go on further piles, flipped through with arrows.

    const STACK_MAX = { books: 6, vhs: 8, dvd: 9, cassette: 9 };   // how many fit on one pile
    const SPINE_COLORS = ['#3d4b55', '#56483b', '#3f5a50', '#4a4152', '#5c5246', '#34424d', '#4d5a44', '#5a3f3f'];
    const DVD_COLORS = ['#2d4a6b', '#6b2d3a', '#2f5d4f', '#5b4a2a', '#4a2f5d', '#2a2a2e', '#7a5a2a', '#355a6b'];
    const LABEL_COLORS = ['#e9e1cf', '#e6dcc4', '#ece6d6', '#e3d9c0'];
    const hash = str => [...String(str || '')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

    // One item in the pile, lying flat.
    function stackItem(s, e, sl) {
        const h = hash(e.title);
        const href = `#${sl}/${slug(e.title)}`;
        const fav = e.favorite ? '<span class="fav" title="favorite">★</span>' : '';
        if (s.stack === 'vhs') {
            const style = `--x:${(h >>> 3) % 10}px;--label:${LABEL_COLORS[h % LABEL_COLORS.length]};--tilt:${(h % 5) - 2}deg`;
            return `
                <a class="item${e.watchlist ? ' unwatched' : ''} vhs" href="${href}" style="${style}" title="${attr(e.title)}">
                    <span class="vhs-label"><span class="vhs-title">${e.title}</span>${fav}</span>
                    <span class="vhs-tag">${e.watchlist ? 'NEW' : e.current ? 'NOW' : 'SP'}</span>
                </a>`;
        }
        if (s.stack === 'cassette') {
            const style = `--shell:${SHELLS[h % SHELLS.length]};--band:${BANDS[(h >>> 3) % BANDS.length]};--x:${(h >>> 5) % 10}px`;
            return `
                <a class="item${e.watchlist ? ' unwatched' : ''} cas" href="${href}" style="${style}" title="${attr(e.title)}">
                    <span class="cas-title">${e.title}</span>
                    ${e.artist ? `<span class="cas-artist">${e.artist}</span>` : ''}${fav}
                </a>`;
        }
        if (s.stack === 'dvd') {
            const style = `--spine:${DVD_COLORS[h % DVD_COLORS.length]};--x:${(h >>> 3) % 10}px;--w:${86 + h % 14}%`;
            return `
                <a class="item${e.watchlist ? ' unwatched' : ''} dvd" href="${href}" style="${style}" title="${attr(e.title)}">
                    <span class="dvd-title">${e.title}</span>${fav}
                    ${e.current ? '<span class="dvd-tag">watching</span>' : ''}
                </a>`;
        }
        const style = `--spine:${SPINE_COLORS[h % SPINE_COLORS.length]};--w:${80 + h % 20}%;--x:${(h >>> 3) % 12}px;` +
                      `--h:${e.author ? 40 + (h >>> 5) % 8 : 32 + (h >>> 5) % 8}px;--tall:${118 + (h >>> 4) % 34}px;--thick:${30 + (h >>> 6) % 14}px`;
        return `
            <a class="item${e.watchlist ? ' unwatched' : ''} spine" href="${href}" style="${style}" title="${attr(e.title)}">
                ${e.current ? '<span class="ribbon" title="reading now"></span>' : ''}
                <span class="spine-title">${e.title}</span>
                ${e.author ? `<span class="spine-author">${e.author}</span>` : ''}
            </a>`;
    }

    const pileCount = s => Math.max(1, Math.ceil(s.log.length / (STACK_MAX[s.stack] || STACK_MAX.books)));
    const pileOf = (s, e) => Math.floor(s.log.indexOf(e) / (STACK_MAX[s.stack] || STACK_MAX.books));

    function journalView(s, page) {
        const sl = slug(s.tab);
        const max = STACK_MAX[s.stack] || STACK_MAX.books;
        const piles = pileCount(s);
        const pile = s.log.slice(page * max, page * max + max).map(e => stackItem(s, e, sl)).join('');
        return `
            <div class="journal-head eyebrow">${s.journal || 'journal'}<span>${s.log.length}</span></div>
            <div class="pile">${pile}</div>
            ${pagerView(page, piles, 'stack')}`;
    }

    // --- music: Spotify lookups, the tape deck, and the player ---

    const spotifyId = link => (String(link).match(/([A-Za-z0-9]{22})/) || [])[1];

    // Fill in title + album art for entries that only have a Spotify link.
    // Results are remembered in the visitor's browser so repeat visits don't ask again.
    function hydrateSpotify(s) {
        const todo = (s.log || []).filter(e => e.spotify);
        return Promise.all(todo.map(async e => {
            e.spotifyId = spotifyId(e.spotify);
            if (e.title && e.image) return;
            const key = 'spotify:' + e.spotifyId;
            let info = null;
            try { info = JSON.parse(localStorage.getItem(key)); } catch (_) {}
            if (!info) {
                try {
                    const r = await fetch('https://open.spotify.com/oembed?url=' +
                        encodeURIComponent('https://open.spotify.com/track/' + e.spotifyId));
                    const d = await r.json();
                    info = { title: d.title, image: d.thumbnail_url };
                    try { localStorage.setItem(key, JSON.stringify(info)); } catch (_) {}
                } catch (_) { info = {}; }
            }
            e.title = e.title || info.title || 'untitled track';
            e.image = e.image || info.image || s.icon;
        }));
    }

    const SHELLS = ['#2b2e33', '#3a2f2a', '#283632', '#352f3d', '#43372a', '#26303a', '#3b2a2e'];
    const BANDS = ['#b5533c', '#3f6f8a', '#558071', '#c19a3e', '#7a4f7a', '#9c4a3c'];
    const fmt = ms => { const t = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

    // --- set pieces: music's tape deck, film & tv's television, readings' book ---
    // The tab's intro stays on top and the set sits below it. Picking something in the
    // journal swaps only the .set-slot (see route); with nothing picked, a highlight is loaded.
    const featured = s => s.log.find(e => e.current) || s.log.find(e => e.favorite) || s.log[0];

    const setView = (s, cls, inner) => `
            <div class="pane set-view ${cls}">
                <div class="pane-head"><h3>${s.heading}</h3><img src="${asset(s.icon)}" alt=""></div>
                ${s.memo ? `<div class="memo">${s.memo.map(p => `<p>${p}</p>`).join('')}</div>` : ''}
                <div class="set-slot">${inner}</div>
            </div>`;

    // Text beside a set: status, title, author, note, link. Longer reviews go under the set.
    function setSide(e, status) {
        const meta = [status, e.date].filter(Boolean).join(' · ');
        const site = e.link ? new URL(asset(e.link), location.href).hostname.replace(/^www\./, '') : '';
        return `
                    <div class="deck-side">
                        <span class="kicker">${meta}</span>
                        <h3>${e.title}</h3>
                        ${e.author ? `<span class="entry-author">${e.author}</span>` : ''}
                        ${e.note ? `<p>${e.note}</p>` : ''}
                        ${e.link ? `<p class="links-row"><a ${ext(e.link)} class="archive-link">view on ${site} ↗</a></p>` : ''}
                    </div>`;
    }
    const setReview = e => e.review
        ? `<div class="set-review">${[].concat(e.review).map(p => `<p>${p}</p>`).join('')}</div>` : '';

    function tvView(s, e) {
        const status = e.current ? 'watching now' : e.watchlist ? 'on the watchlist' : e.favorite ? 'favorite' : 'now showing';
        return setView(s, 'tv-view', `
                <div class="tv-set">
                    <div class="tv" aria-hidden="true">
                        <div class="tv-antenna"></div>
                        <div class="tv-body">
                            <div class="tv-screen">
                                <img class="tv-glow" src="${asset(e.image)}" alt="">
                                <img class="tv-poster" src="${asset(e.image)}" alt="">
                            </div>
                            <div class="tv-panel"><span class="knob"></span><span class="knob"></span><span class="tv-grille"></span></div>
                        </div>
                        <div class="tv-legs"></div>
                    </div>
                    ${setSide(e, status)}
                </div>
                ${setReview(e)}`);
    }

    // Readings: the book pulled off the stack, a hardcover turned to show its pages.
    // The one being read now has a bookmark ribbon hanging out.
    function bookView(s, e) {
        const status = e.current ? 'reading now' : e.watchlist ? 'on the reading list' : e.favorite ? 'favorite' : 'finished';
        const h = hash(e.title);
        return setView(s, 'book-view', `
                <div class="book-set">
                    <div class="book" aria-hidden="true" style="--back:${SPINE_COLORS[h % SPINE_COLORS.length]}">
                        <div class="book-3d">
                            <span class="book-back"></span>
                            <span class="book-pages"></span>
                            ${e.current ? '<span class="book-ribbon"></span>' : ''}
                            <img class="book-cover" src="${asset(e.image)}" alt="">
                        </div>
                    </div>
                    ${setSide(e, status)}
                </div>
                ${setReview(e)}`);
    }

    function deckView(s, e) {
        const h = hash(e.title);
        const style = `--shell:${SHELLS[h % SHELLS.length]};--band:${BANDS[(h >>> 3) % BANDS.length]};--p:0`;
        return setView(s, 'deck-view', `
                <div class="deck" style="${style}">
                    <div class="cassette" aria-hidden="true">
                        <div class="cassette-label">
                            <span class="cassette-side">A</span>
                            <span class="cassette-title">${e.title}</span>
                            ${e.artist ? `<span class="cassette-artist">${e.artist}</span>` : ''}
                            <div class="cassette-window">
                                <div class="reel"><span class="pack left"></span><span class="hub"></span></div>
                                <div class="reel"><span class="pack right"></span><span class="hub"></span></div>
                            </div>
                        </div>
                        <div class="cassette-foot"></div>
                    </div>
                    <div class="deck-side">
                        <span class="kicker">now loaded</span>
                        <h3>${e.title}</h3>
                        ${e.artist ? `<span class="entry-author">${e.artist}</span>` : ''}
                        <div class="deck-controls">
                            <button class="play-btn" aria-label="play" disabled><span></span></button>
                            <div class="deck-progress"><div></div></div>
                            <span class="deck-time">0:00</span>
                        </div>
                        ${e.note ? `<p>${e.note}</p>` : ''}
                    </div>
                </div>
                <div class="deck-embed"><div class="spotify-slot"></div></div>`);
    }

    // Spotify's embed API: lets our play button drive the official player and tells us
    // when it's playing so the reels can spin.
    let spotifyApi = null, player = null;
    const loadSpotifyApi = () => spotifyApi || (spotifyApi = new Promise(resolve => {
        window.onSpotifyIframeApiReady = resolve;
        const tag = document.createElement('script');
        tag.src = 'https://open.spotify.com/embed/iframe-api/v1';
        tag.async = true;
        document.body.appendChild(tag);
    }));

    function stopPlayer() {
        if (player) { try { player.destroy(); } catch (_) {} player = null; }
    }

    function mountPlayer(stage, e) {
        const slot = stage.querySelector('.spotify-slot');
        const deck = stage.querySelector('.deck');
        const btn = stage.querySelector('.play-btn');
        const bar = stage.querySelector('.deck-progress div');
        const time = stage.querySelector('.deck-time');
        loadSpotifyApi().then(api => {
            if (!slot.isConnected) return;               // visitor already moved on
            api.createController(slot, { uri: 'spotify:track:' + e.spotifyId, width: '100%', height: 80 }, ctrl => {
                player = ctrl;
                btn.disabled = false;
                btn.addEventListener('click', () => ctrl.togglePlay());
                ctrl.addListener('playback_update', ({ data }) => {
                    const playing = !data.isPaused && !data.isBuffering;
                    deck.classList.toggle('playing', playing);
                    btn.setAttribute('aria-label', playing ? 'pause' : 'play');
                    const p = data.duration ? data.position / data.duration : 0;
                    deck.style.setProperty('--p', p.toFixed(4));
                    bar.style.width = (p * 100).toFixed(2) + '%';
                    time.textContent = data.duration ? `${fmt(data.position)} / ${fmt(data.duration)}` : '0:00';
                });
            });
        });
    }

    // --- travel: the log (left) + a spinning globe (right) ---
    // #travel → globe spins, the log lists countries; #travel/italy → globe turns to Italy,
    // the log shows Italy's card.

    function travelStage(s) {
        return `
            <div class="pane travel-stage">
                <div class="pane-head"><h3>${s.heading}</h3><img src="${asset(s.icon)}" alt=""></div>
                ${s.memo ? `<div class="memo">${s.memo.map(p => `<p>${p}</p>`).join('')}</div>` : ''}
                <div class="travel-log"></div>
            </div>`;
    }

    const tripCount = n => `${n} trip${n === 1 ? '' : 's'}`;

    // The passport sits under the globe: one stamp per country, paged to fit.
    const passportRows = s => s.countries.map(c => `
                <a class="stamp" href="#${slug(s.tab)}/${slug(c.name)}" data-code="${c.code}">
                    <span class="stamp-code">${c.code}</span>
                    <span class="stamp-name">${c.name}</span>
                    ${c.trips && c.trips.length ? `<span class="stamp-trips">${c.trips.length}</span>` : ''}
                </a>`);

    function countryCard(c) {
        const trips = c.trips || [];
        return `
            <div class="pane country-card">
                <button class="back-btn">← all countries</button>
                <span class="kicker">${c.code}${trips.length ? ' · ' + tripCount(trips.length) : ''}</span>
                <h3>${c.name}</h3>
                ${c.note ? `<p>${c.note}</p>` : ''}
                ${trips.map(t => `
                    <div class="trip">
                        ${t.image ? `<img class="trip-logo" src="${asset(t.image)}" alt="${attr(t.alt || t.title)}" loading="lazy">` : ''}
                        <div class="trip-text">
                            ${t.label || t.date ? `<span class="kicker">${[t.label, t.date].filter(Boolean).join(' · ')}</span>` : ''}
                            <h4>${t.title}</h4>
                            ${t.note ? `<p>${t.note}</p>` : ''}
                        </div>
                    </div>`).join('')}
                ${!trips.length && !c.note ? '<p class="loading">no trips logged yet.</p>' : ''}
            </div>`;
    }

    // --- kesem: the story (left) + name tag, video and donate button (right) ---

    function kesemPanel(s) {
        const roles = (s.roles || []).map(r =>
            `<li><span>${r.role}</span><span>${[r.chapter, r.year].filter(Boolean).join(' · ')}</span></li>`).join('');
        const story = (s.story || []).map(sec => `
            <section class="story-part">
                <h4 class="kicker">${sec.title}</h4>
                ${[].concat(sec.text).map(p => `<p>${p}</p>`).join('')}
            </section>`).join('');
        const photos = (s.photos || []).map((ph, i) => `
            <figure class="polaroid" style="--tilt:${[-3, 2, -1, 3][i % 4]}deg">
                <img src="${asset(ph.image)}" alt="${attr(ph.caption || 'camp photo')}" loading="lazy">
                ${ph.caption ? `<figcaption>${ph.caption}</figcaption>` : ''}
            </figure>`).join('');
        return `
            <div class="stage">
                <div class="pane">
                    <div class="pane-head"><h3>${s.heading}</h3><img src="${asset(s.icon)}" alt="${attr(s.iconAlt || '')}"></div>
                    <div class="story">${story}</div>
                </div>
            </div>
            <aside class="journal kesem-side">
                <div class="pane">
                    ${s.campName ? `
                    <div class="name-tag">
                        <div class="name-tag-top"><strong>HELLO</strong><span>my camp name is</span></div>
                        <div class="name-tag-name">${s.campName}</div>
                        ${roles ? `<ul class="name-tag-roles">${roles}</ul>` : ''}
                    </div>` : ''}
                    ${s.video ? `<iframe class="video" src="${attr(s.video.src)}" title="${attr(s.video.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" loading="lazy"></iframe>` : ''}
                    ${s.donate ? `<a class="donate-btn" ${ext(s.donate.href)}>${s.donate.text} ↗</a>` : ''}
                    ${photos ? `<div class="polaroids">${photos}</div>` : ''}
                </div>
            </aside>`;
    }

    function renderSlices() {
        head.innerHTML += `<nav class="tabs">${data.entries.map(s =>
            `<button class="tab" data-slug="${slug(s.tab)}">${s.tab}</button>`).join('')}</nav>`;

        // One container per tab; journal tabs get a stage (left) + journal (right).
        body.innerHTML = data.entries.map(s => s.countries
            ? `<section class="tab-panel split travel" data-slug="${slug(s.tab)}" hidden>
                   <div class="stage">${travelStage(s)}</div>
                   <aside class="journal globe-side">
                       <div class="globe"></div>
                       <div class="passport-box">
                           <div class="journal-head eyebrow">${s.journal || 'passport'}<span>${s.countries.length}</span></div>
                           <div class="passport-host"></div>
                       </div>
                   </aside>
               </section>`
            : s.log
            ? `<section class="tab-panel split" data-slug="${slug(s.tab)}" hidden>
                   <div class="stage"></div>
                   <aside class="journal"></aside>
               </section>`
            : `<section class="tab-panel split kesem" data-slug="${slug(s.tab)}" hidden>${kesemPanel(s)}</section>`
        ).join('');

        // Which pile each journal is showing; the arrows flip it, opening an entry jumps to its pile.
        const piles = new Map();
        const drawJournal = (s, page) => {
            const panel = body.querySelector(`.tab-panel[data-slug="${slug(s.tab)}"]`);
            const journal = panel.querySelector('.journal');
            piles.set(s, Math.min(Math.max(page, 0), pileCount(s) - 1));
            journal.innerHTML = journalView(s, piles.get(s));
            onPager(journal, step => {
                drawJournal(s, piles.get(s) + step);
                markSelected(panel);
            });
        };
        const markSelected = panel => {
            const sel = panel.dataset.selected;
            panel.querySelectorAll('.journal a').forEach(a => a.classList.toggle('selected', !!sel && a.getAttribute('href') === sel));
        };

        // Music entries only have Spotify links until their titles/art are looked up.
        const ready = new Map(data.entries.map(s => [s, !s.log || !s.log.some(e => e.spotify)]));
        data.entries.filter(s => s.log && ready.get(s)).forEach(s => drawJournal(s, 0));
        data.entries.filter(s => !ready.get(s)).forEach(s => {
            const panel = body.querySelector(`.tab-panel[data-slug="${slug(s.tab)}"]`);
            panel.querySelector('.journal').innerHTML = `<div class="journal-head eyebrow">${s.journal || 'journal'}</div><p class="loading">tuning in…</p>`;
            hydrateSpotify(s).then(() => {
                ready.set(s, true);
                drawJournal(s, 0);
                route();
            });
        });

        let globe = null, passport = null;
        const route = () => {
            stopPlayer();
            const [tabKey, entryKey] = decodeURIComponent(location.hash.slice(1)).split('/');
            const s = data.entries.find(x => slug(x.tab) === tabKey) || data.entries[0];
            const sl = slug(s.tab);

            head.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.slug === sl));
            body.querySelectorAll('.tab-panel').forEach(p => { p.hidden = p.dataset.slug !== sl; });

            if (s.log && !ready.get(s)) {
                body.querySelector(`.tab-panel[data-slug="${sl}"] .stage`).innerHTML =
                    `<div class="pane"><div class="pane-head"><h3>${s.heading}</h3><img src="${asset(s.icon)}" alt=""></div></div>`;
            } else if (s.log) {
                const panel = body.querySelector(`.tab-panel[data-slug="${sl}"]`);
                const stage = panel.querySelector('.stage');
                const picked = entryKey && s.log.find(e => slug(e.title) === entryKey);
                const setPiece = s.stack === 'cassette' ? deckView : s.stack === 'books' ? bookView : tvView;
                const entry = picked || featured(s);
                const swap = !!(entry && stage.querySelector('.set-view'));
                if (swap) {
                    // Only the set changes: the intro stays put while the new tape / channel comes in.
                    const next = document.createElement('div');
                    next.innerHTML = setPiece(s, entry);
                    const slot = next.querySelector('.set-slot');
                    slot.classList.add('swap');
                    stage.querySelector('.set-slot').replaceWith(slot);
                } else {
                    stage.innerHTML = entry ? setPiece(s, entry)
                        : `<div class="pane"><div class="pane-head"><h3>${s.heading}</h3><img src="${asset(s.icon)}" alt=""></div></div>`;
                }
                if (s.stack === 'cassette' && entry) mountPlayer(stage, entry);
                if (!swap) stage.scrollTop = 0;   // swapping keeps the visitor where they are
                if (entry && pileOf(s, entry) !== piles.get(s)) drawJournal(s, pileOf(s, entry));
                panel.dataset.selected = entry ? `#${sl}/${slug(entry.title)}` : '';
                markSelected(panel);
                // on phones the stage sits above the journal — bring the opened entry into view
                if (picked && window.matchMedia('(max-width: 930px)').matches)
                    (stage.querySelector('.set-slot') || stage).scrollIntoView({ behavior: 'smooth' });
            }
            if (s.countries) {
                const panel = body.querySelector(`.tab-panel[data-slug="${sl}"]`);
                const log = panel.querySelector('.travel-log');
                const country = entryKey && s.countries.find(c => slug(c.name) === entryKey);
                if (!globe && window.initGlobe) {
                    globe = initGlobe(panel.querySelector('.globe'), s.countries, code => {
                        const c = s.countries.find(x => x.code === code);
                        if (c) location.hash = `${sl}/${slug(c.name)}`;
                    });
                }
                if (!passport) {
                    const host = panel.querySelector('.passport-host');
                    passport = fittedList({
                        host,
                        rows: passportRows(s),
                        wrap: html => `<div class="passport">${html}</div>`,
                        room: () => host.clientHeight,
                        after: () => host.querySelectorAll('.stamp').forEach(a => {
                            a.classList.toggle('selected', a.getAttribute('href') === location.hash);
                            a.addEventListener('pointerenter', () => globe && globe.highlight(a.dataset.code));
                            a.addEventListener('pointerleave', () => globe && globe.highlight(null));
                        }),
                    });
                }
                passport.show(country ? s.countries.indexOf(country) : -1);
                log.innerHTML = country ? countryCard(country)
                    : `<p class="travel-hint">pick a country on the globe or in the passport to see its trips →</p>`;
                panel.querySelector('.travel-stage').classList.toggle('open', !!country);   // card takes the whole left side
                panel.querySelector('.stage').scrollTop = 0;
                if (globe) { globe.select(country ? country.code : null); globe.highlight(null); }
                const back = log.querySelector('.back-btn');
                if (back) back.addEventListener('click', () => { location.hash = sl; });
                if (country && window.matchMedia('(max-width: 930px)').matches) log.scrollIntoView({ behavior: 'smooth' });
            }
        };

        head.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
            history.replaceState(null, '', '#' + t.dataset.slug);
            route();
        }));
        window.addEventListener('hashchange', route);
        route();
    }

    ({ experience: renderExperience, projects: renderProjects, slices: renderSlices })[data.type]();
})();
