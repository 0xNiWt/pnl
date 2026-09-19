'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Bi from "./Bi";
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LinkItem = { label: string; en: string; href: string };

type BurgerMenuProps = {
    isOpen: boolean;
    links: LinkItem[];
    isLoggedIn: boolean;
    onLinkClick: () => void;
};

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function BurgerMenu({ isOpen, links, isLoggedIn, onLinkClick }: BurgerMenuProps) {
    // Меню розкривається на весь екран під шапкою, тож треба знати, де
    // шапка закінчується: її висота залежить від шрифтів і розміру герба.
    const [headerBottom, setHeaderBottom] = useState<number | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const measure = () => {
            const header = document.querySelector('header');
            setHeaderBottom(header ? Math.round(header.getBoundingClientRect().bottom) : 0);
        };

        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [isOpen]);

    // Скрол сторінки навмисно не блокуємо: overflow: hidden на <html> вимикає
    // sticky, і шапка з хрестиком поїхала б за межі екрана. Від прокручування
    // фону пальцем захищає overscroll-contain на самій панелі.
    return (
        <AnimatePresence>
            {isOpen && headerBottom !== null && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: smoothOut }}
                    style={{ top: headerBottom }}
                    // fixed + bottom-0: панель тягнеться від шапки до самого
                    // низу екрана, тож сайт не просвічує ні в щілину згори,
                    // ні під меню.
                    className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-background border-t border-primary/10 overflow-y-auto overscroll-contain"
                >
                    <div className="min-h-full py-4 px-3 flex flex-col gap-4">
                        <ul className="flex flex-col gap-1">
                            {links.map((item, i) => (
                                <motion.li
                                    key={item.label}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.035, duration: 0.25, ease: smoothOut }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={onLinkClick}
                                        className="block px-3 py-2.5 rounded-none text-primary font-inter font-bold text-base hover:bg-primary/5 active:bg-primary/10 transition-colors"
                                    >
                                        <Bi uk={item.label} en={item.en} />
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>

                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: links.length * 0.035 + 0.05, duration: 0.25, ease: smoothOut }}
                            className="mt-auto pt-4 border-t border-primary/10 flex flex-col gap-2 px-1"
                        >
                            <Link
                                href="/shop"
                                onClick={onLinkClick}
                                className="w-full flex items-center justify-center gap-2 rounded-none border-2 border-primary font-inter font-bold text-sm text-primary tracking-wide py-2.5 hover:bg-primary hover:text-background active:scale-[0.98] transition-all"
                            >
                                <ShoppingCart size={16} />
                                <Bi uk="Магазин" en="Shop" />
                            </Link>

                            {isLoggedIn ? (
                                <Link
                                    href="/profile"
                                    onClick={onLinkClick}
                                    className="w-full text-center rounded-none border-2 border-primary bg-primary font-inter font-bold text-sm text-background tracking-wide py-2.5 active:scale-[0.98] transition-all hover:bg-primary/90"
                                >
                                    <Bi uk="Кабінет" en="My account" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        onClick={onLinkClick}
                                        className="w-full text-center rounded-none border-2 border-primary font-inter font-bold text-sm text-primary tracking-wide py-2.5 hover:bg-primary hover:text-background active:scale-[0.98] transition-all"
                                    >
                                        <Bi uk="Вхід" en="Log in" />
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        onClick={onLinkClick}
                                        className="w-full text-center rounded-none border-2 border-primary bg-primary font-inter font-bold text-sm text-background tracking-wide py-2.5 active:scale-[0.98] transition-all hover:bg-primary/90"
                                    >
                                        <Bi uk="Реєстрація" en="Sign up" />
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}