'use client';

import { motion } from "motion/react";
import { HEROES } from "./heroesData";

export default function HeroesIntro() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-20"
            id="heroes-intro"
        >
            <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                <span className="w-6 h-px bg-secondary" />
                Пам’ять
            </span>

            <h1 className="font-manrope font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2.4vw,3.6rem)] max-w-3xl">
                Герої ліцею
            </h1>

            <p className="mt-4 font-manrope font-semibold text-lg md:text-xl text-primary/80 max-w-2xl">
                Випускники ліцею, які загинули, захищаючи незалежність України
            </p>

            <p className="mt-5 text-base text-primary/65 max-w-2xl leading-relaxed">
                Вони сиділи за тими самими партами, писали ті самі контрольні й бігали
                тими самими коридорами. Кожен обрав свою справу — науку, медицину,
                інженерію, спорт — і кожен став на захист країни, коли це стало
                потрібно. Тут їхні імена та їхні історії.
            </p>

            <p className="mt-8 font-bebas text-2xl text-accent tracking-wide">
                {HEROES.length} імен · вічна пам’ять
            </p>
        </motion.section>
    );
}
