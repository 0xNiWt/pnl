'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react';
import {
    RATING_KINDS,
    RATING_LABELS,
    type RatingKind,
    type RatingVisibility,
} from '@/lib/ratings';

const RATING_NOTES: Record<RatingKind, string> = {
    points: 'Таблиця балів за п\'ятьма категоріями активності.',
    academic: 'Місця за середнім навчальним балом.',
    olympiad: 'Місця за здобутками на олімпіадах і МАН.',
    overall: 'Підсумкова сума місць за трьома базовими рейтингами.',
};

export default function RatingVisibilityManager({ initial }: { initial: RatingVisibility }) {
    const [hidden, setHidden] = useState<RatingVisibility>(initial);
    const [busy, setBusy] = useState<RatingKind | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function toggle(kind: RatingKind) {
        const next = !hidden[kind];
        setBusy(kind);
        setError(null);

        try {
            const res = await fetch('/api/v1/rating/visibility', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kind, hidden: next }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти');
                return;
            }

            setHidden((prev) => ({ ...prev, [kind]: next }));
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {RATING_KINDS.map((kind) => {
                    const isHidden = hidden[kind];

                    return (
                        <div
                            key={kind}
                            className="flex items-center justify-between gap-4 bg-primary/[0.02] border border-primary/10 rounded-2xl px-5 py-4"
                        >
                            <div className="min-w-0">
                                <p className="flex items-center gap-2 font-manrope font-bold text-primary text-sm">
                                    {RATING_LABELS[kind]}
                                    {isHidden && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/15 px-2 py-0.5 rounded-full">
                                            <EyeOff size={10} />
                                            Приховано
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-primary/50 mt-1">{RATING_NOTES[kind]}</p>
                            </div>

                            <button
                                onClick={() => toggle(kind)}
                                disabled={busy !== null}
                                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-manrope font-semibold transition-colors disabled:opacity-50 ${isHidden
                                    ? 'bg-primary text-background hover:bg-primary/90'
                                    : 'bg-primary/5 text-primary/70 hover:bg-primary/10'
                                    }`}
                            >
                                {busy === kind ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : isHidden ? (
                                    <Eye size={15} />
                                ) : (
                                    <EyeOff size={15} />
                                )}
                                {isHidden ? 'Показати' : 'Приховати'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-primary/45 max-w-2xl">
                Прихований рейтинг зникає зі сторінки «Рейтинг» і з блоку «Мій рейтинг» у
                кабінеті. Адміністрація та модератори бачать його далі — з позначкою
                «приховано». Підрахунок не зупиняється: загальний рейтинг за п. 10.7.4
                Статуту й далі складається з усіх трьох базових місць.
            </p>
        </div>
    );
}
