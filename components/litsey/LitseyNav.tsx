'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";

const SECTIONS = [
    {
        href: "/litsey",
        label: "Про ліцей",
        description: "Історія, етапи навчання, наука та символи закладу",
    },
    {
        href: "/litsey/heroes",
        label: "Герої",
        description: "Випускники ліцею, які загинули, захищаючи незалежність України",
    },
    {
        href: "/litsey/memory",
        label: "Книга пам’яті",
        description: "Родичі вчителів та учнів — учасники Другої світової війни",
    },
    {
        href: "/litsey/documents",
        label: "Нормативна база",
        description: "Статут, ліцензія, положення, кошториси та звіти закладу",
    },
];

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function LitseyNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const active = SECTIONS.find((s) => s.href === pathname) ?? SECTIONS[0];

    return (
        <div className="w-full border-b border-gray-800/20 bg-background">
            <div className="max-w-7xl mx-auto px-5 md:px-6 py-3 relative">

                {/* Десктоп — розділи поруч */}
                <nav className="hidden md:flex items-center gap-2">
                    <span className="font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mr-3">
                        Розділ
                    </span>

                    {SECTIONS.map((section) => {
                        const isActive = section.href === active.href;

                        return (
                            <Link
                                key={section.href}
                                href={section.href}
                                title={section.description}
                                className={`rounded-full px-4 py-2 font-inter text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary text-background"
                                    : "text-primary/70 hover:bg-primary/5 hover:text-primary"
                                    }`}
                            >
                                {section.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Мобільний — окреме бургер-меню розділу */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "Закрити розділи ліцею" : "Відкрити розділи ліцею"}
                    className="md:hidden w-full flex items-center gap-3 text-left"
                >
                    <span className="w-9 h-9 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        {isOpen ? <X size={18} /> : <Menu size={18} />}
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block font-manrope text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                            Розділ ліцею
                        </span>
                        <span className="block font-inter font-bold text-primary truncate">
                            {active.label}
                        </span>
                    </span>

                    <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: smoothOut }}
                        className="shrink-0 text-primary/40"
                    >
                        <ChevronDown size={18} />
                    </motion.span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: smoothOut }}
                            className="md:hidden absolute left-3 right-3 top-full mt-2 bg-background border border-primary/10 rounded-2xl shadow-xl overflow-hidden z-40"
                        >
                            <ul className="p-2 flex flex-col gap-1">
                                {SECTIONS.map((section, i) => {
                                    const isActive = section.href === active.href;

                                    return (
                                        <motion.li
                                            key={section.href}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.035, duration: 0.25, ease: smoothOut }}
                                        >
                                            <Link
                                                href={section.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`block px-3 py-2.5 rounded-xl transition-colors ${isActive ? "bg-primary/5" : "hover:bg-primary/5 active:bg-primary/10"
                                                    }`}
                                            >
                                                <span className="block font-inter font-bold text-primary">
                                                    {section.label}
                                                </span>
                                                <span className="block text-xs text-primary/50 leading-snug mt-0.5">
                                                    {section.description}
                                                </span>
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
