// ─────────────────────────────────────────────────────────────
// EXPERIENCE — one entry per job, newest first. Shown as a timeline.
//
//   role         job title (big heading)
//   org          organization
//   dates        free text, e.g. "Aug 2025 — Dec 2025"
//   description  paragraph (HTML allowed: <a>, <i>, <strong>, ...)
//   links        optional: { label: "Coursepage:", items: [{ text, href }] }
// ─────────────────────────────────────────────────────────────

window.PAGE_DATA = {
    type: 'experience',
    title: 'experience',
    entries: [
        {
            role: 'Undergraduate Student Instructor',
            org: 'U.C. Berkeley',
            dates: 'Aug 2025 — Dec 2025',
            description: `
                Under the direction of Professor Jeremy Sanchez, I led weekly discussion sections for 45 students,
                delivering core instruction on foundational data science principles. I developed interactive Jupyter
                Notebook demos using Pandas and Seaborn to translate complex statistical theory into hands-on learning experiences.
                Additionally, I facilitated weekly office hours to provide personalized mentorship and adapt
                course fundamentals to diverse learning paces.`,
            links: {
                label: 'Coursepage:',
                items: [{ text: 'Data C8 Fall 2025', href: 'https://data8.org/fa25/' }],
            },
        },
        {
            role: 'Undergraduate Researcher',
            org: 'U.C. Berkeley',
            dates: 'May 2025 — Dec 2025',
            description: `
                I served as an Undergraduate Researcher at StrangLab focused on validating Quasi-Sparse models for audio ddata.
                I helped architect a high-scale pipeline using Wavelet-based transformations to generate over 10 million timestamped coefficients
                from 1,000 file permutations within RAVDESS Emotional Speech Audio dataset. My analysis involved examining case studies to verify
                an agreement for the null assumption on the nature of audio data.`,
            links: {
                label: 'Principal Investigator:',
                items: [{ text: 'Prof. Alexander Strang', href: 'https://www.alexanderstrang.com/' }],
            },
        },
        {
            role: 'Marketing Analytics Student Consultant',
            org: 'NFL+',
            dates: 'Jan 2025 — May 2025',
            description: `
                I spearheaded the consumer research and data strategy for a project focused on enhancing NFL+ Premium.
                I helped securing 515 survey responses, using decision tree analysis
                to segment users into high-value personas. Alongisde SWOT analysis of competing platforms,
                I contributed to data-driven recommendations for features like the "Fantasy Football Integration" to personalize
                the fan experience.`,
            links: {
                label: 'Project Leads:',
                items: [
                    { text: 'Julia Araujo', href: 'https://www.linkedin.com/in/juliaaraujo1/' },
                    { text: 'Vicente Trujillo', href: 'https://www.linkedin.com/in/vicente-trujillo/' },
                ],
            },
        },
        {
            role: 'Data Science Student Consultant',
            org: 'Major League Soccer (MLS)',
            dates: 'Aug 2024 — Dec 2024',
            description: `
                To address whether MLS franchises should prioritize the international transfer market or homegrown talent,
                I conducted a research-driven analysis using permutation testing on over 10,000 Premier League data entries.
                My research alongside a groupof other studeny-analysts revealed key-perofrmance indicators to a player's performance.
                these findings through high-dimensional visualizations in Matplotlib and Seaborn, providing a data-backed framework to optimize roster construction and scouting focus within the MLS.`,
        },
        {
            role: 'Unix / Linux Team: Student Assistant',
            org: 'Franchise Tax Board',
            dates: 'May 2023 — Jan 2024',
            description: `
                Working within the Unix/Linux team, I supported the state's
                tax administration mission by managing and maintaining Red Hat Linux servers
                to ensure high performance, security, and 24/7 availability. I contributed to the
                technical documentation of IT policies and procedures, helping to streamline infrastructure
                standards across the department. This role provided me with a foundational understanding of enterprise-level
                IT services and the critical importance of maintaining secure, scalable server environments.`,
        },
        {
            role: 'Footwear Associate',
            org: "Dick's Sporting Goods",
            dates: 'may 2021 — oct 2022',
            description: `
                I’ve always enjoyed connecting with people, and as a Footwear Specialist, I took pride in providing
                a welcoming and helpful experience for every customer. Beyond advising on technical footwear specifications
                to find the perfect fit, I maintained the operational "behind-the-scenes" of the store through inventory control
                and visual merchandising. This role was fundamental in refining my ability to communicate clearly and adapt quickly in
                a fast-paced, person-to-person environment—skills that I carry into every technical project I take on.`,
        },
    ],
};
