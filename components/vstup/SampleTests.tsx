'use client';

import { useState } from "react";
import { FileText, Download } from "lucide-react";

type Sample = { title: string; year: string; href: string; note?: string };
type Grade = { id: string; label: string; math: Sample[]; physics: Sample[] };

const DIR = "/vstup/probnyky";

// Завдання вступних випробувань минулих років, розкладені за класом вступу.
const GRADES: Grade[] = [
    {
        id: "grade-7",
        label: "До 7 класу",
        math: [
            { title: "Вступне випробування з математики", year: "2024", href: `${DIR}/matem-7-2024.png`, note: "10 червня 2024 року" },
        ],
        physics: [],
    },
    {
        id: "grade-8",
        label: "До 8 класу",
        math: [
            { title: "Вступне випробування з математики", year: "2024", href: `${DIR}/matem-8-2024.pdf` },
            { title: "Вступне випробування з математики", year: "2018", href: `${DIR}/matem-8-2018.pdf` },
            { title: "Вступне випробування з математики", year: "2014", href: `${DIR}/matem-8-2014.pdf` },
        ],
        physics: [
            { title: "Задачі вступного випробування з фізики", year: "2018", href: `${DIR}/fizyka-8-2018.pdf`, note: "Варіанти 1 і 2" },
        ],
    },
    {
        id: "grade-9",
        label: "До 9 класу",
        math: [
            { title: "Вступне випробування з математики", year: "2024", href: `${DIR}/matem-9-2024.pdf` },
            { title: "Вступне випробування з математики", year: "2014", href: `${DIR}/matem-9-2014.pdf` },
            { title: "Вступне випробування з математики", year: "2013", href: `${DIR}/matem-9-2013.pdf` },
        ],
        physics: [
            {
                title: "Збірник задач з фізики",
                year: "Збірник",
                href: `${DIR}/fizyka-zbirnyk-zadach.pdf`,
                note: "Механіка, теплові, електричні та магнітні явища — з відповідями",
            },
        ],
    },
];

function SampleList({ title, items }: { title: string; items: Sample[] }) {
    return (
        <div className="border border-secondary/70 bg-secondary/[0.3] p-6 md:p-7">
            <div className="flex items-baseline justify-between gap-3 mb-4 pb-4 border-b border-secondary/70">
                <h3 className="font-cormorant font-bold text-primary text-2xl leading-[1.15]">{title}</h3>
                <span className="font-plex text-xs font-semibold uppercase tracking-[0.14em] text-secondary-deep">
                    {items.length} {items.length === 1 ? "файл" : "файли"}
                </span>
            </div>

            {items.length === 0 ? (
                <p className="text-sm text-primary/70 leading-relaxed">
                    Для цього класу пробних завдань з фізики поки немає.
                </p>
            ) : (
                <ul className="flex flex-col gap-2.5">
                    {items.map((s) => (
                        <li key={s.href}>
                            <a
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-4 bg-background border border-secondary/70 px-4 py-3.5 hover:border-secondary-deep transition-colors"
                            >
                                <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-primary text-background">
                                    <FileText size={18} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-primary leading-snug">{s.title}</span>
                                    <span className="block mt-0.5 text-xs text-primary/70">
                                        {s.note ?? `${s.year} рік`}
                                    </span>
                                </span>
                                <span className="font-cormorant font-bold text-xl text-primary shrink-0">{s.year}</span>
                                <Download size={16} className="shrink-0 text-primary/60 group-hover:text-secondary-deep transition-colors" />
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function SampleTests() {
    const [activeId, setActiveId] = useState(GRADES[0].id);
    const active = GRADES.find((g) => g.id === activeId) ?? GRADES[0];

    return (
        <section
            className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-20 scroll-mt-24"
            id="samples"
        >
            <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                <span className="w-10 h-0.5 bg-secondary" />
                Пробники
            </span>

            <h2 className="font-cormorant font-bold text-primary text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] leading-[1.02] tracking-[-0.02em] mb-4 max-w-2xl">
                Завдання минулих років
            </h2>

            <p className="text-base text-primary/80 max-w-2xl mb-8 leading-relaxed">
                Справжні завдання вступних випробувань ліцею з математики та фізики.
                Оберіть клас, до якого вступаєте, і потренуйтеся вдома.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
                {GRADES.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => setActiveId(g.id)}
                        className={`rounded-none px-5 py-2.5 font-inter text-sm font-medium transition-colors ${g.id === active.id
                            ? "bg-primary text-background"
                            : "text-primary/85 bg-primary/5 hover:bg-primary/10 hover:text-primary"
                            }`}
                    >
                        {g.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SampleList title="Математика" items={active.math} />
                <SampleList title="Фізика" items={active.physics} />
            </div>
        </section>
    );
}
