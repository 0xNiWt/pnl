'use client';

import { motion } from "motion/react";

export default function AboutHero() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-24"
            id="about-hero"
        >
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] items-start md:items-center gap-8 md:gap-12">
                <div className="text-center md:text-left">
                    <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                        <span className="w-6 h-px bg-secondary" />
                        Про ліцей
                    </span>

                    <h1 className="font-grotesk font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2.4vw,4.2rem)]">
                        Школа, де наука<br />стає <span className="text-accent">покликанням</span>
                    </h1>

                    <p className="mt-5 text-base text-primary/70 max-w-[480px] mx-auto md:mx-0">
                        Природничо-науковий ліцей №145 — заклад профільної освіти
                        у Києві, який з 1962 року готує учнів до вступу в провідні
                        університети через поглиблене вивчення фізики, математики
                        та природничих дисциплін.
                    </p>
                </div>

                <div className="relative w-full max-w-[380px] md:max-w-[400px] mx-auto md:mx-0 md:justify-self-end overflow-hidden rounded-[20px] bg-primary p-7 text-background">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/35 blur-[60px]" />

                    <div className="mb-3.5 font-grotesk text-xs uppercase tracking-[0.15em] text-cream/80">
                        Наша місія
                    </div>

                    <p className="relative font-grotesk text-lg leading-snug">
                        Виховати покоління, яке мислить критично, ставить
                        запитання «чому» і не боїться шукати відповіді
                        експериментальним шляхом.
                    </p>
                </div>
            </div>
        </motion.section>
    );
}
