'use client';

import { useState } from 'react';
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, X } from 'lucide-react';
import BurgerMenu from './BurgerMenu';
import LanguageSwitch from './LanguageSwitch';
import Bi from './Bi';

const LINKS = [
    { label: 'Ліцей', en: 'Lyceum', href: '/' },
    { label: 'Вступ', en: 'Admission', href: '/vstup' },
    { label: 'Педагоги', en: 'Teachers', href: '/pedagogy' },
    { label: 'Випускники', en: 'Alumni', href: '/alumni' },
    { label: 'Новини', en: 'News', href: '/news' },
];

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function Nav({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <nav>
                <ul className="hidden items-center gap-7 lg:flex">
                    {LINKS.map((item) => (
                        <li key={item.label}>
                            <Link
                                href={item.href}
                                // Колір посилань не змінюється ніколи — ні при наведенні,
                                // ні при натисканні. Єдина реакція на наведення — підкреслення.
                                className="relative inline-block font-plex text-[15px] font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:text-secondary-deep before:content-[''] before:absolute before:left-0 before:-bottom-1.5 before:h-0.5 before:w-0 before:bg-secondary before:transition-all before:duration-300 hover:before:w-full"
                            >
                                <Bi uk={item.label} en={item.en} />
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="lg:hidden flex items-center gap-3">
                    <LanguageSwitch />
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
                        className="lg:hidden cursor-pointer text-primary relative w-7 h-7"
                    >
                        <motion.span
                            animate={{ rotate: isOpen ? 90 : 0, opacity: 1 }}
                            transition={{ duration: 0.25, ease: smoothOut }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </motion.span>
                    </button>
                </div>
            </nav>

            <BurgerMenu
                isOpen={isOpen}
                links={LINKS}
                isLoggedIn={isLoggedIn}
                onLinkClick={() => setIsOpen(false)}
            />
        </>
    );
}