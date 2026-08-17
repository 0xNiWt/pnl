'use client';

import Image, { type StaticImageData } from "next/image";
import { motion } from "motion/react";
import turslet from "@/public/about/turslet.jpg";
import football from "@/public/about/football.jpg";
import botanical from "@/public/about/botanical-garden.jpg";

type Shot = {
    src: StaticImageData;
    alt: string;
    tag: string;
    caption: string;
    wide?: boolean;
};

const SHOTS: Shot[] = [
    {
        src: turslet,
        alt: "Турслет ліцею: змагання, шахи, намети та спільна кухня на природі",
        tag: "Турслет",
        caption: "Класи змагаються, готують, грають у шахи й перетягують линву — цілий день на природі.",
        wide: true,
    },
    {
        src: football,
        alt: "Футбольна команда ліцею з медалями та дипломом",
        tag: "Спорт",
        caption: "Футбольна команда ліцею — з медалями після турніру.",
    },
    {
        src: botanical,
        alt: "Учні ліцею на весняному трудовому десанті серед квітучих магнолій",
        tag: "Трудовий десант",
        caption: "Весняні толоки: лопати, граблі та квітучі магнолії.",
    },
];

export default function LifeGallery() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-24"
            id="life"
        >
            <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                <span className="w-6 h-px bg-secondary" />
                Життя ліцею
            </span>

            <h2 className="font-manrope font-bold text-primary text-3xl md:text-4xl tracking-tight mb-4 max-w-xl">
                Не тільки формули
            </h2>

            <p className="text-base text-primary/70 max-w-xl mb-10">
                Турслети, спортивні турніри, толоки й ліцейські свята — те, через що
                клас стає командою, а чотири роки згадуються не лише за оцінками.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {SHOTS.map((shot) => (
                    <figure
                        key={shot.tag}
                        className={`group relative overflow-hidden rounded-[20px] bg-primary/[0.03] ${shot.wide ? "md:col-span-2" : ""
                            }`}
                    >
                        <div className={`relative w-full ${shot.wide ? "aspect-[5/3]" : "aspect-[4/3]"}`}>
                            <Image
                                src={shot.src}
                                alt={shot.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                sizes={shot.wide ? "(max-width: 768px) 100vw, 1200px" : "(max-width: 768px) 100vw, 600px"}
                                placeholder="blur"
                            />
                        </div>

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />

                        <figcaption className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                            <span className="inline-block font-manrope text-[11px] font-bold uppercase tracking-[0.16em] text-cream mb-1.5">
                                {shot.tag}
                            </span>
                            <p className="text-sm md:text-base text-background/90 leading-snug max-w-lg">
                                {shot.caption}
                            </p>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </motion.section>
    );
}
