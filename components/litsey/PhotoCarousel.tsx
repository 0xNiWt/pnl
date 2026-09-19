'use client';

import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export type Slide = {
    src: StaticImageData;
    alt: string;
    caption: string;
};

/**
 * Фото, що самі змінюють одне одне: плавне перетікання з легким
 * наближенням кадру. Під курсором показ зупиняється, крапки внизу
 * дозволяють перейти до будь-якого фото. Хто вимкнув анімації в системі,
 * бачить просту зміну без руху.
 */
export default function PhotoCarousel({
    slides,
    interval = 5500,
    className = "",
}: {
    slides: Slide[];
    interval?: number;
    className?: string;
}) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (paused || slides.length < 2) return;
        const timer = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), interval);
        return () => window.clearTimeout(timer);
    }, [index, paused, slides.length, interval]);

    const slide = slides[index];

    return (
        <figure
            className={`relative overflow-hidden bg-primary ${className}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-roledescription="слайдшоу"
        >
            <AnimatePresence initial={false}>
                <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        opacity: { duration: 1.1, ease: [0.4, 0, 0.2, 1] },
                        scale: { duration: interval / 1000 + 1.2, ease: "linear" },
                    }}
                >
                    <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 520px"
                        className="object-cover"
                        placeholder="blur"
                        loading={index === 0 ? "eager" : "lazy"}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />

            <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.45 }}
                        className="font-plex text-xs font-semibold uppercase tracking-[0.14em] text-background pr-4"
                    >
                        {slide.caption}
                    </motion.p>
                </AnimatePresence>

                {slides.length > 1 && (
                    <div className="mt-3 flex items-center gap-1.5">
                        {slides.map((s, i) => (
                            <button
                                key={s.caption + i}
                                onClick={() => setIndex(i)}
                                aria-label={`Фото ${i + 1} з ${slides.length}`}
                                aria-current={i === index}
                                className="group h-4 flex items-center"
                            >
                                <span
                                    className={`block h-1 transition-all duration-500 ${i === index ? "w-7 bg-secondary" : "w-3 bg-background/45 group-hover:bg-background/80"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </figcaption>
        </figure>
    );
}
