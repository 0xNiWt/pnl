'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, FileCheck } from "lucide-react";
import { RULES, RULES_INTRO, REQUIRED_DOCUMENTS } from "./admissionData";

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function AdmissionRules() {
    // Перший розділ відкритий: інакше сторінка виглядає як стос закритих дверей.
    const [open, setOpen] = useState<string | null>(RULES[0].id);

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-20 scroll-mt-24"
            id="rules"
        >
            <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                <span className="w-6 h-px bg-secondary" />
                Правила
            </span>

            <h2 className="font-manrope font-bold text-primary text-3xl md:text-4xl tracking-tight mb-4 max-w-3xl">
                Правила конкурсного відбору, прийому та зарахування
            </h2>

            <p className="text-sm text-primary/55 max-w-3xl leading-relaxed mb-8">
                {RULES_INTRO}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
                <div className="flex flex-col gap-3">
                    {RULES.map((section) => {
                        const isOpen = open === section.id;

                        return (
                            <div
                                key={section.id}
                                className="rounded-2xl border border-primary/10 bg-primary/[0.02] overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpen(isOpen ? null : section.id)}
                                    aria-expanded={isOpen}
                                    className="w-full flex items-center gap-4 px-5 md:px-6 py-4 text-left hover:bg-primary/[0.03] transition-colors"
                                >
                                    <span className="font-bebas text-2xl text-accent leading-none w-6 shrink-0">
                                        {section.number}
                                    </span>

                                    <span className="font-manrope font-bold text-primary text-base md:text-lg flex-1">
                                        {section.title}
                                    </span>

                                    <span className="text-xs text-primary/35 shrink-0 hidden sm:block">
                                        {section.items.length} пунктів
                                    </span>

                                    <motion.span
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.25, ease: smoothOut }}
                                        className="text-primary/40 shrink-0"
                                    >
                                        <ChevronDown size={18} />
                                    </motion.span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: smoothOut }}
                                            className="overflow-hidden"
                                        >
                                            <ol className="px-5 md:px-6 pb-5 pt-1 flex flex-col gap-3.5 border-t border-primary/[0.07]">
                                                {section.items.map((item, i) => (
                                                    <li key={i} className="flex gap-3.5 pt-3.5 first:pt-4">
                                                        <span className="font-manrope text-xs font-bold text-secondary tabular-nums shrink-0 pt-0.5 w-8">
                                                            {section.number}.{i + 1}
                                                        </span>
                                                        <span className="text-sm text-primary/70 leading-relaxed">
                                                            {item}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Документи — окремою карткою, бо це найчастіше питання батьків. */}
                <div
                    className="relative overflow-hidden rounded-2xl bg-primary p-7 text-background lg:sticky lg:top-28 scroll-mt-24"
                    id="documents"
                >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/35 blur-[60px]" />

                    <div className="relative">
                        <div className="flex items-center gap-2.5 mb-5">
                            <span className="w-9 h-9 rounded-xl bg-background/10 flex items-center justify-center">
                                <FileCheck size={16} className="text-cream" />
                            </span>
                            <span className="font-manrope font-bold text-xs uppercase tracking-[0.15em] text-cream/80">
                                Які документи подати
                            </span>
                        </div>

                        <ul className="flex flex-col gap-3">
                            {REQUIRED_DOCUMENTS.map((doc) => (
                                <li key={doc} className="flex gap-3 text-[15px] leading-snug">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cream shrink-0" />
                                    {doc}
                                </li>
                            ))}
                        </ul>

                        <p className="mt-6 pt-5 border-t border-background/15 text-xs text-background/60 leading-relaxed">
                            Характеристики з попереднього місця навчання та довідки з роботи
                            батьків вимагати заборонено.
                        </p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
