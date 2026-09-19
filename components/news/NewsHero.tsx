'use client';

import { motion } from "motion/react";

export default function NewsHero() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-16"
            id="news-hero"
        >
            <div className="flex flex-col items-center md:items-start">
                <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                    <span className="w-10 h-0.5 bg-secondary" />
                    Новини
                </span>

                <h1 className="font-cormorant font-bold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.3rem,1.4rem+3.6vw,4.6rem)] max-w-2xl">
                    Що відбувається в <span className="text-accent">ліцеї</span>
                </h1>

                <p className="mt-5 text-base text-primary/85 max-w-[520px]">
                    Оголошення, події та досягнення учнів ПНЛ №145.
                </p>
            </div>
        </motion.section>
    );
}
