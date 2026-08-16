'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося надіслати лист');
                return;
            }

            setSent(true);
        } catch {
            setError('Не вдалося з\'єднатися з сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center px-5 py-10 md:py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Відновлення доступу
                        <span className="w-5 h-px bg-secondary" />
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Забули пароль?
                    </h1>
                    <p className="mt-2 text-sm text-primary/60">
                        Введіть пошту — надішлемо посилання для відновлення
                    </p>
                </div>

                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6 md:p-8 shadow-sm">

                    {error && (
                        <div className="mb-6 p-3.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-2.5 text-xs font-medium text-accent">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {sent ? (
                        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30 text-sm text-secondary text-center">
                            Якщо такий email зареєстрований — на нього надіслано лист із посиланням для відновлення пароля.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="student@kpnl145.kyiv.ua"
                                        className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-background tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Надсилаємо...' : 'Надіслати посилання'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-5 border-t border-primary/10 text-center">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary/70 hover:text-primary transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Повернутися до входу
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
