'use client';

import { motion } from "motion/react";
import { tableTotal, type OlympiadTable } from "@/lib/olympiads";

export default function OlympiadsIntro({ tables }: { tables: OlympiadTable[] }) {
    const smoothOut = [0.16, 1, 0.3, 1] as const;
    const grandTotal = tables.reduce((sum, t) => sum + tableTotal(t.rows), 0);

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-20"
            id="olympiads-intro"
        >
            <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                <span className="w-6 h-px bg-secondary" />
                Досягнення
            </span>

            <h1 className="font-manrope font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2.4vw,3.6rem)] max-w-3xl">
                Перемоги на олімпіадах
            </h1>

            <p className="mt-5 text-base text-primary/65 max-w-2xl leading-relaxed">
                Скільки перемог здобули ліцеїсти на кожному рівні — за предметами
                та навчальними роками. Таблиці прокручуються вбік: назва предмета
                лишається на місці.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
                {tables.map((table) => (
                    <a
                        key={table.id}
                        href={`#${table.id}`}
                        className="rounded-full border border-primary/15 px-4 py-2 font-inter text-sm text-primary/70 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                        {table.title}
                    </a>
                ))}
            </div>

            {grandTotal > 0 && (
                <p className="mt-6 font-bebas text-2xl text-accent tracking-wide">
                    {grandTotal} перемог усього
                </p>
            )}
        </motion.section>
    );
}
