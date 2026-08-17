import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/server';
import { olympiadLevelLabel, olympiadPlaceLabel } from '@/lib/ratings';
import { ArrowLeft, Coins, Trophy } from 'lucide-react';

type PointCategory = 'sport' | 'creative' | 'organizational' | 'intellectual' | 'volunteer';

const CATEGORY_LABELS: Record<PointCategory, string> = {
    sport: 'Спортивна',
    creative: 'Творча',
    organizational: 'Організаційна',
    intellectual: 'Інтелектуальна',
    volunteer: 'Волонтерська',
};

export default async function MyPointsHistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const [transactionsRes, olympiadsRes] = await Promise.all([
        supabase
            .from('point_transactions')
            .select('id, category, points, explanation, coefficient, event_title, event_budget, created_at')
            .eq('target', 'student')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false }),
        // Олімпіадні здобутки — окремий рейтинг за п. 10.7.2 Статуту,
        // тому й бали за них рахуються окремо від балів активності.
        supabase
            .from('olympiad_results')
            .select('id, subject, level, place, points, created_at')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false }),
    ]);

    const { data: transactions, error } = transactionsRes;
    const olympiads = olympiadsRes.data ?? [];

    const total = (transactions ?? []).reduce((sum, t) => sum + t.points, 0);
    const olympiadTotal = olympiads.reduce((sum, o) => sum + (o.points ?? 0), 0);

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-7xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Мої бали та здобутки
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-3 bg-primary/[0.03] border border-primary/10 rounded-2xl px-5 py-3">
                            <span className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                                <Coins size={18} />
                            </span>
                            <div>
                                <p className="text-[11px] font-manrope font-semibold uppercase tracking-wider text-primary/50">
                                    Активність
                                </p>
                                <p className="text-lg font-manrope font-bold text-primary leading-none mt-0.5">
                                    {total} <span className="text-sm font-normal text-primary/50">балів</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-primary/[0.03] border border-primary/10 rounded-2xl px-5 py-3">
                            <span className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                                <Trophy size={18} />
                            </span>
                            <div>
                                <p className="text-[11px] font-manrope font-semibold uppercase tracking-wider text-primary/50">
                                    Олімпіади
                                </p>
                                <p className="text-lg font-manrope font-bold text-primary leading-none mt-0.5">
                                    {olympiadTotal} <span className="text-sm font-normal text-primary/50">балів</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="font-manrope font-bold text-lg text-primary mb-4">
                    Бали активності
                </h2>

                {error && (
                    <p className="text-sm text-red-500 mb-6">
                        Помилка завантаження: {error.message}
                    </p>
                )}

                {!error && (!transactions || transactions.length === 0) && (
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-8 text-center">
                        <p className="text-sm text-primary/50">
                            Поки що немає жодного нарахування балів.
                        </p>
                    </div>
                )}

                {!error && transactions && transactions.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {transactions.map((t) => (
                            <div
                                key={t.id}
                                className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5 flex items-start justify-between gap-4"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className="inline-block text-[11px] font-manrope font-semibold uppercase tracking-wider text-secondary">
                                            {CATEGORY_LABELS[t.category as PointCategory] ?? t.category}
                                        </span>
                                        {t.event_title && (
                                            <span className="inline-block text-[11px] font-manrope font-semibold uppercase tracking-wider text-primary/45">
                                                · {t.event_title}
                                            </span>
                                        )}
                                        {t.coefficient && (
                                            <span
                                                title="Рівень залученості за п. 12.2.3.3 Статуту"
                                                className="inline-block rounded-full bg-accent/15 text-accent text-[11px] font-manrope font-bold px-2 py-0.5"
                                            >
                                                К = {t.coefficient}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-primary">
                                        {t.explanation}
                                    </p>
                                    {t.event_budget !== null && t.event_budget !== undefined && (
                                        <p className="text-xs text-primary/40 mt-1">
                                            Із загального бюджету заходу — {t.event_budget} балів
                                        </p>
                                    )}
                                    <p className="text-xs text-primary/40 mt-1.5">
                                        {new Date(t.created_at).toLocaleDateString('uk-UA', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div
                                    className={`shrink-0 font-manrope font-bold text-lg ${
                                        t.points >= 0 ? 'text-accent' : 'text-red-500'
                                    }`}
                                >
                                    {t.points >= 0 ? '+' : ''}
                                    {t.points}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Олімпіадний рейтинг (п. 10.7.2 Статуту) — окремий від балів
                    активності, тому й показуємо його окремим блоком. */}
                <h2
                    id="olympiads"
                    className="font-manrope font-bold text-lg text-primary mt-12 mb-1 scroll-mt-8"
                >
                    Олімпіадні здобутки
                </h2>
                <p className="text-sm text-primary/50 mb-4">
                    За що нараховані олімпіадні бали: етап, місце й скільки це дало за
                    чинною шкалою.
                </p>

                {olympiads.length === 0 ? (
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-8 text-center">
                        <p className="text-sm text-primary/50">
                            Здобутків на олімпіадах і МАН поки не внесено.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {olympiads.map((o) => (
                            <div
                                key={o.id}
                                className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5 flex items-start justify-between gap-4"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className="inline-block text-[11px] font-manrope font-semibold uppercase tracking-wider text-secondary">
                                            {olympiadLevelLabel(o.level)}
                                        </span>
                                        <span className="inline-block rounded-full bg-accent/15 text-accent text-[11px] font-manrope font-bold px-2 py-0.5">
                                            {olympiadPlaceLabel(o.place)}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-primary">{o.subject}</p>
                                    <p className="text-xs text-primary/40 mt-1.5">
                                        {new Date(o.created_at).toLocaleDateString('uk-UA', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div className="shrink-0 font-manrope font-bold text-lg text-secondary">
                                    +{o.points ?? 0}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-primary/40 mt-4 max-w-2xl">
                    Бали за кожен здобуток зафіксовані на момент внесення: якщо шкалу
                    (п. 10.7.6 Статуту) згодом змінять, уже нараховане не перерахується.
                </p>
            </div>
        </main>
    );
}
