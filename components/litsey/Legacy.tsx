'use client';

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import international from "@/public/about/international.jpg";
import olympiadTeam from "@/public/about/international/olympiad-team.jpg";
import manUnesco from "@/public/about/international/man-unesco.jpg";
import scienceFair from "@/public/about/international/science-fair.jpg";
import genevaRobotics from "@/public/about/international/geneva-robotics.jpg";
import presidentAward1 from "@/public/about/international/president-award-1.jpg";
import presidentAward2 from "@/public/about/international/president-award-2.jpg";
import presidentAward3 from "@/public/about/international/president-award-3.jpg";
import PhotoCarousel, { type Slide } from "./PhotoCarousel";
import { tableTotal, type OlympiadTable } from "@/lib/olympiads";

// Перше фото — те, що стояло тут раніше; далі — міжнародні здобутки ліцеїстів.
const SLIDES: Slide[] = [
    { src: international, alt: "Ліцеїстка з прапором України на церемонії міжнародної олімпіади", caption: "Прапор України на сцені міжнародної олімпіади" },
    { src: olympiadTeam, alt: "Ліцеїсти з медалями та прапором України після міжнародної олімпіади", caption: "Медалі міжнародної олімпіади" },
    { src: manUnesco, alt: "Ліцеїсти з медалями під банерами ЮНЕСКО та Малої академії наук України", caption: "Нагородження МАН і ЮНЕСКО" },
    { src: scienceFair, alt: "Ліцеїсти з дипломами й медалями на міжнародній виставці наукових робіт", caption: "Міжнародна виставка наукових робіт" },
    { src: genevaRobotics, alt: "Команда ліцею з роботом на First Global Challenge у Женеві", caption: "First Global Challenge · Женева" },
    { src: presidentAward1, alt: "Вручення ліцеїсту Премії Президента України", caption: "Премія Президента України" },
    { src: presidentAward2, alt: "Вручення ліцеїсту Премії Президента України", caption: "Премія Президента України" },
    { src: presidentAward3, alt: "Вручення ліцеїстці Премії Президента України", caption: "Премія Президента України" },
];

const PARAGRAPHS = [
    "Ліцей виріс із фізико-математичної школи №145, і шістдесят п’ять років роботи з обдарованими дітьми — це не гасло, а метод: у ліцею є практичний досвід та інтелектуальний потенціал, щоб бути першою ланкою у підготовці інтелектуальної еліти України.",
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
            className="w-full max-w-7xl mx-auto border-b border-secondary/30 px-5 md:px-6 py-10 md:py-24"
            id="legacy"
        >
            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-14 items-center">
                <div>
                    <span className="inline-flex items-center gap-2 font-plex text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary-deep mb-4">
                        <span className="w-6 h-px bg-secondary" />
                        Спадок
                    </span>

                    <h2 className="font-cormorant font-bold text-primary text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] leading-[1.02] tracking-[-0.02em] mb-6 max-w-xl">
                        Шістдесятип’ятирічний досвід роботи з обдарованими дітьми
                    </h2>

                    <div className="flex flex-col gap-4 max-w-xl">
                        {PARAGRAPHS.map((p) => (
                            <p key={p.slice(0, 24)} className="text-base text-primary/85 leading-relaxed">
                                {p}
                            </p>
                        ))}
                    </div>
                </div>

                <PhotoCarousel slides={SLIDES} className="aspect-[4/3] w-full" />
            </div>

            {tables.length > 0 && (
                <>
                    <p className="mt-12 mb-5 font-plex text-xs font-semibold uppercase tracking-[0.18em] text-primary/65">
                        Перемоги на олімпіадах
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tables.map((table) => {
                            const total = tableTotal(table.rows);

                            return (
                                <div
                                    key={table.id}
                                    className="rounded-none border border-secondary/30 bg-secondary/[0.07] p-6 flex flex-col"
                                >
                                    <span className="font-cormorant text-5xl leading-none text-accent">
                                        {total > 0 ? total : '—'}
                                    </span>

                                    <h3 className="mt-3 font-cormorant font-bold text-primary text-lg leading-snug">
                                        {table.title}
                                    </h3>

                                    <p className="mt-1.5 text-sm text-primary/75 leading-relaxed">
                                        {total > 0
                                            ? `${total} ${pluralWins(total)} за всі роки`
                                            : 'Дані готуються'}
                                    </p>

                                    <Link
                                        href={`/litsey/olympiads#${table.id}`}
                                        className="group mt-4 pt-4 border-t border-primary/10 inline-flex items-center gap-1.5 font-manrope text-sm font-semibold text-accent hover:text-primary transition-colors"
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
