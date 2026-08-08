'use client';

import { motion, AnimatePresence } from 'motion/react';

type BurgerMenuProps = {
    isOpen: boolean;
    links: string[];
    onLinkClick: () => void;
};

export default function BurgerMenu({ isOpen, links, onLinkClick }: BurgerMenuProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="md:hidden overflow-hidden"
                >
                    <ul className="flex flex-col gap-1 pt-6 pb-2">
                        {links.map((item, i) => (
                            <motion.li
                                key={item}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.2 }}
                            >
                                <a
                                    href="#"
                                    onClick={onLinkClick}
                                    className="block py-2.5 text-primary font-inter font-bold text-lg border-b border-primary/5 last:border-none"
                                >
                                    {item}
                                </a>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>
    );
}