'use client';

import { motion } from "motion/react";
import { ClipboardList, GraduationCap, Wallet } from "lucide-react";

const FACTS = [
    {
        icon: GraduationCap,
        title: '8 і 9 класи',
        text: 'Основний набір — конкурс «Школярій 145». До 11 класу прийом не проводиться.',
    },
    {
        icon: ClipboardList,
        title: 'Математика і фізика',
        text: 'Два письмові випробування за програмою попереднього класу.',
    },
    {
        icon: Wallet,
        title: 'Безоплатно',
        text: 'Конкурсні випробування не коштують нічого — це вимога Правил.',
    },
];

const ANCHORS = [
    { href: '#rules', label: 'Правила конкурсу' },
    { href: '#topics', label: 'Перелік тем' },
    { href: '#documents', label: 'Документи' },
    { href: '#courses', label: 'Підготовчі курси' },
];

export default function VstupHero() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-20"
            id="vstup-hero"
        >
            <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                <span className="w-6 h-px bg-secondary" />
                Вступ
            </span>

            <h1 className="font-manrope font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2.4vw,3.6rem)] max-w-3xl">
                Як вступити до ліцею
            </h1>

            <p className="mt-5 text-base text-primary/65 max-w-2xl leading-relaxed">
                Прийом до ПНЛ №145 — тільки на конкурсній основі. Брати участь можуть
                діти з Києва та приміської зони незалежно від місця проживання. Нижче —
                правила конкурсу, перелік тем для підготовки, список документів і
                підготовчі курси ліцею.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
                {ANCHORS.map((anchor) => (
                    <a
                        key={anchor.href}
                        href={anchor.href}
                        className="rounded-full border border-primary/15 px-4 py-2 font-inter text-sm text-primary/70 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                        {anchor.label}
                    </a>
                ))}
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {FACTS.map(({ icon: Icon, title, text }) => (
                    <div
                        key={title}
                        className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-6"
                    >
                        <span className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
                            <Icon size={20} className="text-primary" />
                        </span>
                        <h2 className="font-manrope font-bold text-primary text-base mb-1.5">
                            {title}
                        </h2>
                        <p className="text-sm text-primary/60 leading-relaxed">{text}</p>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
