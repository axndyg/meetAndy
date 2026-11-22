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

    // ═════════════ EXPERIENCE: timeline ═════════════
    // Each job is a one-line <details> that expands in place; name="jobs" makes it an
    // accordion (opening one closes the others), so the list always fits without scrolling.

    function renderExperience() {
        body.innerHTML = `<div class="timeline pane">${data.entries.map(job => `
            <details class="job" name="jobs">
                <summary>
                    <span class="job-role">${job.role}</span>
                    <span class="kicker job-org">${job.org}</span>
                    <span class="job-dates date-tag">${job.dates}</span>
                    <span class="job-chevron" aria-hidden="true"></span>
                </summary>
                <div class="job-body">
                    <p>${job.description}</p>
                    ${linksRow(job.links)}
                </div>
            </details>`).join('')}
        </div>`;
    }

    // ═════════════ PROJECTS: grid → detail ═════════════
    // Clicking a card sets #project-name in the URL, so the back button returns to the grid
    // and a project can be linked to directly.

    const BUTTON_ICONS = { code: 'images/icon/code-icon.png', file: 'images/icon/file-icon.png' };

    function projectCard(p) {
        return `
            <button class="project-card" data-slug="${slug(p.tab)}">
                <div class="project-card-top">
                    ${p.logo ? `<img src="${asset(p.logo)}" alt="">` : ''}
                    <div>
                        <h3>${p.title}</h3>
                        <span class="kicker">${p.subtitle}</span>
                    </div>
                </div>
                ${tagRow((p.tags || []).slice(0, 4))}
            </button>`;
    }

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
        const show = () => {
            const p = data.entries.find(e => slug(e.tab) === location.hash.slice(1));
            if (p) {
                head.innerHTML = `<span class="eyebrow">${data.title}</span><button class="back-btn">← all projects</button>`;
                head.querySelector('.back-btn').addEventListener('click', () => {
                    history.length > 1 && history.state?.fromGrid ? history.back() : (location.hash = '');
                });
                body.innerHTML = projectDetail(p);
            } else {
                head.innerHTML = `<span class="eyebrow">${data.title}</span>`;
                body.innerHTML = `<div class="project-grid pane">${data.entries.map(projectCard).join('')}</div>`;
                body.querySelectorAll('.project-card').forEach(card => card.addEventListener('click', () => {
                    history.pushState({ fromGrid: true }, '', '#' + card.dataset.slug);
                    show();
                }));
            }
            body.scrollTop = 0;
        };
        window.addEventListener('popstate', show);
        window.addEventListener('hashchange', show);
        show();
    }

    // ═════════════ SLICES OF LIFE ═════════════
    // URL keeps the state: #readings → tab, #readings/the-mark-of-zorro → that entry's page.

    const coverImg = (it, cls = '') =>
        `<img${cls ? ` class="${cls}"` : ''} src="${asset(it.image)}" alt="${attr(it.alt || it.title + ' cover')}" loading="lazy">`;

    // --- trophy case: built from the log ---
    function trophies(s) {
        const logged = s.log.filter(e => !e.watchlist);
        const picks = [];
        const add = (e, label) => { if (e && !picks.some(p => p.e === e)) picks.push({ e, label }); };
        logged.filter(e => e.current).forEach(e => add(e, 'Current'));
        add(logged.find(e => !e.current), 'Latest');
        s.log.filter(e => e.favorite).forEach(e => add(e, 'Favorite'));
        s.log.filter(e => e.watchlist).forEach(e => add(e, 'On the watchlist'));
        logged.forEach(e => picks.length < 3 && add(e, 'Recent'));
        return picks.slice(0, 4);
    }

    function caseView(s) {
        const sl = slug(s.tab);
        const cards = trophies(s).map(({ e, label }) => `
            <a class="trophy" href="#${sl}/${slug(e.title)}">
                <div class="shelf-cover">${coverImg(e)}</div>
                <span class="kicker">${label}</span>
                <h4>${e.title}</h4>
            </a>`).join('');
        return `
            <div class="pane">
                <div class="pane-head"><h3>${s.heading}</h3><img src="${asset(s.icon)}" alt=""></div>
                ${s.memo ? `<div class="memo">${s.memo.map(p => `<p>${p}</p>`).join('')}</div>` : ''}
                <div class="trophy-case${s.posters ? ' posters' : ''}${s.stack === 'cassette' ? ' albums' : ''}">${cards}</div>
            </div>`;
    }

    function entryView(s, e) {
        const status = e.current ? 'Current' : e.watchlist ? 'On the watchlist' : e.favorite ? 'Favorite' : '';
        const meta = [status, e.date].filter(Boolean).join(' · ');
        const site = e.link ? new URL(asset(e.link), location.href).hostname.replace(/^www\./, '') : '';
        const review = e.review ? [].concat(e.review).map(p => `<p>${p}</p>`).join('') : '';
        return `
            <div class="pane entry${s.posters ? ' posters' : ''}">
                <button class="back-btn">← ${s.heading}</button>
                <div class="entry-body">
                    <div class="entry-cover">${coverImg(e)}</div>
                    <div class="entry-text">
                        ${meta ? `<span class="kicker">${meta}</span>` : ''}
                        <h3>${e.title}</h3>
                        ${e.author ? `<span class="entry-author">${e.author}</span>` : ''}
                        ${e.note ? `<p>${e.note}</p>` : ''}
                        ${review}
                        ${e.link ? `<p class="links-row"><a ${ext(e.link)} class="archive-link">view on ${site} ↗</a></p>` : ''}
                    </div>
                </div>
            </div>`;
    }

    // --- journal column: a pile of books / VHS tapes / DVD cases, newest on top ---
    // Only the newest few sit on the pile; the full collection is on the shelf (#tab/_all).

    const STACK_MAX = { books: 6, vhs: 8, dvd: 9, cassette: 9 };   // how many fit on the pile before the rest go on the shelf
    const SPINE_COLORS = ['#3d4b55', '#56483b', '#3f5a50', '#4a4152', '#5c5246', '#34424d', '#4d5a44', '#5a3f3f'];
    const DVD_COLORS = ['#2d4a6b', '#6b2d3a', '#2f5d4f', '#5b4a2a', '#4a2f5d', '#2a2a2e', '#7a5a2a', '#355a6b'];
    const LABEL_COLORS = ['#e9e1cf', '#e6dcc4', '#ece6d6', '#e3d9c0'];
    const hash = str => [...String(str || '')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

    // One item in the pile (flat) or on the shelf (upright). Same markup, CSS turns it.
    function stackItem(s, e, sl) {
        const h = hash(e.title);
        const href = `#${sl}/${slug(e.title)}`;
        const fav = e.favorite ? '<span class="fav" title="favorite">★</span>' : '';
        if (s.stack === 'vhs') {
            const style = `--x:${(h >>> 3) % 10}px;--label:${LABEL_COLORS[h % LABEL_COLORS.length]};--tilt:${(h % 5) - 2}deg`;
            return `
                <a class="item vhs" href="${href}" style="${style}" title="${attr(e.title)}">
                    <span class="vhs-label"><span class="vhs-title">${e.title}</span>${fav}</span>
                    <span class="vhs-tag">${e.current ? 'NOW' : 'SP'}</span>
                </a>`;
        }
        if (s.stack === 'cassette') {
            const style = `--shell:${SHELLS[h % SHELLS.length]};--band:${BANDS[(h >>> 3) % BANDS.length]};--x:${(h >>> 5) % 10}px`;
            return `
                <a class="item cas" href="${href}" style="${style}" title="${attr(e.title)}">
                    <span class="cas-title">${e.title}</span>
                    ${e.artist ? `<span class="cas-artist">${e.artist}</span>` : ''}${fav}
                </a>`;
        }
        if (s.stack === 'dvd') {
            const style = `--spine:${DVD_COLORS[h % DVD_COLORS.length]};--x:${(h >>> 3) % 10}px;--w:${86 + h % 14}%`;
            return `
                <a class="item dvd" href="${href}" style="${style}" title="${attr(e.title)}">
                    <span class="dvd-title">${e.title}</span>${fav}
                    ${e.current ? '<span class="dvd-tag">watching</span>' : ''}
                </a>`;
        }
        const style = `--spine:${SPINE_COLORS[h % SPINE_COLORS.length]};--w:${80 + h % 20}%;--x:${(h >>> 3) % 12}px;` +
                      `--h:${e.author ? 40 + (h >>> 5) % 8 : 32 + (h >>> 5) % 8}px;--tall:${118 + (h >>> 4) % 34}px;--thick:${30 + (h >>> 6) % 14}px`;
        return `
            <a class="item spine" href="${href}" style="${style}" title="${attr(e.title)}">
                ${e.current ? '<span class="ribbon" title="reading now"></span>' : ''}
                <span class="spine-title">${e.title}</span>
                ${e.author ? `<span class="spine-author">${e.author}</span>` : ''}
            </a>`;
    }

    function journalView(s) {
        const sl = slug(s.tab);
        const logged = s.log.filter(e => !e.watchlist);
        const max = STACK_MAX[s.stack] || STACK_MAX.books;
        const pile = logged.slice(0, max).map(e => stackItem(s, e, sl)).join('');
        const more = logged.length > max
            ? `<a class="more-link" href="#${sl}/_all">${logged.length - max} more on the shelf →</a>`
            : logged.length > 3 ? `<a class="more-link" href="#${sl}/_all">see the whole shelf →</a>` : '';
        return `
            <div class="journal-head eyebrow">${s.journal || 'journal'}<span>${logged.length}</span></div>
            <div class="pile">${pile}</div>
            ${more}`;
    }

    // Stage view: the whole collection standing upright on shelves.
    function shelfView(s) {
        const sl = slug(s.tab);
        const logged = s.log.filter(e => !e.watchlist);
        return `
            <div class="pane">
                <button class="back-btn">← ${s.heading}</button>
                <div class="pane-head"><h3>${s.journal || 'journal'}</h3><span class="eyebrow">${logged.length} logged</span></div>
                <div class="bookcase">${logged.map(e => `<div class="slot">${stackItem(s, e, sl)}</div>`).join('')}</div>
            </div>`;
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

    function deckView(s, e) {
        const h = hash(e.title);
        const style = `--shell:${SHELLS[h % SHELLS.length]};--band:${BANDS[(h >>> 3) % BANDS.length]};--p:0`;
        return `
            <div class="pane deck-view">
                <button class="back-btn">← ${s.heading}</button>
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
                <div class="deck-embed"><div class="spotify-slot"></div></div>
            </div>`;
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

    // --- simple tabs (travel / kesem) ---
    function shelfItem(item) {
        let img = coverImg(item);
        if (item.link) img = `<a ${ext(item.link)}>${img}</a>`;
        return `
            <div class="shelf-item">
                <div class="shelf-cover">${img}</div>
                <div class="shelf-text">
                    ${item.label ? `<span class="kicker">${item.label}</span>` : ''}
                    <h4>${item.title}</h4>
                    <p>${item.note}</p>
                </div>
            </div>`;
    }

    function simplePane(s) {
        const kind = s.posters ? ' posters' : s.logos ? ' logos' : '';
        let html = `<div class="pane-head"><h3>${s.heading}</h3><img src="${asset(s.icon)}" alt=""></div>`;
        html += s.memo ? `<div class="memo">${s.memo.map(p => `<p>${p}</p>`).join('')}</div>` : '';
        if (s.map) html += '<div id="map"></div>';
        if (s.items) html += `<div class="shelf${kind}">${s.items.map(shelfItem).join('')}</div>`;
        if (s.subheading) html += `<h4 class="subheading">${s.subheading}</h4>`;
        if (s.spotify) {
            html += '<div class="gallery">' + s.spotify.map(id =>
                `<iframe src="https://open.spotify.com/embed/track/${id}?utm_source=generator" width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
            ).join('') + '</div>';
        }
        if (s.video) {
            html += `<iframe class="video" src="${attr(s.video.src)}" title="${attr(s.video.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" loading="lazy"></iframe>`;
        }
        return `<div class="pane">${html}</div>`;
    }

    function renderSlices() {
        head.innerHTML += `<nav class="tabs">${data.entries.map(s =>
            `<button class="tab" data-slug="${slug(s.tab)}">${s.tab}</button>`).join('')}</nav>`;

        // One container per tab; journal tabs get a stage (left) + journal (right).
        body.innerHTML = data.entries.map(s => s.log
            ? `<section class="tab-panel split" data-slug="${slug(s.tab)}" hidden>
                   <div class="stage"></div>
                   <aside class="journal">${s.log.some(e => e.spotify) ? '' : journalView(s)}</aside>
               </section>`
            : `<section class="tab-panel" data-slug="${slug(s.tab)}" hidden>${simplePane(s)}</section>`
        ).join('');

        // Music entries only have Spotify links until their titles/art are looked up.
        const ready = new Map(data.entries.map(s => [s, !s.log || !s.log.some(e => e.spotify)]));
        data.entries.filter(s => !ready.get(s)).forEach(s => {
            const panel = body.querySelector(`.tab-panel[data-slug="${slug(s.tab)}"]`);
            panel.querySelector('.journal').innerHTML = `<div class="journal-head eyebrow">${s.journal || 'journal'}</div><p class="loading">tuning in…</p>`;
            hydrateSpotify(s).then(() => {
                ready.set(s, true);
                panel.querySelector('.journal').innerHTML = journalView(s);
                route();
            });
        });

        let map = null;
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
                const entry = entryKey && s.log.find(e => slug(e.title) === entryKey);
                stage.innerHTML = entryKey === '_all' ? shelfView(s)
                    : entry ? (s.stack === 'cassette' ? deckView(s, entry) : entryView(s, entry))
                    : caseView(s);
                if (entry && s.stack === 'cassette') mountPlayer(stage, entry);
                stage.scrollTop = 0;
                panel.querySelectorAll('.journal a').forEach(a =>
                    a.classList.toggle('selected', !!entry && a.getAttribute('href') === `#${sl}/${entryKey}`));
                const back = stage.querySelector('.back-btn');
                if (back) back.addEventListener('click', () => { location.hash = sl; });
                // on phones the stage sits above the journal — bring the opened entry into view
                if (entry && window.matchMedia('(max-width: 930px)').matches) stage.scrollIntoView({ behavior: 'smooth' });
            }
            // The map library needs a visible container to size itself, so draw it on first view.
            if (s.map && !map && window.initTravelMap) map = initTravelMap('#map', s.map);
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
