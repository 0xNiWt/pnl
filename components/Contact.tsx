"use client";

import { motion } from "motion/react";
import { User, Mail, Phone } from 'lucide-react';

export default function Contact() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.85, ease: smoothOut }} className="w-full max-w-7xl mx-auto flex flex-col items-center md:items-start gap-8 md:gap-12 px-5 md:px-6 py-10 md:py-24" id="contact">
            <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                <span className="w-6 h-px bg-secondary" />
                Контакти
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full">
                {/* ВАКАНСІЇ */}
                <div className="text-center md:text-left">
                    <h3 className="font-grotesk font-bold text-primary text-lg mb-5">Вакансії</h3>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                <User size={18} className="text-primary" />
                            </span>
                            <p className="text-sm text-primary/70 text-left leading-6">
                                <a href="/vacancies/organizator" className="hover:text-primary transition-colors">1. Педагог - організатор</a><br />
                                <a href="/vacancies/social" className="hover:text-primary transition-colors">2. Соціальний педагог</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* АДРЕСИ */}
                <div className="text-center md:text-left">
                    <h3 className="font-grotesk font-bold text-primary text-lg mb-5">Адреси</h3>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                <Phone size={18} className="text-primary" />
                            </span>
                            <p className="text-sm text-primary/70 text-left leading-6">
                                287-11-49 · 287-47-35<br />287-46-96 · 287-30-38
                            </p>
                        </div>

                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                <Mail size={18} className="text-primary" />
                            </span>
                            <span>
                                <a href="mailto:kpnl145.62@gmail.com" className="text-sm text-primary/70 text-left leading-6">
                                    Адміністрація: <span className="hover:text-primary transition-colors">kpnl145.62@gmail.com</span><br />
                                </a>
                                <a href="mailto:tanlukian@gmail.com" className="text-sm text-primary/70 text-left leading-6">
                                    Адміністратор сайту: <span className="hover:text-primary transition-colors">tanlukian@gmail.com</span>
                                </a>
                            </span>

                        </div>
                    </div>
                </div>

                {/* Зворотній зв'язок */}
                <div className="text-center md:text-left">
                    <h3 className="font-grotesk font-bold text-primary text-lg mb-5">Зворотній зв&apos;язок</h3>

                    <form className="flex flex-col gap-4">
                        <div className="text-left">
                            <label className="text-sm text-primary/70 mb-1.5 block">
                                Як до Вас звертатися <span className="text-accent">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Введіть своє ім'я"
                                className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-2.5 text-sm text-primary placeholder:text-primary/40 outline-none transition-colors focus:border-secondary focus:bg-white"
                            />
                        </div>

                        <div className="text-left">
                            <label className="text-sm text-primary/70 mb-1.5 block">
                                Ваш email <span className="text-accent">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Введіть свій email"
                                className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-2.5 text-sm text-primary placeholder:text-primary/40 outline-none transition-colors focus:border-secondary focus:bg-white"
                            />
                        </div>

                        <div className="text-left">
                            <label className="text-sm text-primary/70 mb-1.5 block">
                                Повідомлення <span className="text-accent">*</span>
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Напишіть повідомлення"
                                className="w-full resize-none rounded-xl border border-primary/10 bg-primary/5 px-4 py-2.5 text-sm text-primary placeholder:text-primary/40 outline-none transition-colors focus:border-secondary focus:bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-1 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary/90"
                        >
                            Відправити
                        </button>
                    </form>
                </div>
            </div>
        </motion.section>
    );
}