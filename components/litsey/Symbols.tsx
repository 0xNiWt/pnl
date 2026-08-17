'use client';

import Image from "next/image";
import { motion } from "motion/react";
import { Music4 } from "lucide-react";
import gerb from "@/public/gerb.png";
import HymnPlayer from "./HymnPlayer";

type Stanza = { kind: "verse" | "chorus"; lines: string[] };

// Гімн ліцею — текст подано без змін.
const ANTHEM: Stanza[] = [
    {
        kind: "verse",
        lines: [
            "Ми прийшли за знаннями сюди",
            "Збагатити свій розум і душу,",
            "Щоб упевнено йти до мети,",
            "Щоб потрібними бути, мій друже.",
        ],
    },
    {
        kind: "chorus",
        lines: [
            "Ліцеїсти, вірні друзі,",
            "Ми вшануємо стіни величні,",
            "Що дарують нам цінності вічні,",
            "Щоб знайти своє місце в житті.",
        ],
    },
    {
        kind: "verse",
        lines: [
            "Непрості теореми життя",
            "Навчимося ми легко долати,",
            "Пронесемо палкі почуття",
            "До улюбленої «Alma Mater».",
        ],
    },
    {
        kind: "chorus",
        lines: [
            "Ліцеїсти, вірні друзі,",
            "Ми вшануємо стіни величні,",
            "Що дарують нам цінності вічні,",
            "Щоб знайти своє місце в житті.",
        ],
    },
    {
        kind: "verse",
        lines: [
            "Сто доріг, сто шляхів у житті",
            "Вихованцям своїм відкриває,",
            "Кожен рік наш ліцей. Побажаєм,",
            "Щоб сюди й наші діти прийшли.",
        ],
    },
];

export default function Symbols() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-24"
            id="symbols"
        >
            <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                <span className="w-6 h-px bg-secondary" />
                Символи ліцею
            </span>

            <h2 className="font-manrope font-bold text-primary text-3xl md:text-4xl tracking-tight mb-10 max-w-xl">
                Герб і гімн
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-5 items-start">
                {/* Герб */}
                <div className="md:sticky md:top-28 rounded-2xl border border-primary/10 bg-primary/[0.03] p-7 md:p-9 flex flex-col items-center text-center">
                    <div className="relative flex items-center justify-center mb-6">
                        <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-cream/40 blur-[50px]" />
                        <Image
                            src={gerb}
                            alt="Герб Природничо-наукового ліцею №145"
                            className="relative h-44 w-auto md:h-52"
                        />
                    </div>

                    <h3 className="font-manrope font-bold text-primary text-lg">Герб ліцею</h3>

                    <p className="mt-2 text-sm text-primary/60 leading-relaxed max-w-[280px]">
                        Офіційний знак закладу: він супроводжує документи й бланки ліцею,
                        стоїть у шапці цього сайту та на формі команд, які представляють
                        ліцей на змаганнях.
                    </p>
                </div>

                {/* Гімн */}
                <div className="relative overflow-hidden rounded-2xl bg-primary p-7 md:p-10 text-background">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-[70px]" />
                    <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-secondary/20 blur-[70px]" />

                    <div className="relative">
                        <div className="flex items-center gap-2.5 mb-7">
                            <span className="w-9 h-9 rounded-xl bg-background/10 flex items-center justify-center">
                                <Music4 size={16} className="text-cream" />
                            </span>
                            <span className="font-manrope font-bold text-xs uppercase tracking-[0.15em] text-cream/80">
                                Гімн ліцею
                            </span>
                        </div>

                        <div className="mb-7">
                            <HymnPlayer src="/audio/hymn-145.mp3" />
                        </div>

                        <div className="flex flex-col gap-6">
                            {ANTHEM.map((stanza, i) =>
                                stanza.kind === "chorus" ? (
                                    <div key={i} className="border-l-2 border-accent/70 pl-5">
                                        <span className="block font-manrope text-[11px] font-bold uppercase tracking-[0.16em] text-cream/70 mb-2">
                                            Приспів
                                        </span>
                                        {stanza.lines.map((line) => (
                                            <p
                                                key={line}
                                                className="font-inter italic text-cream leading-relaxed text-[15px] md:text-base"
                                            >
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <div key={i}>
                                        {stanza.lines.map((line) => (
                                            <p
                                                key={line}
                                                className="font-inter text-background/90 leading-relaxed text-[15px] md:text-base"
                                            >
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>

                        <p className="mt-8 pt-5 border-t border-background/15 font-manrope text-xs uppercase tracking-[0.14em] text-background/50">
                            Слова — Левченко О. П. · Музика — Тальна В. А.
                        </p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
