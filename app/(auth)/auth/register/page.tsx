'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { LYCEUM_EMAIL_SUFFIX, isLyceumEmail, normalizeLyceumEmail } from '@/lib/email';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [classGrade, setClassGrade] = useState('');
    const [classLetter, setClassLetter] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const CLASS_GRADES = ['7', '8', '9', '10', '11', '12'];
    const CLASS_LETTERS = ['А', 'Б', 'В'];
    const studentClass = classGrade && classLetter ? `${classGrade}-${classLetter}` : '';

    // Домен ліцею дописується автоматично, тож перевіряємо вже доповнене значення.
    const normalizedEmail = normalizeLyceumEmail(email);
    const isPnlEmail = isLyceumEmail(normalizedEmail);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setEmail(normalizedEmail);

        if (!isPnlEmail) {
            setError(`Реєстрація дозволена тільки для ліцейських пошт (${LYCEUM_EMAIL_SUFFIX})`);
            return;
        }

        if (!studentClass) {
            setError('Оберіть клас зі списку');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail, password, fullName, studentClass }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Помилка реєстрації');
                return;
            }

            setSuccess(true);

            if (!data.needsEmailConfirmation) {
                window.location.href = '/auth/login';
            }
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
                            Доступ до системи
                            <span className="w-5 h-px bg-secondary" />
                        </span>
                        <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            Створити акаунт
                        </h1>
                        <p className="mt-2 text-sm text-primary/60">
                            Тільки для учнів та викладачів ПНЛ №145
                        </p>
                    </div>

                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm">

                        {error && (
                            <div className="mb-6 p-3.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-2.5 text-xs font-medium text-accent">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-3.5 rounded-xl bg-secondary/10 border border-secondary/30 text-xs font-medium text-secondary">
                                Реєстрація успішна! Перевірте пошту, щоб підтвердити акаунт.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                                    Повне ім&apos;я <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Нікіта Литовченко"
                                        className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                                    Шкільна пошта <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="text"
                                        inputMode="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError('');
                                        }}
                                        // Домен дописуємо, коли людина йде далі по формі,
                                        // а не на кожній натиснутій літері.
                                        onBlur={() => setEmail(normalizedEmail)}
                                        placeholder="student"
                                        className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:bg-white focus:ring-2 ${
                                            email && !isPnlEmail
                                                ? 'border-accent/50 bg-accent/5 focus:border-accent focus:ring-accent/20'
                                                : 'border-primary/10 bg-primary/5 focus:border-secondary focus:ring-secondary/20'
                                        }`}
                                    />
                                </div>
                                {email && !isPnlEmail ? (
                                    <p className="mt-1 text-[11px] text-accent">
                                        Потрібна ліцейська пошта ({LYCEUM_EMAIL_SUFFIX})
                                    </p>
                                ) : (
                                    <p className="mt-1 text-[11px] text-primary/45">
                                        Достатньо імені акаунта — <b className="font-semibold">{LYCEUM_EMAIL_SUFFIX}</b> допишемо самі
                                        {email && email !== normalizedEmail && (
                                            <span className="text-secondary"> · {normalizedEmail}</span>
                                        )}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                                    Клас <span className="text-accent">*</span>
                                </label>
                                <div className="flex gap-3">
                                    <select
                                        required
                                        value={classGrade}
                                        onChange={(e) => setClassGrade(e.target.value)}
                                        className="w-1/2 rounded-xl border border-primary/10 bg-primary/5 px-4 py-2.5 text-sm text-primary outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                                    >
                                        <option value="" disabled>Клас</option>
                                        {CLASS_GRADES.map((g) => (
                                            <option key={g} value={g}>{g} клас</option>
                                        ))}
                                    </select>
                                    <select
                                        required
                                        value={classLetter}
                                        onChange={(e) => setClassLetter(e.target.value)}
                                        className="w-1/2 rounded-xl border border-primary/10 bg-primary/5 px-4 py-2.5 text-sm text-primary outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                                    >
                                        <option value="" disabled>Літера</option>
                                        {CLASS_LETTERS.map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-background tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Зачекайте...' : 'Зареєструватися'}
                                {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                            </button>
                        </form>

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

