'use client';

import { useState } from 'react';
import Image from "next/image";
import { motion } from "motion/react";
import { Menu, X } from 'lucide-react';
import gerb from '@/public/gerb.png';
import BurgerMenu from './BurgerMenu';

const LINKS = ['Головна', 'Ліцей', 'Вступ', 'Педагоги', 'Навчання', 'Новини'];

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-background px-4 py-4 border-b border-gray-800/20">
            <div className="md:max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="flex items-center justify-between md:gap-12"
                >
                    <div className="flex items-center gap-2">
                        <Image src={gerb} alt="Герб ліцею" className="h-16 w-auto" priority />
                        <h1 className="text-primary text-[clamp(1rem,0.7143rem_+_0.5952vw,1.25rem)] font-inter font-bold">
                            Природничо-науковий ліцей №145
                        </h1>
                    </div>

                    <nav>
                        <ul className="hidden space-x-4 md:flex">
                            {LINKS.map((item) => (
                                <li key={item}>
                                    <a href="#" className="relative inline-block text-primary/60 hover:text-primary font-inter font-bold text-base tracking-wide transition-colors before:content-[''] before:absolute before:left-0 before:bottom-0 before:w-0 before:h-0.5 before:bg-primary before:transition-all before:duration-300 hover:before:w-full">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
                            className="md:hidden cursor-pointer text-primary"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </nav>
                </motion.div>

                <BurgerMenu
                    isOpen={isOpen}
                    links={LINKS}
                    onLinkClick={() => setIsOpen(false)}
                />
            </div>
        </header>
    );
}