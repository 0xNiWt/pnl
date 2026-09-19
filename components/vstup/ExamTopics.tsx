'use client';

import { useState } from "react";
import { motion } from "motion/react";
import { TOPICS } from "./topicsData";

export default function ExamTopics() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;
    const [activeId, setActiveId] = useState(TOPICS[0].id);

    const active = TOPICS.find((t) => t.id === activeId) ?? TOPICS[0];

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-20 scroll-mt-24"
            id="topics"
        >
            <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                <span className="w-10 h-0.5 bg-secondary" />
                Що вчити
            </span>

            <h2 className="font-cormorant font-bold text-primary text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] leading-[1.02] tracking-[-0.02em] mb-4 max-w-2xl">
                Перелік тем для випробувань
            </h2>

            <p className="text-base text-primary/80 max-w-2xl mb-8 leading-relaxed">
                Завдання відповідають навчальній програмі загальноосвітньої школи за
                попередній клас. Оберіть, до якого класу вступаєте.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
                {TOPICS.map((topic) => (
                    <button
                        key={topic.id}
                        onClick={() => setActiveId(topic.id)}
                        className={`rounded-none px-5 py-2.5 font-inter text-sm font-medium transition-colors ${topic.id === active.id
                            ? "bg-primary text-background"
                            : "text-primary/85 bg-primary/5 hover:bg-primary/10 hover:text-primary"
                            }`}
                    >
                        {topic.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {active.subjects.map((subject) => (
                    <div
                        key={subject.title}
                        className="rounded-none border border-secondary/70 bg-secondary/[0.3] p-6 md:p-7"
                    >
                        <div className="flex items-baseline justify-between gap-3 mb-5 pb-4 border-b border-primary/10">
                            <h3 className="font-cormorant font-bold text-primary text-2xl leading-[1.15]">
                                {subject.title}
                            </h3>
                            <span className="font-plex text-xs font-semibold uppercase tracking-[0.14em] text-primary/35">
                                {subject.groups.reduce((sum, g) => sum + g.topics.length, 0)} тем
                            </span>
                        </div>

                        <div className="flex flex-col gap-5">
                            {subject.groups.map((group, gi) => (
                                <div key={gi}>
                                    {group.subtitle && (
                                        <p className="font-manrope font-semibold text-sm text-accent mb-3">
                                            {group.subtitle}
                                        </p>
                                    )}

                                    <ol className="flex flex-col">
                                        {group.topics.map((topic, i) => (
                                            <li
                                                key={topic}
                                                className="flex gap-3 py-2 border-b border-primary/[0.06] last:border-0 text-sm text-primary/85 leading-relaxed"
                                            >
                                                <span className="font-manrope text-xs text-primary/30 tabular-nums shrink-0 pt-0.5 w-5">
                                                    {i + 1}
                                                </span>
                                                {topic}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
