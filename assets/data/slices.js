// ─────────────────────────────────────────────────────────────
// SLICES OF LIFE — one entry per tab.
//
// Tab fields:
//   tab        text on the tab (also the link: #readings, #movies, ...)
//   heading    title at the top of the tab
//   icon       header image, relative to assets/
//   memo       list of intro paragraphs (HTML allowed)
//
// ── Journal tabs (readings / movies / tv) ──
//   journal    name of the right-hand column ('the stack', 'film diary', ...)
//   stack      how the journal is drawn, and the set piece on the main card:
//              'books' (spines → a hardcover), 'vhs' (tapes → a TV), 'dvd' (box sets → a TV)
//              or 'cassette' (music → a tape deck that plays the song).
//              Picking something in the journal loads it into the set; with nothing picked,
//              the current entry is loaded, else a favorite, else the newest.
//   log        everything you've read / watched, NEWEST FIRST. Each entry:
//     title      name of the thing
//     author     optional (shown on book spines)
//     date       optional, free text: 'nov 2026'
//     image      cover, relative to assets/
//     link       optional: goodreads / letterboxd / imdb ...
//     note       a sentence or two (HTML allowed) — shown beside the set
//     review     optional longer thoughts — shown under the set (HTML allowed)
//     current    true = reading / watching it now (a book gets a bookmark ribbon)
//     favorite   true = marked with a ★
//     watchlist  true = not watched yet — faded on the pile
//     spotify    music only: a Spotify song link. Title + album art fill in automatically.
//     artist     music only, optional: shown on the tape label
//
//   To log a new movie: drop the poster in assets/images/icon/sol/mov/ and add an
//   entry at the top of that tab's log. It lands on top of the pile.
//
// ── Travel ──
//   countries  one card per country you've been to; each fills in on the globe.
//     code       two-letter country code ('IT')
//     name       shown on the card and the globe
//     note       optional, a line about the country (HTML allowed)
//     trips      optional, newest first: { title, label, date, image, note }
//                label is free text ('Next', 'Latest', 'Favorite', ...)
//     at         only for countries too small for the map: [longitude, latitude]
//
// ── KESEM ──
//   campName   your camp name, on the name tag
//   roles      [{ role, chapter, year }] — printed on the name tag
//   story      [{ title, text: [paragraphs] }]
//   video      { src, title } (YouTube embed link)
//   donate     { href, text } — the button under the video
//   photos     optional [{ image, caption }] — shown as polaroids
// ─────────────────────────────────────────────────────────────

window.PAGE_DATA = {
    type: 'slices',
    title: 'journal',
    entries: [
        {
            tab: 'travel',
            heading: 'my travels',
            icon: 'images/icon/sol/tl/world.png',
            iconAlt: 'world logo',
            memo: [
                `I've sort of picked up a bug while traveling. It's a real blessing to get to see so much of the world.`,
                `Give the globe a spin and click a country to see what I got up to there.
                 I hope I'm blessed enough to fill out more.`,
            ],
            journal: 'passport',
            // One card per country — the globe fills in every country listed here.
            // code: two-letter country code (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
            // Add trips to a country's list as you go, newest first.
            countries: [
                {
                    code: 'ES', name: 'Spain',
                    trips: [
                        {
                            label: 'Awesome', title: 'Sevilla to Porto', date: '',
                            image: 'images/icon/sol/tl/spain.png', alt: 'spain logo',
                            note: `The Spring Break prior was a bit calm in Sacramento.
                                   A week in Sevilla really does it. Please contact me for any leads
                                   on the sweet <a href="https://vinumplaysevilla.com/2025/05/26/vino-naranja-de-sevilla-un-tesoro-unico-para-descubrir-y-maridar/">
                                   vino de naranja</a> they had there.`,
                        },
                    ],
                },
                {
                    code: 'US', name: 'United States',
                    trips: [
                        {
                            label: 'Latest', title: "Oahu, Hawai'i", date: '',
                            image: 'images/icon/sol/tl/aulani.png', alt: 'aulani logo',
                            note: `Our family is big on all things Disney. Naturally
                                   we spent a bit of time at Aulani.`,
                        },
                    ],
                },
                {
                    code: 'IT', name: 'Italy',
                    trips: [
                        {
                            label: 'Favorite', title: 'Florence Study Abroad', date: '',
                            image: 'images/icon/sol/tl/florence.png', alt: 'florence logo',
                            note: `I had three awesome months abroad in Florence
                                   for my last semester in comunity college. <i>La Doce Vita</i>
                                   as they say.`,
                        },
                    ],
                },
                { code: 'PT', name: 'Portugal' },
                { code: 'MX', name: 'Mexico' },
                { code: 'HN', name: 'Honduras' },
                { code: 'GB', name: 'United Kingdom' },
                { code: 'FR', name: 'France' },
                { code: 'BE', name: 'Belgium' },
                { code: 'NL', name: 'Netherlands' },
                { code: 'SI', name: 'Slovenia' },
                // too small for the globe's map, so they show as dots: at = [longitude, latitude]
                { code: 'SM', name: 'San Marino', at: [12.46, 43.94] },
                { code: 'VA', name: 'Vatican City', at: [12.45, 41.90] },
            ],
        },
        {
            tab: 'readings',
            heading: 'my bookcase',
            icon: 'images/icon/sol/rd/book.png',
            iconAlt: 'book logo',
            memo: [
                `I've been raised on reading mostly through the Scholastic Book Fair. I still remember purusing through like the carnival came in town.`,
                `Always, I would come home with the little catalog with every book that came with a Lego conveniently circled petitioning to my mom
                 it was an essential read.`,
            ],
            journal: 'the stack',
            stack: 'books',
            // Newest first — add new books at the TOP.
            log: [
                {
                    title: 'Lust for Life', author: 'Irving Stone', date: '',
                    image: 'images/icon/sol/rd/lfl.jpg',
                    link: 'https://www.goodreads.com/book/show/79834.Lust_for_Life',
                    note: `I started with Stone's account on Michelangelo. His writing has a power to feel as if his characters are on of your good friends by the end. This one on Van Vogh has been just as vivid so far`,
                },
                {
                    title: 'The Count of Monte Cristo', author: 'Alexandre Dumas',  date: '',
                    image: 'images/icon/sol/rd/count.jpg',
                    link: 'https://www.gutenberg.org/ebooks/1184',
                    note: `A hefty book, but a classic is a classic. I thoroughly enjoyed the read and could feel
                           the importance of it.`,
                },
                {
                    title: 'The Mark of Zorro', author: 'Johnston McCulley', date: '',
                    image: 'images/icon/sol/rd/zorro.jpg',
                    link: 'https://www.gutenberg.org/ebooks/61620',
                    note: `A quick read to help me get back into the habit. A light and enjoyable story.`,
                },
                {
                    title: 'The Lies of Locke Lamora', author: 'Scott Lynch', favorite: true, date: '',
                    image: 'images/icon/sol/rd/locke.jpg',
                    link: 'https://www.goodreads.com/book/show/29588376-the-lies-of-locke-lamora',
                    note: `I've never read a world that felt so vivid. The last two books of the series have
                           since released and I'm hoping to loop back.`,
                },
            ],
        },
        {
            tab: 'movies',
            heading: "what i'm watching",
            icon: 'images/icon/sol/mov/film.png',
            iconAlt: 'film logo',
            memo: [
                `My sister is an actress, my brother a screenwriter—so naturally I chose to study Data Science.`,
                `In all honesty, movies and media is as big for us as it's big for every other family and I find a great love in watching
                 as much as I do sharing.`,
            ],
            journal: 'film diary',
            stack: 'vhs',
            log: [
                {
                    title: 'No Other Choice', date: '',
                    image: 'images/icon/sol/mov/noc.webp',
                    link: 'https://letterboxd.com/film/no-other-choice-2025/',
                    note: `A recent watch at the Rialto in Elmwood. <a href="https://www.imdb.com/name/nm0661791/" target="_blank">Park Chan Wook</a>
                           always puts together a talk-able film.`,
                },
                {
                    title: 'Another Round', favorite: true, date: '',
                    image: 'images/icon/sol/mov/ar.jpg',
                    link: 'https://letterboxd.com/film/another-round/',
                    note: `This was a holed-in watch while I was sick in bed in Florence.
                           I'm not sure what I was meant to take-away but other than to enjoy the pace of life.`,
                },
                {
                    title: 'Footloose', watchlist: true,
                    image: 'images/icon/sol/mov/fl.jpg',
                    link: 'https://letterboxd.com/film/footloose/',
                    note: `Strangely, I'm quite good at the line-dance for this one.`,
                },
            ],
        },
        {
            tab: 'television',
            heading: "what's on tv!",
            icon: 'images/icon/sol/tv/tele.png',
            iconAlt: 'tv logo',
            memo: [
                `As much as I'm a buff for movies, I am one for TV too.`,
                `And the love is much the same why I enjoy movies: I can share a good watch with my family.`,
            ],
            journal: 'watch log',
            stack: 'dvd',
            log: [
                {
                    title: 'Malcolm in The Middle', date: '',
                    image: 'images/icon/sol/tv/mitm.jpg',
                    link: 'https://www.imdb.com/title/tt0212671/',
                    note: `An undoubtable classic and a show I've countlessly watched. Watching is how I became addicted to the tunes of
                           <a href="https://www.youtube.com/watch?v=8GMZ2DEUE6c" target="_blank">Abba</a>.`,
                },
                {
                    title: 'Jujutsu Kaisen', date: '',
                    image: 'images/icon/sol/tv/jjk.webp',
                    link: 'https://www.imdb.com/title/tt12343534/',
                    note: `I'm not entirely sold on all things anime but it's hard to avoid the heat of this show!
                           It's awesome.`,
                },
                {
                    title: 'Big Brother', date: '',
                    image: 'images/icon/sol/tv/bb.jpg',
                    link: 'https://www.imdb.com/title/tt0251497/',
                    note: `Named after the classic 1984 novel, this is sort of my guilty pleasure.`,
                },
            ],
        },
        {
            tab: 'music',
            heading: 'some of my favorite tunes',
            icon: 'images/icon/sol/mus/mus.png',
            iconAlt: 'music logo',
            memo: [
                `I got hooked on music starting fresh bothering my family with my rendition of
                 <a href="https://www.youtube.com/watch?v=xVkU8dDSC9w" target="_blank">PoP! Goes My Heart</a> from
                 Hugh Grant's <a href="https://www.imdb.com/title/tt0758766/" target="_blank">Music and Lyrics.</a>`,
                `There was a bit of obession with <a href="https://www.youtube.com/watch?v=I-sH53vXP2A" target="_blank">Minecraft parody music</a> through my youth.
                 I thought "Parody" was the name of the artist behind all these rocking songs for a good while.`,
            ],
            journal: 'mixtape',
            stack: 'cassette',
            // Paste a Spotify song link (Share → Copy Song Link). Title and album art are
            // looked up automatically; artist is optional (Spotify doesn't share it with web pages).
            // Newest first, like the other tabs. Add note: `...` to say something about a song.w
            log: [
                { spotify: 'https://open.spotify.com/track/1Cwsd5xI8CajJz795oy4XF?si=a63fc3ea1f1947d9', artist: 'New Radicals'},
                { spotify: 'https://open.spotify.com/track/1GILf5ettT0oOnxnjsLIAn?si=b2084fe9d5b1426a', artist: 'Frank Mastra'},
                { spotify: 'https://open.spotify.com/track/0B1zVsLqmV9ibIFdNS5tGs?si=910ba1fcad1b41a7', artist: 'Todd Rundgren'},
                { spotify: 'https://open.spotify.com/track/2ibiJCDgb0N53RXRtYsDtg?si=0f61250288e6407f', artist: 'Christopher Cross'},
                { spotify: 'https://open.spotify.com/track/2XwjJPenyna7YyCzURSNLh?si=beff1c325bdc4b40', artist: 'Luke Tyler Shelton'},
                { spotify: 'https://open.spotify.com/track/6DW27qxq1wwOXnUidkp383?si=1f30c6583b404f80', artist: 'Asher Kartman'},
                { spotify: 'https://open.spotify.com/track/6Pur3hWy6Nzc27ilmsp5HA?si=63f270818b964bcf', artist: 'Los Enanitos Verdes'},
                { spotify: 'https://open.spotify.com/track/0HU6iAeBwxODFxkiRMTgF1?si=c5289a9de3604af2', artist: 'Juanpalitoschinos'},
            ],
        },
        {
            tab: 'kesem',
            heading: 'kesem',
            icon: 'images/icon/sol/ck.png',
            iconAlt: 'kesem logo',
            // The name tag. Leave a year as '' until you fill it in.
            campName: 'Scuffers',
            roles: [
                { role: 'Counselor', chapter: 'UC Berkeley', year: '' },
                { role: 'Unit Leader', chapter: 'UC Berkeley', year: '' },
            ],
            // The story, in short sections (HTML allowed).
            story: [
                {
                    title: 'what it is',
                    text: [
                        `<a href="https://www.kesem.org/" target="_blank">KESEM</a> is a National organization offering support to children with a guardian affected by cancer.`,
                        `Yearlong, chapters across U.S Colleges raise money to fund a week-long summer camp offering a mixture of fun activities, life skill workshops, and emotional support.`,
                    ],
                },
                {
                    title: 'my summer',
                    text: [
                        `My experience with KESEM is pretty recent, having volunteered as a camp counselor and a unit leader for a week at U.C Berkeley's chapter`,
                    ],
                },
                {
                    title: 'why it matters',
                    text: [
                        `Seeing the magic first hand, I realized how important what KESEM is doing and how meanginful it is to support them. If you are able to do so, consider donating to <a href="https://donate.kesem.org/team/772429" target="_blank">Kesem Berkeley</a>.`,
                    ],
                },
            ],
            video: { src: 'https://www.youtube.com/embed/8D7w4IZHdG0', title: 'Kesem' },
            donate: { href: 'https://donate.kesem.org/team/772429', text: 'Donate to Kesem Berkeley' },
            // Optional polaroids under the video: { image, caption } — image relative to assets/.
            // Best to skip photos where campers' faces are visible.
            photos: [],
        },
    ],
};
