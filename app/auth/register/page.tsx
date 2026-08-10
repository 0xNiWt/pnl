'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from "@/components/Header";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Перевірка чи email належить до домену ліцею (наприклад, @pnl.kiev.ua або будь-який pnl)
    const isPnlEmail = email.toLowerCase().includes('@pnl');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isPnlEmail) {
            setError('Реєстрація дозволена тільки для корпоративних пошт ліцею (наприклад, user@pnl.kiev.ua)');
            return;
        }

        setError('');
        // Тут буде ваша логіка реєстрації на бекенд
        console.log({ fullName, email, password });
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
                            Доступ до системи
                            <span className="w-5 h-px bg-secondary" />
                        </span>
                        <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            Створити акаунт
                        </h1>
                        <p className="mt-2 text-sm text-primary/60">
                            Тільки для учнів та викладачів ПНЛ №145
                        </p>
                    </div>

                    {/* Картка форми */}
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm">

                        {error && (
                            <div className="mb-6 p-3.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-2.5 text-xs font-medium text-accent">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* ПІБ */}
                            <div>
                                <label className="block text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                                    Повне ім&apos;я <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Шевченко Тарас"
                                        className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                                    />
                                </div>
                            </div>

                            {/* PNL Email */}
                            <div>
                                <label className="block text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                                    Шкільна пошта <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError('');
                                        }}
                                        placeholder="student@pnl.kiev.ua"
                                        className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:bg-white focus:ring-2 ${
                                            email && !isPnlEmail 
                                                ? 'border-accent/50 bg-accent/5 focus:border-accent focus:ring-accent/20' 
                                                : 'border-primary/10 bg-primary/5 focus:border-secondary focus:ring-secondary/20'
                                        }`}
                                    />
                                </div>
                                {email && !isPnlEmail && (
                                    <p className="mt-1 text-[11px] text-accent">
                                        Email має містити домен ліцею (@pnl...)
                                    </p>
                                )}
                            </div>

                            {/* Пароль */}
                            <div>
                                <label className="block text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                                    Пароль <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
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

                            {/* Кнопка відправки */}
                            <button
                                type="submit"
                                className="w-full mt-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-background tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                Зареєструватися
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </form>

                        {/* Посилання на вхід */}
                        <div className="mt-6 pt-5 border-t border-primary/10 text-center">
                            <p className="text-sm text-primary/70">
                                Вже є акаунт?{' '}
                                <Link 
                                    href="/auth/login" 
                                    className="font-bold text-primary hover:text-secondary underline underline-offset-4 transition-colors"
                                >
                                    Увійти
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}