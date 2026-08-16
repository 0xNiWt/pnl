'use client';

import Link from "next/link";
import { motion, AnimatePresence } from 'motion/react';

type LinkItem = { label: string; href: string };

type BurgerMenuProps = {
    isOpen: boolean;
    links: LinkItem[];
    isLoggedIn: boolean;
    onLinkClick: () => void;
};

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function BurgerMenu({ isOpen, links, isLoggedIn, onLinkClick }: BurgerMenuProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: smoothOut }}
                    className="md:hidden absolute left-0 right-0 top-full mt-3 bg-background border border-primary/10 rounded-2xl shadow-xl overflow-hidden z-40"
                >
                    <div className="py-4 px-3 flex flex-col gap-4">
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
                                        className="block px-3 py-2.5 rounded-xl text-primary font-inter font-bold text-base hover:bg-primary/5 active:bg-primary/10 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>

                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: links.length * 0.035 + 0.05, duration: 0.25, ease: smoothOut }}
                            className="pt-3 border-t border-primary/10 flex flex-col gap-2 px-1"
                        >
                            {isLoggedIn ? (
                                <Link
                                    href="/profile"
                                    onClick={onLinkClick}
                                    className="w-full text-center rounded-xl border-2 border-primary bg-primary font-inter font-bold text-sm text-background tracking-wide py-2.5 active:scale-[0.98] transition-all hover:bg-primary/90"
                                >
                                    Кабінет
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        onClick={onLinkClick}
                                        className="w-full text-center rounded-xl border-2 border-primary font-inter font-bold text-sm text-primary tracking-wide py-2.5 hover:bg-primary hover:text-background active:scale-[0.98] transition-all"
                                    >
                                        Вхід
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        onClick={onLinkClick}
                                        className="w-full text-center rounded-xl border-2 border-primary bg-primary font-inter font-bold text-sm text-background tracking-wide py-2.5 active:scale-[0.98] transition-all hover:bg-primary/90"
                                    >
                                        Реєстрація
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