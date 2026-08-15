import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/server';
import { ArrowLeft, Coins } from 'lucide-react';

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

    const { data: transactions, error } = await supabase
        .from('point_transactions')
        .select('id, category, points, explanation, coefficient, event_title, event_budget, created_at')
        .eq('target', 'student')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

    const total = (transactions ?? []).reduce((sum, t) => sum + t.points, 0);

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-3xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                    <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Історія нарахувань
                    </h1>
                    <div className="flex items-center gap-3 bg-primary/[0.03] border border-primary/10 rounded-2xl px-5 py-3">
                        <span className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                            <Coins size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50">
                                Разом
                            </p>
                            <p className="text-lg font-grotesk font-bold text-primary leading-none mt-0.5">
                                {total} <span className="text-sm font-normal text-primary/50">балів</span>
                            </p>
                        </div>
                    </div>
                </div>

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
                                        <span className="inline-block text-[11px] font-grotesk font-semibold uppercase tracking-wider text-secondary">
                                            {CATEGORY_LABELS[t.category as PointCategory] ?? t.category}
                                        </span>
                                        {t.event_title && (
                                            <span className="inline-block text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/45">
                                                · {t.event_title}
                                            </span>
                                        )}
                                        {t.coefficient && (
                                            <span
                                                title="Рівень залученості за п. 12.2.3.3 Статуту"
                                                className="inline-block rounded-full bg-accent/15 text-accent text-[11px] font-grotesk font-bold px-2 py-0.5"
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
                                    className={`shrink-0 font-grotesk font-bold text-lg ${
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
            </div>
        </main>
    );
}
