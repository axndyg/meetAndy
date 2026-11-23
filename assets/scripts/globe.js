// The travel globe: country outlines on an empty sphere that turns on its own.
// Visited countries are filled; clicking one calls onPick(code).
// Countries come from assets/data/slices.js (travel → countries). Needs d3-geo + topojson.
//
//   const globe = initGlobe(element, countries, onPick);
//   globe.select('IT')     spin Italy to the front and hold it there (null = resume spinning)
//   globe.highlight('IT')  light it up without moving (null = clear)
//
// Zoom: scroll wheel / trackpad, pinch on phones, or the + / − buttons.

(function () {
    const WORLD = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

    // ISO 3166 two-letter code → the numeric id world-atlas uses (5 chars per country).
    const ISO = 'AF004AL008DZ012AS016AD020AO024AI660AQ010AG028AR032AM051AW533AU036AT040AZ031BS044BH048BD050BB052BY112BE056BZ084BJ204BM060BT064BO068BA070BW072BV074BR076IO086BN096BG100BF854BI108KH116CM120CA124CV132KY136CF140TD148CL152CN156CX162CC166CO170KM174CG178CD180CK184CR188CI384HR191CU192CY196CZ203DK208DJ262DM212DO214EC218EG818SV222GQ226ER232EE233ET231FK238FO234FJ242FI246FR250GF254PF258TF260GA266GM270GE268DE276GH288GI292GR300GL304GD308GP312GU316GT320GN324GW624GY328HT332HM334VA336HN340HK344HU348IS352IN356ID360IR364IQ368IE372IL376IT380JM388JP392JO400KZ398KE404KI296KP408KR410KW414KG417LA418LV428LB422LS426LR430LY434LI438LT440LU442MO446MG450MW454MY458MV462ML466MT470MH584MQ474MR478MU480YT175MX484FM583MD498MC492MN496MS500MA504MZ508MM104NA516NR520NP524NL528NC540NZ554NI558NE562NG566NU570NF574MP580MK807NO578OM512PK586PW585PS275PA591PG598PY600PE604PH608PN612PL616PT620PR630QA634RE638RO642RU643RW646SH654KN659LC662PM666VC670WS882SM674ST678SA682SN686SC690SL694SG702SK703SI705SB090SO706ZA710GS239ES724LK144SD729SR740SJ744SZ748SE752CH756SY760TW158TJ762TZ834TH764TL626TG768TK772TO776TT780TN788TR792TM795TC796TV798UG800UA804AE784GB826US840UM581UY858UZ860VU548VE862VN704VG092VI850WF876EH732YE887ZM894ZW716AX248BQ535CW531GG831IM833JE832ME499BL652MF663RS688SX534SS728';
    const CODE_BY_ID = {};
    for (let i = 0; i < ISO.length; i += 5) CODE_BY_ID[ISO.slice(i + 2, i + 5)] = ISO.slice(i, i + 2);

    const SPIN = 6;            // degrees per second while idle
    const TILT = -22;          // resting tilt, shows a bit more of the north
    const SIZE = 500, R = 238; // svg viewBox and globe radius
    const MIN_ZOOM = 1, MAX_ZOOM = 8, PICK_ZOOM = 2.2;  // PICK_ZOOM: how close a clicked country comes in
    const NS = 'http://www.w3.org/2000/svg';

    let worldPromise = null;
    const loadWorld = () => worldPromise || (worldPromise = fetch(WORLD).then(r => r.json())
        .then(w => topojson.feature(w, w.objects.countries).features));

    // Center of a country's biggest piece, so France points at France rather than the
    // Atlantic (French Guiana) and the US at the lower 48.
    function center(f) {
        const g = f.geometry;
        if (g.type !== 'MultiPolygon') return d3.geoCentroid(f);
        const biggest = g.coordinates
            .map(c => ({ type: 'Polygon', coordinates: c }))
            .reduce((a, b) => (d3.geoArea(b) > d3.geoArea(a) ? b : a));
        return d3.geoCentroid(biggest);
    }

    window.initGlobe = function (el, countries, onPick) {
        const visited = new Map(countries.map(c => [c.code, c]));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        el.innerHTML = `
            <svg viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="Globe of the countries I've visited">
                <circle class="globe-sphere" cx="${SIZE / 2}" cy="${SIZE / 2}" r="${R}"></circle>
                <g class="globe-countries"></g>
                <g class="globe-dots"></g>
            </svg>
            <div class="globe-label" aria-hidden="true"></div>
            <div class="globe-zoom">
                <button type="button" data-zoom="in" aria-label="zoom in">+</button>
                <button type="button" data-zoom="out" aria-label="zoom out">−</button>
            </div>`;
        const svg = el.querySelector('svg');
        const label = el.querySelector('.globe-label');

        const projection = d3.geoOrthographic().scale(R).translate([SIZE / 2, SIZE / 2]).clipAngle(90).precision(0.6)
            .clipExtent([[0, 0], [SIZE, SIZE]]);
        const path = d3.geoPath(projection);

        let rot = [20, TILT, 0];        // start over the Atlantic: Americas + Europe in view
        let zoom = 1;
        let shapes = [];                // { f, node }
        let dots = [];                  // { c, at, node } — countries too small for the map
        const centers = new Map();      // code → [lon, lat]
        let selected = null, hovering = false, dragging = null, tween = null;
        let dirty = true, last = 0;

        const clampZoom = z => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
        const circle = svg.querySelector('.globe-sphere');

        function draw() {
            projection.rotate(rot).scale(R * zoom);
            circle.setAttribute('r', (R * zoom).toFixed(1));
            for (const s of shapes) s.node.setAttribute('d', path(s.f) || '');
            const front = [-rot[0], -rot[1]];
            for (const d of dots) {
                const [x, y] = projection(d.at);
                const show = d3.geoDistance(d.at, front) < Math.PI / 2 - 0.02 &&
                             x > 0 && x < SIZE && y > 0 && y < SIZE;
                d.node.style.display = show ? '' : 'none';
                if (show) {
                    d.node.setAttribute('cx', x.toFixed(1));
                    d.node.setAttribute('cy', y.toFixed(1));
                }
            }
        }

        function frame(t) {
            const dt = last ? Math.min(t - last, 100) / 1000 : 0;
            last = t;
            if (tween) {
                const k = Math.min((t - tween.start) / tween.ms, 1);
                const e = 1 - Math.pow(1 - k, 3);
                rot = [tween.from[0] + tween.d[0] * e, tween.from[1] + tween.d[1] * e, 0];
                zoom = tween.z0 + (tween.z1 - tween.z0) * e;
                if (k === 1) tween = null;
                dirty = true;
            } else if (!selected && !hovering && !dragging && !reduceMotion) {
                rot[0] = (rot[0] + SPIN * dt / zoom) % 360;
                dirty = true;
            }
            // skip drawing while the travel tab is hidden
            if (dirty && el.offsetParent !== null) { draw(); dirty = false; }
            requestAnimationFrame(frame);
        }

        // Animate rotation (to [lon, lat] at the front) and zoom together.
        function spinTo(lonLat, z = zoom, ms = 900) {
            const to = lonLat ? [-lonLat[0], Math.max(-70, Math.min(70, -lonLat[1]))] : [rot[0], TILT];
            const d = [((to[0] - rot[0]) % 360 + 540) % 360 - 180, to[1] - rot[1]];
            tween = { from: rot.slice(), d, z0: zoom, z1: clampZoom(z), start: performance.now(), ms: reduceMotion ? 1 : ms };
        }
        const zoomBy = f => { const c = [-rot[0], -rot[1]]; spinTo(c, zoom * f, 250); tween.d = [0, 0]; };

        function setClass(cls, code) {
            svg.querySelectorAll('.' + cls).forEach(n => n.classList.remove(cls));
            if (code) svg.querySelectorAll(`[data-code="${code}"]`).forEach(n => n.classList.add(cls));
        }

        loadWorld().then(features => {
            const g = svg.querySelector('.globe-countries');
            shapes = features.map(f => {
                const node = document.createElementNS(NS, 'path');
                const code = CODE_BY_ID[f.id];
                const c = code && visited.get(code);
                node.setAttribute('class', 'country' + (c ? ' visited' : ''));
                if (code) node.dataset.code = code;
                node.dataset.name = c ? c.name : f.properties.name;
                if (c) centers.set(code, c.at || center(f));
                g.appendChild(node);
                return { f, node };
            });

            // Visited countries the 110m map doesn't draw (San Marino, Vatican City, ...)
            const dg = svg.querySelector('.globe-dots');
            dots = countries.filter(c => !centers.has(c.code) && c.at).map(c => {
                const node = document.createElementNS(NS, 'circle');
                node.setAttribute('r', '4.5');
                node.setAttribute('class', 'globe-dot visited');
                node.dataset.code = c.code;
                node.dataset.name = c.name;
                dg.appendChild(node);
                centers.set(c.code, c.at);
                return { c, at: c.at, node };
            });

            setClass('selected', selected);
            if (selected && centers.has(selected)) spinTo(centers.get(selected), Math.max(zoom, PICK_ZOOM));
            dirty = true;
        });

        // --- hover: pause and name the country ---
        svg.addEventListener('pointerenter', () => { hovering = true; });
        svg.addEventListener('pointerleave', () => { hovering = false; label.textContent = ''; });
        svg.addEventListener('pointerover', e => {
            const n = e.target.closest('[data-name]');
            label.textContent = n ? n.dataset.name : '';
        });

        // --- drag to spin, pinch to zoom; a press that barely moves is a click ---
        const pointers = new Map();     // pointerId → [x, y]
        let pinch = null;
        const spread = () => { const [a, b] = [...pointers.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
        const degPerPx = () => (SIZE / svg.getBoundingClientRect().width) * (180 / Math.PI) / (R * zoom);

        svg.addEventListener('pointerdown', e => {
            if (e.target.closest('.globe-zoom')) return;
            pointers.set(e.pointerId, [e.clientX, e.clientY]);
            svg.setPointerCapture(e.pointerId);
            if (pointers.size === 2) {                 // second finger: start a pinch
                pinch = { d: spread(), zoom };
                dragging = null;
            } else if (pointers.size === 1) {
                dragging = { x: e.clientX, y: e.clientY, rot: rot.slice(), moved: false,
                             target: e.target.closest('.visited') };
            }
        });
        svg.addEventListener('pointermove', e => {
            if (!pointers.has(e.pointerId)) return;
            pointers.set(e.pointerId, [e.clientX, e.clientY]);
            if (pinch && pointers.size === 2) {
                tween = null;
                zoom = clampZoom(pinch.zoom * spread() / pinch.d);
                dirty = true;
                return;
            }
            if (!dragging) return;
            const dx = e.clientX - dragging.x, dy = e.clientY - dragging.y;
            if (!dragging.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
            dragging.moved = true;
            tween = null;
            const k = degPerPx();
            rot = [dragging.rot[0] + dx * k, Math.max(-70, Math.min(70, dragging.rot[1] - dy * k)), 0];
            dirty = true;
        });
        const release = e => {
            pointers.delete(e.pointerId);
            if (pointers.size < 2) pinch = null;
            if (!dragging) return;
            const { moved, target } = dragging;
            dragging = null;
            if (!moved && target && e.type === 'pointerup') onPick(target.dataset.code);
        };
        svg.addEventListener('pointerup', release);
        svg.addEventListener('pointercancel', release);

        svg.addEventListener('wheel', e => {
            e.preventDefault();
            tween = null;
            const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
            zoom = clampZoom(zoom * Math.exp(-dy * 0.0025));
            dirty = true;
        }, { passive: false });

        el.querySelectorAll('.globe-zoom button').forEach(b =>
            b.addEventListener('click', () => zoomBy(b.dataset.zoom === 'in' ? 1.6 : 1 / 1.6)));

        requestAnimationFrame(frame);

        return {
            select(code) {
                if (code === selected) return;
                selected = code || null;
                setClass('selected', selected);
                if (selected && centers.has(selected)) spinTo(centers.get(selected), Math.max(zoom, PICK_ZOOM));
                else if (!selected) spinTo(null, 1, 700);   // back out to the whole globe, then keep spinning
            },
            highlight(code) { setClass('hot', code); },
        };
    };
})();
