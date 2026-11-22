// ─────────────────────────────────────────────────────────────
// PROJECTS — one entry per project, shown as a grid of cards.
//
//   tab          short name — used in the link to this project (e.g. #tailor)
//   title        heading (HTML allowed)
//   logo         image path, relative to assets/  (e.g. 'images/icon/projects/spa.png')
//   live         optional button: { href, icon: 'code' | 'file', text: 'live' }
//   subtitle     one-liner under the title
//   dates        free text
//   description  paragraph (HTML allowed)
//   links        optional: { label: "Dataset:", items: [{ text, href }] }
//   tags         list of strings, or { html: '...' } for a custom pill (cards show the first 4)
// ─────────────────────────────────────────────────────────────

// Reusable snippets
const LATEX = `<span style="font-family: 'Latin Modern Roman', 'CMU Serif', 'Times New Roman', serif;">L<sup style="font-size: 0.8em; vertical-align: 0.15em; margin-left: -0.36em; margin-right: -0.15em; text-transform: uppercase;">a</sup>T<sub style="font-size: 1em; vertical-align: -0.5ex; margin-left: -0.1667em; margin-right: -0.125em; text-transform: uppercase;">e</sub>X</span>`;
const TAILOR = `<span style="font-family:'Atkinson Hyperlegible', sans-serif;">t<span style="color:#F59E0B;">AI</span>lor</span>`;

window.PAGE_DATA = {
    type: 'projects',
    title: 'projects',
    entries: [
        {
            tab: 'tAIlor',
            title: TAILOR,
            logo: 'images/icon/projects/tailor_dark.png',
            live: { href: 'https://github.com/axndyg/tAIlor' },
            subtitle: 'In-Browser Resume Curation',
            dates: 'May 2026 — Present',
            description: `
                Firefox-based extension that takes in ${LATEX} formatted resumes and a job description to return a ${TAILOR}-ed
                resume with language effectively aligning your impact and qualifications to any opportunity.
                Leverages your choice in LLM from a selection of models from OpenRouter and independent providers.`,
            tags: ['Vite', 'React', 'TypeScript', 'Claude Code'],
        },
        {
            tab: 'doneSimple',
            title: 'doneSimple',
            logo: 'images/icon/projects/doneSimple.png',
            live: { href: 'https://github.com/axndyg/doneSimple' },
            subtitle: 'Minimalist Task Management App',
            dates: 'May 2026 — Present',
            description: `
                A desktop task management app built on the belief that organization can be simple.
                Designed with a distraction-free interface, doneSimple lets you capture, organize,
                and complete tasks without the overhead of complex productivity systems.`,
            tags: ['Tauri', 'React', 'TypeScript', 'Claude Code'],
        },
        {
            tab: 'impoverished languages',
            title: 'Impoverished Languages',
            logo: 'images/icon/projects/impoverished.png',
            logoAlt: 'impoverished Logo',
            live: { href: 'files/subfield_survey.pdf', icon: 'file', text: '' },
            subtitle: 'subfield survey',
            dates: 'mar 2026 — may 2026',
            description: `
                A look into the NLP research space discussing the foundational papers for handling what I coin the
                <i>impoverished languages</i>: low-resource languages, unknown scripts, and constructed langauges.
                Offers a concise starting point for future research that is concious to the nuissances of these languages often
                blemished by high-resource practice bias.`,
            tags: [
                { html: `<span style="font-family: 'Latin Modern Roman', 'CMU Serif', 'Times New Roman', serif; border-radius: 999px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #FFFFFFAA; padding: 4px 12px;">${LATEX}</span>` },
            ],
        },
        {
            tab: 'llm fine-tuning',
            title: 'Fine-tuned MCQ Qwen-Instruct',
            logo: 'images/icon/projects/qwen.png',
            logoAlt: 'qwen Logo',
            subtitle: 'LM Supervised Fine-tuning',
            dates: 'Nov 2025 — Dec 2025',
            description: `
                Optimized a Qwen2.5-0.5B model for machine learning reasoning via Supervised Fine-Tuning (SFT). Developed a high-signal dataset of 985 samples using synthetic and curated sources, resulting in a 1st place finish (57.6% accuracy) in a competitive cohort of 417 students.`,
            links: {
                label: 'Leaderboard:',
                items: [{ text: 'CS189-HW5 (LLM SFT)', href: 'https://github.com/axndyg/meetAndy/blob/main/assets/images/gwen-leaderboard.png' }],
            },
            tags: ['PyTorch', 'NLP', 'Hugging Face', 'Data Curation', 'SFT'],
        },
        {
            tab: 'speech accent detection',
            title: 'Speech Accent Detection',
            logo: 'images/icon/projects/spa.png',
            logoAlt: 'SPA Logo',
            live: { href: 'https://drive.google.com/drive/folders/1kSyPX5qJhLXyKJfwP4o9AYHG2kfF3ydL?usp=sharing' },
            subtitle: 'Spectrogram CNN Classification',
            dates: 'Nov 2025 — Dec 2025',
            description: `
                Engineered a pipeline to transform raw audio into STFT Spectrograms for "accent image" classification.
                Using a custom 400k-parameter <strong>ResNet</strong>, I stabilized training to achieve 62% accuracy in identifying
                L1 language families—priming ASR systems for more inclusive recognition.`,
            links: {
                label: 'Dataset:',
                items: [{ text: 'The Speech Accent Archive (GMU)', href: 'https://accent.gmu.edu/' }],
            },
            tags: ['pytorch', 'resnet-18', 'stft', 'nlp', 'etl'],
        },
        {
            tab: 'uefa match predictor',
            title: "UEFA Euro's Match Predictor",
            logo: 'images/icon/projects/uefa.png',
            logoAlt: 'UEFA Logo',
            live: { href: 'https://github.com/axndyg/euros-WebScraping/' },
            subtitle: 'Historical Match Trend Analysis',
            dates: 'May 2024 - June 2024',
            description: `
                Developed an end-to-end ML pipeline to forecast UEFA Euro 2024 outcomes.
                By programmatically scraping 60+ years of match data via <strong>BeautifulSoup</strong>,
                I trained a <strong>Random Forest Classifier</strong> that successfully predicted
                Spain as the tournament champion.`,
            links: {
                label: 'Dataset:',
                items: [{ text: 'Terrikon Football & Sport', href: 'https://terrikon.com/en/' }],
            },
            tags: ['ensemble learning', 'web scraping', 'feature encoding'],
        },
    ],
};
