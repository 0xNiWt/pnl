'use client';

import { motion } from "motion/react";
import { Menu } from 'lucide-react'
import gerb from '@/public/gerb.png'

export default function Header() {
    return (
        <header className="bg-background px-4 py-4 border-b border-gray-800/20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex items-center justify-between md:justify-center md:gap-12"
            >
                    <div className="flex items-center gap-2">
                        <img src={gerb.src} alt="Герб ліцею" className="h-16" />
                        <h1 className="hidden md:flex text-primary text-[clamp(1rem,0.7143rem_+_0.5952vw,1.25rem)] font-inter font-bold">Природничо-науковий ліцей №145</h1>
                    </div>
                    <nav>
                        <ul className="hidden space-x-4 md:flex">
                            {['Головна', 'Ліцей', 'Вступ', 'Педагоги', 'Навчання', 'Новини'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-primary/60 hover:text-primary font-inter font-bold text-base tracking-wide transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <Menu size={28} color="black" className="md:hidden cursor-pointer" />
                    </nav>
            </motion.div>
        </header>
    )
}