'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function ResetPasswordForm() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/v1/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося оновити пароль');
                return;
            }

            router.push('/profile');
            router.refresh();
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
                    <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-3">
                        <span className="w-10 h-0.5 bg-secondary" />
                        Новий пароль
                        <span className="w-10 h-0.5 bg-secondary" />
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Встановіть новий пароль
                    </h1>
                </div>

                <div className="bg-secondary/[0.3] border border-primary/10 rounded-none p-6 md:p-8 shadow-none">

                    {error && (
                        <div className="mb-6 p-3.5 rounded-none bg-accent/10 border border-accent/30 flex items-center gap-2.5 text-xs font-medium text-accent">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-plex font-semibold uppercase tracking-wider text-primary/85 mb-1.5">
                                Новий пароль
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-none border border-primary/10 bg-primary/5 pl-10 pr-10 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 rounded-none bg-primary py-3 px-4 text-sm font-bold text-background tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Зберігаємо...' : 'Зберегти новий пароль'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
