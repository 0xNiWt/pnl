import { Compass, Target } from "lucide-react";

const STAGES = [
    {
        icon: Compass,
        badge: "I етап · 7–9 класи",
        title: "Адаптаційний",
        lead: "Здібності учня розкриваються, уточнюються та розвиваються.",
        points: [
            "Загальноосвітня підготовка в обсязі дев’ятирічної школи завершується",
            "Перехід до поглибленого вивчення фізики, хімії, математики, інформатики",
            "У 8 класі починається теоретичний і практичний курс інформатики",
            "Звикання до програм поглибленого рівня та лекційно-семінарської системи",
        ],
    },
    {
        icon: Target,
        badge: "II етап · 10–11 класи",
        title: "Профільний",
        lead: "Знання, вміння та навички остаточно формуються й закріплюються.",
        points: [
            "Спеціалізація та передпрофесійна кваліфікаційна підготовка",
            "Вибір спецкурсів для поглиблення знань у певній галузі",
            "Діагностування здібностей і нахилів — розвиток із найвищою результативністю",
            "Цілеспрямована підготовка до вступу та олімпіад",
        ],
    },
];

const NOTES = [
    {
        title: "Двоетапність як страховка",
        text: "Навчання в ліцеї триває чотири (три) роки. Якщо на першому етапі вибір виявився помилковим, учень безконфліктно повертається до навчання в іншій школі — без втрачених років і зіпсованої мотивації.",
    },
    {
        title: "Програми у співпраці з КНУ",
        text: "Профільні математику й фізику у 7–11 класах викладають за програмами, розробленими вчителями ліцею разом із представниками Київського національного університету імені Тараса Шевченка. Це логічне продовження програм мехмату та фізичного факультету, створених для спеціалізованої фізико-математичної школи №145.",
    },
    {
        title: "Особистісно орієнтоване навчання",
        text: "Педагогічний колектив у тісній співпраці з Інститутом педагогіки та психології професійної освіти АПН України впроваджує особистісно орієнтоване навчання й нові напрямки профільної підготовки.",
    },
];

export default function Stages() {
    return (
        <section
            className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-24"
            id="stages"
        >
            <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                <span className="w-10 h-0.5 bg-secondary" />
                Як вибудовано навчання
            </span>

            <h2 className="font-cormorant font-bold text-primary text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] leading-[1.02] tracking-[-0.02em] mb-10 max-w-2xl">
                Спершу знайти себе — потім поглибитись
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {STAGES.map(({ icon: Icon, badge, title, lead, points }) => (
                    <div
                        key={title}
                        className="rounded-none border border-secondary/70 bg-secondary/[0.3] p-6 md:p-8 flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <span className="w-11 h-11 rounded-none bg-primary/5 flex items-center justify-center shrink-0">
                                <Icon size={20} className="text-primary" />
                            </span>
                            <span className="font-plex text-[16px] uppercase tracking-[0.16em] text-primary/65">
                                {badge}
                            </span>
                        </div>

                        <h3 className="font-cormorant font-bold text-primary text-3xl leading-[1.1] tracking-[-0.01em]">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-primary/85 leading-relaxed">{lead}</p>

                        <ul className="mt-5 flex flex-col gap-3">
                            {points.map((p) => (
                                <li key={p} className="flex gap-3 text-sm text-primary/78 leading-relaxed">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-none bg-primary shrink-0" />
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                {NOTES.map((n) => (
                    <div key={n.title} className="rounded-none border border-primary/10 p-6">
                        <h3 className="font-cormorant font-bold text-primary text-lg mb-2">{n.title}</h3>
                        <p className="text-sm text-primary/78 leading-relaxed">{n.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
