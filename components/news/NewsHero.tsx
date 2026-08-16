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
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-16"
            id="news-hero"
        >
            <div className="flex flex-col items-center md:items-start">
                <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                    <span className="w-6 h-px bg-secondary" />
                    Новини
                </span>

                <h1 className="font-manrope font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2vw,3.6rem)] max-w-2xl">
                    Що відбувається в <span className="text-accent">ліцеї</span>
                </h1>

                <p className="mt-5 text-base text-primary/70 max-w-[520px]">
                    Оголошення, події та досягнення учнів ПНЛ №145.
                </p>
            </div>
        </motion.section>
    );
}
