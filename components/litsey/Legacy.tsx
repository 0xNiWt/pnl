'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import international from "@/public/about/international.jpg";
import { tableTotal, type OlympiadTable } from "@/lib/olympiads";

const PARAGRAPHS = [
    "Ліцей виріс із фізико-математичної школи №145, і півстоліття роботи з обдарованими дітьми — це не гасло, а метод: у ліцею є практичний досвід та інтелектуальний потенціал, щоб бути першою ланкою у підготовці інтелектуальної еліти України.",
    "Найпереконливіше про це говорить шлях випускників. Усі випускники СШ №145 здобули вищу освіту, близько 1800 із них захистили кандидатські дисертації, а 170 — докторські.",
];

export default function Legacy({ tables }: { tables: OlympiadTable[] }) {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-24"
            id="legacy"
        >
            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-14 items-center">
                <div>
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                        <span className="w-6 h-px bg-secondary" />
                        Спадок
                    </span>

                    <h2 className="font-manrope font-bold text-primary text-3xl md:text-4xl tracking-tight mb-6 max-w-xl">
                        Піввіковий досвід роботи з обдарованими дітьми
                    </h2>

                    <div className="flex flex-col gap-4 max-w-xl">
                        {PARAGRAPHS.map((p) => (
                            <p key={p.slice(0, 24)} className="text-base text-primary/70 leading-relaxed">
                                {p}
                            </p>
                        ))}
                    </div>
                </div>

                <figure className="relative overflow-hidden rounded-[20px] bg-primary/[0.03]">
                    <Image
                        src={international}
                        alt="Ліцеїстка з прапором України на церемонії міжнародної олімпіади"
                        className="w-full h-auto"
                        sizes="(max-width: 768px) 100vw, 480px"
                        placeholder="blur"
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/85 to-transparent" />

                    <figcaption className="absolute bottom-0 left-0 right-0 p-5 font-manrope text-xs font-semibold uppercase tracking-[0.14em] text-background/90">
                        Прапор України на сцені міжнародної олімпіади
                    </figcaption>
                </figure>
            </div>

            {tables.length > 0 && (
                <>
                    <p className="mt-12 mb-5 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-primary/45">
                        Перемоги на олімпіадах
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tables.map((table) => {
                            const total = tableTotal(table.rows);

                            return (
                                <div
                                    key={table.id}
                                    className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-6 flex flex-col"
                                >
                                    <span className="font-bebas text-5xl leading-none text-accent">
                                        {total > 0 ? total : '—'}
                                    </span>

                                    <h3 className="mt-3 font-manrope font-bold text-primary text-base leading-snug">
                                        {table.title}
                                    </h3>

                                    <p className="mt-1.5 text-sm text-primary/55 leading-relaxed">
                                        {total > 0
                                            ? `${total} ${pluralWins(total)} за всі роки`
                                            : 'Дані готуються'}
                                    </p>

                                    <Link
                                        href={`/litsey/olympiads#${table.id}`}
                                        className="group mt-4 pt-4 border-t border-primary/10 inline-flex items-center gap-1.5 font-manrope text-sm font-semibold text-secondary hover:text-primary transition-colors"
                                    >
                                        Подивитись таблицю
                                        <ArrowRight
                                            size={14}
                                            className="transition-transform group-hover:translate-x-0.5"
                                        />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </motion.section>
    );
}

function pluralWins(n: number): string {
    const last = n % 10;
    const lastTwo = n % 100;

    if (lastTwo >= 11 && lastTwo <= 14) return 'перемог';
    if (last === 1) return 'перемога';
    if (last >= 2 && last <= 4) return 'перемоги';
    return 'перемог';
}
