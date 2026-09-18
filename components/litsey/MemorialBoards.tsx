'use client';

import Image from "next/image";
import { motion } from "motion/react";
import { CalendarDays } from "lucide-react";
import memorialBoards from "@/public/heroes/memorial-boards.jpg";

const smoothOut = [0.16, 1, 0.3, 1] as const;

// З новини ліцею «Герої не вмирають» (kpnl145.kyiv.ua, грудень 2024).
const NAMES = ["Євген Слюсаренко", "Євген Квасков", "Святослав Романчук"];

export default function MemorialBoards() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto px-5 md:px-6 pb-14 md:pb-24"
            id="memorial-boards"
        >
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center border-t border-primary/15 pt-12 md:pt-16">
                <figure className="relative overflow-hidden bg-primary">
                    <Image
                        src={memorialBoards}
                        alt="Дошка пошани випускникам ліцею, які загинули, захищаючи Україну"
                        className="w-full h-auto"
                        sizes="(max-width: 1024px) 100vw, 700px"
                        placeholder="blur"
                    />
                </figure>

                <div>
                    <span className="inline-flex items-center gap-2 font-plex text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary-deep mb-4">
                        <span className="w-6 h-px bg-secondary" />
                        Дошка пошани
                    </span>

                    <h2 className="font-cormorant font-bold text-primary text-[clamp(1.9rem,1.2rem+2.2vw,3rem)] leading-[1.04] tracking-[-0.02em]">
                        Герої не вмирають
                    </h2>

                    <p className="mt-4 flex items-center gap-2 font-plex text-xs font-semibold uppercase tracking-[0.14em] text-primary/60">
                        <CalendarDays size={14} className="text-secondary" />
                        6 грудня 2024 · День Збройних Сил України
                    </p>

                    <p className="mt-5 text-base text-primary/70 leading-relaxed">
                        У День Збройних Сил України в ліцеї відкрили пам’ятні дошки
                        випускникам, які віддали життя за Україну. Дошки відкривали
                        ліцеїсти, а вся громада ліцею вшанувала загиблих хвилиною мовчання
                        та висловила глибоку вдячність їхнім батькам.
                    </p>

                    <ul className="mt-6 flex flex-col divide-y divide-primary/10 border-y border-primary/10">
                        {NAMES.map((name) => (
                            <li key={name} className="py-3 font-cormorant font-bold text-xl text-primary">
                                {name}
                            </li>
                        ))}
                    </ul>

                    <p className="mt-5 text-sm text-primary/60 leading-relaxed">
                        Щодня, проходячи повз дошку пошани, ліцеїсти пам’ятають, якою
                        ціною виборюється наша свобода.
                    </p>
                </div>
            </div>
        </motion.section>
    );
}
