'use client';

import Image from "next/image";
import { motion } from "motion/react";
import svyato from "@/public/about/svyato.jpg";

// Цифри — зі шляху випускників школи №145 та результатів останніх десяти років.
const STATS = [
    { value: "100%", label: "випускників здобули вищу освіту" },
    { value: "≈1800", label: "захищених кандидатських дисертацій" },
    { value: "170", label: "докторів наук серед випускників" },
    { value: "18", label: "призерів міжнародних олімпіад за 10 років" },
];

export default function AboutHero() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-24"
            id="about-hero"
        >
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] items-start md:items-center gap-8 md:gap-12">
                <div className="text-center md:text-left">
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                        <span className="w-6 h-px bg-secondary" />
                        Про ліцей
                    </span>

                    <h1 className="font-manrope font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2.4vw,4.2rem)]">
                        Школа, де наука<br />стає <span className="text-accent">покликанням</span>
                    </h1>

                    <p className="mt-5 text-base text-primary/70 max-w-[480px] mx-auto md:mx-0">
                        Київський природничо-науковий ліцей №145 створено на базі
                        фізико-математичної школи, педколектив якої має піввіковий досвід
                        роботи з обдарованими дітьми. Поглиблені фізика, математика,
                        хімія та інформатика — і вчителі, які пам&apos;ятають ваше ім&apos;я.
                    </p>
                </div>

                <div className="relative w-full max-w-[380px] md:max-w-[400px] mx-auto md:mx-0 md:justify-self-end overflow-hidden rounded-[20px] bg-primary p-7 text-background">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/35 blur-[60px]" />

                    <div className="mb-3.5 font-manrope font-bold text-xs uppercase tracking-[0.15em] text-cream/80">
                        Наша місія
                    </div>

                    <p className="relative font-inter leading-snug">
                        Виховати покоління, яке мислить критично, ставить
                        запитання «чому» і не боїться шукати відповіді
                        експериментальним шляхом.
                    </p>
                </div>
            </div>

            <figure className="relative mt-10 md:mt-16 overflow-hidden rounded-[20px]">
                <Image
                    src={svyato}
                    alt="Урочистість у ліцеї: учні та вчителі в актовій залі"
                    className="w-full h-auto"
                    sizes="(max-width: 768px) 100vw, 1200px"
                    placeholder="blur"
                    priority
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/80 to-transparent" />

                <figcaption className="absolute bottom-0 left-0 right-0 p-5 md:p-7 font-manrope text-xs md:text-sm font-semibold uppercase tracking-[0.14em] text-background/90">
                    Ліцейські урочистості · зустрічі поколінь ліцеїстів
                </figcaption>
            </figure>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 rounded-2xl border border-primary/10 bg-primary/[0.03] overflow-hidden">
                {STATS.map((stat, i) => (
                    <div
                        key={stat.label}
                        className={`flex flex-col items-center justify-center text-center gap-1 px-4 py-8 border-primary/10
                            ${i % 2 === 0 ? "border-r" : ""}
                            ${i < 2 ? "border-b md:border-b-0" : ""}
                            ${i > 0 ? "md:border-l" : ""}
                            ${i === 2 ? "md:border-r-0" : ""}
                        `}
                    >
                        <h4 className="font-manrope font-bold text-primary text-3xl md:text-4xl">{stat.value}</h4>
                        <p className="font-inter text-primary/60 text-sm max-w-[160px] leading-snug">{stat.label}</p>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
