'use client';

import Image from "next/image";
import { motion } from "motion/react";
import manAwards from "@/public/about/man-awards.jpg";

const SCIENCE_POINTS = [
    "На базі ліцею створено секцію Малої академії наук, яка координує наукові дослідження учнів.",
    "Для науково-дослідницької роботи ліцеїсти користуються лабораторіями наукових інститутів НАН України.",
    "Усі учні залучаються до досліджень — у ліцеї працює наукове товариство учнів «Сузір’я ноосфери».",
    "Методична й технічна база дає змогу не лише готувати учнів до олімпіад і турнірів всеукраїнського та міжнародного рівнів, а й проводити їх у себе.",
];

// Позаурочна освіта — цифрами.
const EXTRAS = [
    { value: "35", label: "спецкурсів для поглиблення знань" },
    { value: "8", label: "факультативів на вибір" },
    { value: "≈30", label: "призерів МАН щороку" },
    { value: "6", label: "кабінетів з інтерактивними комплексами" },
];

export default function Science() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-24"
            id="science"
        >
            <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-14 items-center">
                <figure className="relative overflow-hidden rounded-[20px] order-2 md:order-1">
                    <Image
                        src={manAwards}
                        alt="Нагородження призерів Київської Малої академії наук"
                        className="w-full h-auto"
                        sizes="(max-width: 768px) 100vw, 560px"
                        placeholder="blur"
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/85 to-transparent" />

                    <figcaption className="absolute bottom-0 left-0 right-0 p-5 font-manrope text-xs font-semibold uppercase tracking-[0.14em] text-background/90">
                        Підсумкове нагородження Київської МАН
                    </figcaption>
                </figure>

                <div className="order-1 md:order-2">
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                        <span className="w-6 h-px bg-secondary" />
                        Наука та дослідження
                    </span>

                    <h2 className="font-manrope font-bold text-primary text-3xl md:text-4xl tracking-tight mb-6 max-w-xl">
                        Мала академія наук — у стінах ліцею
                    </h2>

                    <ul className="flex flex-col gap-3.5 max-w-xl">
                        {SCIENCE_POINTS.map((p) => (
                            <li key={p.slice(0, 24)} className="flex gap-3 text-base text-primary/70 leading-relaxed">
                                <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-12 rounded-2xl border border-primary/10 bg-primary/[0.03] p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
                    <div>
                        <h3 className="font-manrope font-bold text-primary text-xl md:text-2xl tracking-tight">
                            Позаурочна освіта
                        </h3>
                        <p className="mt-1.5 text-sm text-primary/60 max-w-2xl leading-relaxed">
                            Спецкурси й факультативи ведуть і вчителі ліцею, і наукові
                            працівники вищих навчальних та науково-дослідницьких установ
                            Києва. Поглибити шкільний курс можна на групових
                            консультаційних заняттях — вони проводяться з усіх предметів.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {EXTRAS.map((e) => (
                        <div key={e.label} className="border-l-2 border-primary/10 pl-4">
                            <span className="font-bebas text-4xl leading-none text-accent">{e.value}</span>
                            <p className="mt-1.5 text-sm text-primary/60 leading-snug">{e.label}</p>
                        </div>
                    ))}
                </div>

                <p className="mt-7 pt-5 border-t border-primary/10 text-sm text-primary/55 leading-relaxed">
                    Вчителі активно застосовують новітні технології: систему «Hi Class»,
                    інтерактивні мультимедійні комплекси та доступ до мережі Інтернет для
                    інформаційного забезпечення й активізації роботи учнів.
                </p>
            </div>
        </motion.section>
    );
}
