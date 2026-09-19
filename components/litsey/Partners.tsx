'use client';

import Image, { type StaticImageData } from "next/image";
import { motion } from "motion/react";
import { FlaskConical, GraduationCap } from "lucide-react";
import cybernetics from "@/public/about/partners/cybernetics.jpg";
import knu from "@/public/about/partners/knu.jpg";
import kpi from "@/public/about/partners/kpi.jpg";
import ntu from "@/public/about/partners/ntu.jpg";

const smoothOut = [0.16, 1, 0.3, 1] as const;

const INSTITUTES = [
    "Інститут кібернетики імені В. М. Глушкова",
    "Інститут фізики напівпровідників",
    "Інститут теоретичної фізики",
    "Інститут математики",
    "Інститут хімії поверхні",
    "Інститут педагогіки і психології професійної освіти АПН України",
];

const UNIVERSITIES = [
    "Київський національний університет імені Тараса Шевченка",
    "Національний технічний університет України «Київський політехнічний інститут»",
    "Національний Тайванський університет",
];

const PHOTOS: { photo: StaticImageData; caption: string; alt: string }[] = [
    { photo: cybernetics, caption: "Інститут кібернетики НАН України", alt: "Будівля Інституту кібернетики імені В. М. Глушкова НАН України" },
    { photo: knu, caption: "КНУ імені Тараса Шевченка", alt: "Червоний корпус Київського національного університету імені Тараса Шевченка" },
    { photo: kpi, caption: "Київський політехнічний інститут", alt: "Головний корпус Київського політехнічного інституту" },
    { photo: ntu, caption: "Національний Тайванський університет", alt: "Корпус Національного Тайванського університету" },
];

function List({ items }: { items: string[] }) {
    return (
        <ul className="mt-5 flex flex-col divide-y divide-secondary/30 border-y border-secondary/70">
            {items.map((name) => (
                <li key={name} className="flex gap-3 py-3 text-[15px] font-semibold text-primary/90 leading-snug">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-current" />
                    {name}
                </li>
            ))}
        </ul>
    );
}

export default function Partners() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-secondary/70 px-5 md:px-6 py-10 md:py-24"
            id="partners"
        >
            <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                <span className="w-10 h-0.5 bg-secondary" />
                Наука поруч
            </span>

            <h2 className="font-cormorant font-bold text-primary text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] leading-[1.02] tracking-[-0.02em] mb-4 max-w-3xl">
                Наукові партнери ліцею
            </h2>

            <p className="text-base text-primary/85 max-w-2xl mb-10 leading-relaxed">
                Ліцей № 145 має науково-методичні зв’язки з інститутами Національної
                академії наук України та угоди про співпрацю з провідними університетами
                України і світу.
            </p>

            {/* Фото — усі однакового розміру */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
                {PHOTOS.map((p) => (
                    <figure key={p.caption} className="group relative aspect-[4/3] overflow-hidden bg-primary">
                        <Image
                            src={p.photo}
                            alt={p.alt}
                            fill
                            sizes="(max-width: 1024px) 50vw, 300px"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            placeholder="blur"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/90 to-transparent" />
                        <figcaption className="absolute bottom-0 left-0 right-0 p-3 md:p-4 font-plex text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.12em] text-background leading-snug">
                            {p.caption}
                        </figcaption>
                    </figure>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="border border-secondary/70 bg-secondary/[0.3] p-6 md:p-8">
                    <p className="flex items-center gap-2 font-plex text-[13px] font-semibold uppercase tracking-[0.16em] text-secondary-deep">
                        <FlaskConical size={16} />
                        Науково-методичні зв’язки
                    </p>
                    <h3 className="mt-2 font-cormorant font-bold text-primary text-3xl leading-tight">
                        Інститути НАН України
                    </h3>
                    <List items={INSTITUTES} />
                </div>

                <div className="border border-secondary/70 bg-secondary/[0.3] p-6 md:p-8">
                    <p className="flex items-center gap-2 font-plex text-[13px] font-semibold uppercase tracking-[0.16em] text-secondary-deep">
                        <GraduationCap size={16} />
                        Угоди про співпрацю
                    </p>
                    <h3 className="mt-2 font-cormorant font-bold text-primary text-3xl leading-tight">
                        Університети
                    </h3>
                    <List items={UNIVERSITIES} />
                </div>
            </div>
        </motion.section>
    );
}
