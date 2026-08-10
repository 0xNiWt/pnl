'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, X } from 'lucide-react';
import gerb from '@/public/gerb.png';
import BurgerMenu from './BurgerMenu';

const LINKS = [
    { label: 'Ліцей', href: '/litsey' },
    { label: 'Вступ', href: '/vstup' },
    { label: 'Педагоги', href: '/pedagogy' },
    { label: 'Рейтинг', href: '/rating' },
    { label: 'Новини', href: '/news' },
];

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: smoothOut }}
            className="sticky top-0 z-50 bg-background px-4 py-4 border-b border-gray-800/20"
        >
            <div className="md:max-w-7xl mx-auto">
                <div className="flex items-center justify-between md:gap-12">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image src={gerb} alt="Герб ліцею" className="h-16 w-auto" priority />
                        <h1 className="text-primary text-[clamp(1rem,0.7143rem_+_0.5952vw,1.25rem)] font-inter font-bold">
                            Природничо-науковий ліцей №145
                        </h1>
                    </Link>

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
                                        className="relative inline-block text-primary/60 hover:text-primary font-inter font-bold text-base tracking-wide transition-colors before:content-[''] before:absolute before:left-0 before:bottom-0 before:w-0 before:h-0.5 before:bg-primary before:transition-all before:duration-300 hover:before:w-full"
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

                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/auth/login" className="hidden md:block rounded-xl border-2 border-primary font-inter font-bold text-sm text-primary tracking-wide py-2 px-4 hover:bg-primary hover:text-background active:scale-95 transition-all">
                            Вхід
                        </Link>
                        <Link href="/auth/register" className="hidden md:block rounded-xl border-2 border-primary bg-primary font-inter font-bold text-sm text-background tracking-wide py-2 px-4 active:scale-95 transition-transform">
                            Реєстрація
                        </Link>
                    </div>
                </div>

                <BurgerMenu
                    isOpen={isOpen}
                    links={LINKS}
                    onLinkClick={() => setIsOpen(false)}
                />
            </div>
        </motion.header>
    );
}