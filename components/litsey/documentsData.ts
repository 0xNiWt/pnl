// Публічні документи ліцею. Файли лежать у public/docs (та public/audio),
// тому посилання відносні. Ті документи, файлів яких ще немає в репозиторії,
// тимчасово ведуть на старий сайт — у них external: true.

// "doc" — файл Word: у браузері він не відкривається, тому такі документи
// показуємо лише з кнопкою завантаження.
export type DocKind = "pdf" | "doc" | "xls" | "image" | "audio";

export type DocFile = {
    href: string;
    // Підпис для багатосторінкових документів («Сторінка 1»); для одного файла не потрібен.
    label?: string;
    external?: boolean;
};

export type DocItem = {
    id: string;
    title: string;
    note?: string;
    year?: string;
    kind: DocKind;
    files: DocFile[];
};

export type DocGroup = {
    id: string;
    title: string;
    description: string;
    items: DocItem[];
};

export const DOC_GROUPS: DocGroup[] = [
    {
        id: "founding",
        title: "Установчі документи",
        description: "Статут, ліцензія та розпорядчі документи, на підставі яких працює ліцей.",
        items: [
            {
                id: "statut",
                title: "Статут ліцею",
                kind: "pdf",
                files: [{ href: "https://kpnl145.kyiv.ua/images/statut.pdf", external: true }],
            },
            {
                id: "licens",
                title: "Ліцензія на освітню діяльність",
                note: "Серія ЗОД-П № 110894, рівень — загальна середня освіта",
                kind: "image",
                files: [{ href: "/docs/licens.jpg" }],
            },
            {
                id: "kmda-463",
                title: "Розпорядження № 463 КМДА про ліцензію на освітню діяльність",
                kind: "pdf",
                files: [{ href: "/docs/kmda_463.pdf" }],
            },
        ],
    },
    {
        id: "rules",
        title: "Положення, правила та безпека",
        description: "Як у ліцеї реагують на булінг, як діяти під час тривоги і хто може заходити в будівлю.",
        items: [
            {
                id: "pravyla-povedinky",
                title: "Правила поведінки учнів ліцею",
                note: "Пам’ятка для батьків та учнів: загальні правила, зовнішній вигляд, поведінка на уроках і перервах",
                kind: "doc",
                files: [{ href: "/docs/pravyla_povedinky.docx" }],
            },
            {
                id: "propusk",
                title: "Пропускний режим",
                kind: "pdf",
                files: [{ href: "https://kpnl145.kyiv.ua/images/propusk.pdf", external: true }],
            },
            {
                id: "povitr",
                title: "Алгоритм дій у разі сигналу «Повітряна тривога»",
                note: "Для всіх учасників освітнього процесу",
                kind: "pdf",
                files: [{ href: "/docs/povitr.pdf" }],
            },
            {
                id: "norm-prav",
                title: "Нормативно-правова база щодо протидії булінгу",
                kind: "pdf",
                files: [{ href: "/docs/norm_prav.pdf" }],
            },
            {
                id: "polog-bul",
                title: "Положення про порядок розгляду випадків булінгу (цькування)",
                kind: "pdf",
                files: [{ href: "/docs/polog_bul.pdf" }],
            },
            {
                id: "por-rozgl",
                title: "Порядок подання та розгляду заяв про булінг",
                kind: "pdf",
                files: [{ href: "/docs/por_rozgl.pdf" }],
            },
        ],
    },
    {
        id: "reports",
        title: "Звіти про діяльність і планування",
        description: "Річні звіти керівництва та план роботи закладу.",
        items: [
            {
                id: "zvit-24-25",
                title: "Річний звіт про діяльність закладу",
                year: "2024/2025",
                kind: "pdf",
                files: [{ href: "https://kpnl145.kyiv.ua/images/zvit_24_25.pdf", external: true }],
            },
            {
                id: "plan-25-26",
                title: "План роботи ліцею",
                year: "2025/2026",
                kind: "pdf",
                files: [{ href: "/docs/plan_25_26.pdf" }],
            },
            {
                id: "zvit-22-23",
                title: "Звіт про результати роботи",
                year: "2022/2023",
                kind: "pdf",
                files: [{ href: "/docs/zvit_22_23.pdf" }],
            },
        ],
    },
    {
        id: "finance",
        title: "Кошториси та фінансова звітність",
        description: "Кошториси за роками, звіти про бюджетні й благодійні надходження, переліки матеріальних цінностей.",
        items: [
            {
                id: "kosht-2026",
                title: "Кошторис (освітня субвенція)",
                year: "2026",
                kind: "image",
                files: [
                    { href: "/docs/kosht_2026_zag1.png", label: "Сторінка 1" },
                    { href: "/docs/kosht_2026_zag2.png", label: "Сторінка 2" },
                ],
            },
            {
                id: "kosht-2025",
                title: "Кошторис (місцевий бюджет)",
                year: "2025",
                kind: "image",
                files: [
                    { href: "/docs/misc_1_stor.png", label: "Сторінка 1" },
                    { href: "/docs/misc_2_stor.png", label: "Сторінка 2" },
                ],
            },
            {
                id: "zvit-bf-2024",
                title: "Звіт благодійного фонду «Фізико-математична школа №145»",
                year: "2024",
                kind: "image",
                files: [{ href: "/docs/zvit_bf_2024.png" }],
            },
            {
                id: "cinnosti-2024",
                title: "Затверджений перелік цінностей для ЗЗСО",
                note: "Цей самий файл на старому сайті був і як звіт про отримання матеріальних цінностей від УО ПРДА за 2022 рік",
                year: "2024",
                kind: "pdf",
                files: [{ href: "/docs/145.pdf" }],
            },
            {
                id: "kosht-2024",
                title: "Кошторис на 2024 рік",
                year: "2024",
                kind: "image",
                files: [
                    { href: "/docs/24_1.jpeg", label: "Сторінка 1" },
                    { href: "/docs/24_2.jpeg", label: "Сторінка 2" },
                ],
            },
            {
                id: "zvit-23-bud",
                title: "Звіт про бюджетні надходження за січень – грудень",
                year: "2023",
                kind: "xls",
                files: [{ href: "/docs/zvit_23_bud.xls" }],
            },
            {
                id: "zvit-23-blago",
                title: "Звіт про благодійні надходження за січень – грудень",
                year: "2023",
                kind: "xls",
                files: [{ href: "/docs/zvit_23_blago.xls" }],
            },
            {
                id: "cin-bud-2023",
                title: "Перелік товарно-матеріальних цінностей (бюджет)",
                year: "2023",
                kind: "pdf",
                files: [
                    { href: "/docs/cin_bud24_1.pdf", label: "Сторінка 1" },
                    { href: "/docs/cin_bud24_2.pdf", label: "Сторінка 2" },
                ],
            },
            {
                id: "kosht-2023",
                title: "Кошторис на 2023 рік",
                year: "2023",
                kind: "pdf",
                files: [{ href: "/docs/koshtorys.pdf" }],
            },
            {
                id: "subv-2023",
                title: "Кошторис по субвенції для педагогів",
                year: "2023",
                kind: "image",
                files: [
                    { href: "/docs/subv1.jpeg", label: "Сторінка 1" },
                    { href: "/docs/subv2.jpeg", label: "Сторінка 2" },
                ],
            },
            {
                id: "kosht-miscev",
                title: "Кошторис місцевий",
                kind: "image",
                files: [
                    { href: "/docs/miscev1.jpeg", label: "Сторінка 1" },
                    { href: "/docs/miscev2.jpeg", label: "Сторінка 2" },
                ],
            },
            {
                id: "zvit-blago-22",
                title: "Звіт про благодійні надходження за січень – грудень",
                year: "2022",
                kind: "xls",
                files: [{ href: "/docs/zvit_blago_22.xls" }],
            },
            {
                id: "kosht-2022-a",
                title: "Кошторис на 2022 рік",
                note: "Документ 1",
                year: "2022",
                kind: "image",
                files: [
                    { href: "/docs/31_1.jpeg", label: "Сторінка 1" },
                    { href: "/docs/31_2.jpeg", label: "Сторінка 2" },
                ],
            },
            {
                id: "kosht-2022-b",
                title: "Кошторис на 2022 рік",
                note: "Документ 2",
                year: "2022",
                kind: "image",
                files: [
                    { href: "/docs/21_1.jpeg", label: "Сторінка 1" },
                    { href: "/docs/21_2.jpeg", label: "Сторінка 2" },
                ],
            },
            {
                id: "zvit-blago-21",
                title: "Звіт про благодійні надходження за січень – грудень",
                year: "2021",
                kind: "xls",
                files: [{ href: "/docs/zvit_blago_21.xls" }],
            },
        ],
    },
    {
        id: "traditions",
        title: "Символи та традиції",
        description: "Записи, які звучать на ліцейських святах.",
        items: [
            {
                id: "gimn",
                title: "Гімн ліцею",
                note: "Слова — Левченко О. П., музика — Тальна В. А.",
                kind: "audio",
                files: [{ href: "/audio/hymn-145.mp3" }],
            },
            {
                id: "svicha",
                title: "Про ліцейську свічу",
                kind: "audio",
                files: [{ href: "/audio/svicha.mp3" }],
            },
        ],
    },
];
