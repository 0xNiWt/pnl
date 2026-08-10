'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from "@/components/Header";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email, password });
    };

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter selection:bg-primary selection:text-background">
            <Header />

            <div className="flex-1 flex items-center justify-center px-5 py-10 md:py-16">
                <div className="w-full max-w-md">
                    {/* Заголовок та бейдж */}
                    <div className="text-center mb-8">
                        <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                            <span className="w-5 h-px bg-secondary" />
                            Авторизація
                            <span className="w-5 h-px bg-secondary" />
                        </span>
                        <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            Вхід до системи
                        </h1>
                        <p className="mt-2 text-sm text-primary/60">
                            Введіть дані вашого акаунту ПНЛ №145
                        </p>
                    </div>

                    {/* Картка форми */}
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                                    Електронна пошта
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@pnl.kiev.ua"
                                        className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                                    />
                                </div>
                            </div>

                            {/* Пароль */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/70">
                                        Пароль
                                    </label>
                                    <a href="#" className="text-xs text-primary/60 hover:text-primary transition-colors">
                                        Забули пароль?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-10 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Чекбокс Пам'ятати мене */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="rounded border-primary/20 text-primary focus:ring-secondary/20 accent-primary"
                                />
                                <label htmlFor="remember" className="text-xs text-primary/70 cursor-pointer select-none">
                                    Запам&apos;ятати мене на цьому пристрої
                                </label>
                            </div>

                            {/* Кнопка Увійти */}
                            <button
                                type="submit"
                                className="w-full mt-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-background tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                Увійти
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </form>

                        {/* Посилання на реєстрацію */}
                        <div className="mt-6 pt-5 border-t border-primary/10 text-center">
                            <p className="text-sm text-primary/70">
                                Ще немає акаунту?{' '}
                                <Link 
                                    href="/auth/register" 
                                    className="font-bold text-primary hover:text-secondary underline underline-offset-4 transition-colors"
                                >
                                    Зареєструватися
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}