'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { REACTIONS, emptyCounts, type ReactionId, type ReactionsState } from '@/lib/newsReactions';

/**
 * Реакції під новиною. Кількість бачать усі, а натиснути можуть лише
 * зареєстровані: гостю замість цього пропонуємо увійти.
 */
export default function NewsReactions({ newsId }: { newsId: string }) {
    const [state, setState] = useState<ReactionsState>({ counts: emptyCounts(), mine: null, isLoggedIn: false });
    const [loaded, setLoaded] = useState(false);
    const [busy, setBusy] = useState(false);
    const [hint, setHint] = useState<string | null>(null);
    const pathname = usePathname();
    const loginHref = `/auth/login?redirectTo=${encodeURIComponent(pathname)}`;

    useEffect(() => {
        let alive = true;
        fetch(`/api/v1/news/${newsId}/reactions`, { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .then((data: ReactionsState | null) => {
                if (!alive) return;
                if (data) setState(data);
                setLoaded(true);
            })
            .catch(() => alive && setLoaded(true));
        return () => {
            alive = false;
        };
    }, [newsId]);

    const react = async (id: ReactionId) => {
        if (busy) return;
        if (!state.isLoggedIn) {
            setHint('login');
            return;
        }

        // Одразу показуємо результат, а відповідь сервера потім його уточнює.
        const prev = state;
        const counts = { ...state.counts };
        if (state.mine) counts[state.mine] -= 1;
        const mine = state.mine === id ? null : id;
        if (mine) counts[mine] += 1;
        setState({ ...state, counts, mine });
        setHint(null);
        setBusy(true);

        try {
            const res = await fetch(`/api/v1/news/${newsId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji: id }),
            });
            const data = await res.json();
            if (res.ok) setState(data);
            else {
                setState(prev);
                setHint(data.error ?? 'Не вдалося зберегти реакцію');
            }
        } catch {
            setState(prev);
            setHint('Немає зʼєднання — спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="mt-8 md:mt-10 pt-6 border-t border-secondary/70" aria-label="Реакції на новину" data-no-reveal>
            <p className="mb-3 font-plex text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary-deep">
                Ваша реакція
            </p>

            <div className="flex flex-wrap gap-2.5">
                {REACTIONS.map((r) => {
                    const active = state.mine === r.id;
                    const count = state.counts[r.id];
                    return (
                        <motion.button
                            key={r.id}
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => react(r.id)}
                            disabled={!loaded}
                            aria-pressed={active}
                            title={r.label}
                            aria-label={`${r.label}: ${count}`}
                            className={`inline-flex items-center gap-2 border px-3.5 py-2 transition-colors disabled:opacity-60 ${
                                active
                                    ? 'border-primary bg-primary text-background'
                                    : 'border-secondary/70 bg-secondary/[0.3] text-primary hover:border-primary'
                            }`}
                        >
                            <span className="text-2xl leading-none" aria-hidden>{r.emoji}</span>
                            <span className="min-w-[1ch] font-plex text-sm font-bold tabular-nums">{count}</span>
                        </motion.button>
                    );
                })}
            </div>

            {hint === 'login' ? (
                <p className="mt-3 text-sm text-primary/85">
                    Реакції можуть ставити лише зареєстровані користувачі.{' '}
                    <Link href={loginHref} className="font-semibold text-secondary-deep underline underline-offset-2">
                        Увійти
                    </Link>
                    {' або '}
                    <Link href="/auth/register" className="font-semibold text-secondary-deep underline underline-offset-2">
                        зареєструватися
                    </Link>
                </p>
            ) : hint ? (
                <p className="mt-3 text-sm text-red-700">{hint}</p>
            ) : null}
        </section>
    );
}
