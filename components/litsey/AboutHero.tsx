'use client';

import Image from "next/image";
import { motion } from "motion/react";
import svyato from "@/public/about/svyato.jpg";

export default function AboutHero() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-24"
            id="about-hero"
        >
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] items-start md:items-center gap-8 md:gap-12">
                <div className="text-center md:text-left">
                    <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                        <span className="w-10 h-0.5 bg-secondary" />
                        Про ліцей
                    </span>

                    <h2 className="font-cormorant font-bold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.5rem,1.4rem+4.6vw,5.8rem)]">
                        Школа, де наука<br />стає <span className="text-accent">покликанням</span>
                    </h2>

                    <p className="mt-5 text-base text-primary/85 max-w-[480px] mx-auto md:mx-0">
                        Київський природничо-науковий ліцей №145 створено на базі
                        фізико-математичної школи, педколектив якої має 65-річний досвід
                        роботи з обдарованими дітьми. Поглиблені фізика, математика,
                        хімія та інформатика — і вчителі, які пам&apos;ятають ваше ім&apos;я.
                    </p>
                </div>

                <div className="relative w-full max-w-[380px] md:max-w-[400px] mx-auto md:mx-0 md:justify-self-end overflow-hidden rounded-none-[20px] bg-primary p-7 text-background">
                    <div className="mb-3.5 font-plex font-bold text-xs uppercase tracking-[0.15em] text-cream/80">
                        Наша місія
                    </div>

                    <p className="relative font-inter leading-snug">
                        Виховати покоління, яке мислить критично, ставить
                        запитання «чому» і не боїться шукати відповіді
                        експериментальним шляхом.
                    </p>
                </div>
            </div>

            <figure className="relative mt-10 md:mt-16 overflow-hidden rounded-none-[20px]">
                <Image
                    src={svyato}
                    alt="Урочистість у ліцеї: учні та вчителі в актовій залі"
                    className="w-full h-auto"
                    sizes="(max-width: 768px) 100vw, 1200px"
                    placeholder="blur"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/80 to-transparent" />

                <figcaption className="absolute bottom-0 left-0 right-0 p-5 md:p-7 font-plex text-xs md:text-sm font-semibold uppercase tracking-[0.14em] text-background/90">
                    Ліцейські урочистості · зустрічі поколінь ліцеїстів
                </figcaption>
            </figure>
        </motion.section>
    );
}
