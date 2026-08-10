'use client';

import { useState } from 'react';
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, X } from 'lucide-react';
import BurgerMenu from './BurgerMenu';

const LINKS = [
    { label: 'Ліцей', href: '/litsey' },
    { label: 'Вступ', href: '/vstup' },
    { label: 'Педагоги', href: '/pedagogy' },
    { label: 'Рейтинг', href: '/rating' },
    { label: 'Новини', href: '/news' },
];

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function Nav({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <nav>
                <ul className="hidden space-x-4 md:flex">
                    {LINKS.map((item, i) => (
                        <motion.li
                            key={item.label}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 + i * 0.05, ease: smoothOut }}
                        >
                            <Link
                                href={item.href}
                                className="relative inline-block text-primary/60 hover:text-primary font-inter font-medium text-base tracking-wide transition-colors before:content-[''] before:absolute before:left-0 before:bottom-0 before:w-0 before:h-0.5 before:bg-primary before:transition-all before:duration-300 hover:before:w-full"
                            >
                                {item.label}
                            </Link>
                        </motion.li>
                    ))}
                </ul>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
                    className="md:hidden cursor-pointer text-primary relative w-7 h-7"
                >
                    <motion.span
                        animate={{ rotate: isOpen ? 90 : 0, opacity: 1 }}
                        transition={{ duration: 0.25, ease: smoothOut }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </motion.span>
                </button>
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