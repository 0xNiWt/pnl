'use client';

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function NotFound() {
    const digits = ["4", "0", "4"];

    return (
        <div className="relative flex flex-col items-center justify-center min-h-dvh bg-background overflow-hidden px-5">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: smoothOut }}
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-accent/20 blur-[110px]"
            />

            <div className="relative flex flex-col items-center text-center">
                <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-6">
                    <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: 24 }}
                        transition={{ duration: 0.5, delay: 0.4, ease: smoothOut }}
                        className="h-px bg-secondary"
                    />
                    Помилка 404
                </span>

                <div className="flex gap-1 md:gap-3">
                    {digits.map((digit, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -6 : 6 }}
                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                            transition={{
                                duration: 0.7,
                                delay: i * 0.1,
                                ease: smoothOut,
                            }}
                            className="text-[clamp(4.5rem,2.5634rem_+_8.26vw,10rem)] font-grotesk font-bold leading-none text-primary"
                        >
                            {digit}
                        </motion.span>
                    ))}
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45, ease: smoothOut }}
                    className="mt-2 text-[clamp(1.25rem,1.0563rem_+_0.8264vw,1.8rem)] font-bebas tracking-wide text-primary/70"
                >
                    Сторінку не знайдено
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.55, ease: smoothOut }}
                    className="mt-3 text-sm text-primary/50 max-w-sm"
                >
                    Можливо, сторінку перенесено або її ніколи не існувало.
                    Перевірте адресу або поверніться на головну.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.65, ease: smoothOut }}
                >
                    <Link
                        href="/"
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary/90"
                    >
                        <ArrowLeft size={16} />
                        На головну
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}