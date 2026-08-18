'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { LYCEUM_EMAIL_SUFFIX, normalizeLyceumEmail } from '@/lib/email';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Домен ліцею дописується автоматично — див. lib/email.ts.
    const normalizedEmail = normalizeLyceumEmail(email);

    // Куди повертатися після входу. Proxy кладе сюди сторінку, з якої
    // людину розвернуло на логін (?redirectTo=/profile/votes). Беремо лише
    // внутрішні шляхи: «//чужий-сайт» чи повний URL сюди не пройдуть.
    function destination() {
        const target = new URLSearchParams(window.location.search).get('redirectTo');
        return target && target.startsWith('/') && !target.startsWith('//')
            ? target
            : '/profile';
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmail(normalizedEmail);
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося увійти');
                return;
            }

            window.location.href = destination();
        } catch {
            setError('Не вдалося з\'єднатися з сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter selection:bg-primary selection:text-background">
            <div className="flex-1 flex items-center justify-center px-5 py-10 md:py-16">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                            <span className="w-5 h-px bg-secondary" />
                            Авторизація
                            <span className="w-5 h-px bg-secondary" />
                        </span>
                        <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            Вхід до системи
                        </h1>
                        <p className="mt-2 text-sm text-primary/60">
                            Введіть дані вашого акаунту ПНЛ №145
                        </p>
                    </div>

                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm">

                        {error && (
                            <div className="mb-6 p-3.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-2.5 text-xs font-medium text-accent">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                                    Електронна пошта
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="text"
                                        inputMode="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => setEmail(normalizedEmail)}
                                        placeholder="student"
                                        className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                                    />
                                </div>
                                <p className="mt-1 text-[11px] text-primary/45">
                                    Достатньо імені акаунта — <b className="font-semibold">{LYCEUM_EMAIL_SUFFIX}</b> допишемо самі
                                    {email && email !== normalizedEmail && (
                                        <span className="text-secondary"> · {normalizedEmail}</span>
                                    )}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70">
                                        Пароль
                                    </label>
                                        <Link href="/auth/forgot-password" className="text-xs font-semibold text-secondary hover:text-primary transition-colors">
                                            Забули пароль?
                                        </Link>
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-background tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Зачекайте...' : 'Увійти'}
                            </button>
                        </form>

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
