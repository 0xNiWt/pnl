'use client';

import { motion } from "motion/react";

const MILESTONES = [
    { year: "1962", text: "Заснування школи як загальноосвітнього закладу в Києві." },
    { year: "1990", text: "Реорганізація у природничо-науковий ліцей з профільними класами." },
    { year: "2005", text: "Відкриття лабораторних практикумів з фізики, хімії та біології." },
    { year: "2020", text: "Запуск програм поглибленої підготовки до міжнародних олімпіад." },
];

export default function History() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="max-w-7xl mx-auto border-b border-primary/15 px-5 md:px-6 py-10 md:py-24"
            id="history"
        >
            <span className="inline-flex items-center gap-2 font-plex text-[10px] uppercase tracking-[0.22em] text-primary/45 mb-4">
                <span className="w-6 h-px bg-accent" />
                Історія
            </span>

            <h2 className="font-cormorant font-semibold text-primary text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] leading-[1.02] tracking-[-0.02em] mb-10 max-w-xl">
                Понад 60 років у природничій освіті
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {MILESTONES.map((m) => (
                    <div key={m.year} className="border-l-2 border-primary/10 pl-5">
                        <span className="font-cormorant text-3xl text-accent">{m.year}</span>
                        <p className="mt-2 text-sm text-primary/70 leading-relaxed">{m.text}</p>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
