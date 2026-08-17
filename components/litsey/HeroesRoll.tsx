'use client';

import Image from "next/image";
import { motion } from "motion/react";
import { Award, Flame } from "lucide-react";
import { HEROES, type Hero } from "./heroesData";

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function HeroesRoll() {
    return (
        <section className="w-full max-w-7xl mx-auto px-5 md:px-6" id="heroes">
            <div className="flex flex-col">
                {HEROES.map((hero) => (
                    <HeroCard key={hero.id} hero={hero} />
                ))}
            </div>

            <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, ease: smoothOut }}
                className="border-t border-gray-800/20 py-14 md:py-20 text-center font-manrope font-bold text-xl md:text-2xl text-primary tracking-tight"
            >
                Повік не забудемо безмежний геройський чин.
                <br />
                <span className="text-accent">Вічна слава і пам’ять Героям!</span>
            </motion.p>
        </section>
    );
}

function HeroCard({ hero }: { hero: Hero }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="border-b border-gray-800/20 py-10 md:py-16 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-7 md:gap-12"
            id={hero.id}
        >
            <div className="md:sticky md:top-28 md:self-start">
                <div className="relative w-full max-w-[280px] mx-auto md:mx-0 aspect-[3/4] overflow-hidden rounded-2xl bg-primary/[0.04]">
                    <Image
                        src={hero.photo}
                        alt={hero.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 280px, 280px"
                        placeholder="blur"
                    />
                </div>

                <div className="mt-4 max-w-[280px] mx-auto md:mx-0 flex items-start gap-2.5 text-sm text-primary/60">
                    <Flame size={15} className="shrink-0 mt-0.5 text-accent" />
                    <span className="leading-snug">{hero.fell}</span>
                </div>
            </div>

            <div>
                <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.16em] text-secondary mb-3">
                    <span className="w-5 h-px bg-secondary" />
                    {hero.graduation}
                </span>

                <h2 className="font-manrope font-bold text-primary text-2xl md:text-3xl tracking-tight">
                    {hero.name}
                    {hero.callsign && (
                        <span className="text-primary/45 font-medium"> «{hero.callsign}»</span>
                    )}
                </h2>

                {(hero.lifespan || hero.note) && (
                    <p className="mt-1.5 text-sm text-primary/50">
                        {[hero.lifespan, hero.note].filter(Boolean).join(" · ")}
                    </p>
                )}

                <div className="mt-5 flex flex-col gap-3.5 max-w-3xl">
                    {hero.paragraphs.map((p) => (
                        <p key={p.slice(0, 32)} className="text-base text-primary/70 leading-relaxed">
                            {p}
                        </p>
                    ))}
                </div>

                {hero.awards && hero.awards.length > 0 && (
                    <div className="mt-6 max-w-3xl rounded-2xl border border-primary/10 bg-primary/[0.03] p-5">
                        <p className="flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.14em] text-primary/50 mb-3">
                            <Award size={14} className="text-accent" />
                            Нагороджений посмертно
                        </p>

                        <ul className="flex flex-col gap-2">
                            {hero.awards.map((award) => (
                                <li key={award} className="flex gap-3 text-sm text-primary/70 leading-relaxed">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                                    {award}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </motion.article>
    );
}
