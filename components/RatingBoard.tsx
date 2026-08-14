'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowLeftRight, Search } from 'lucide-react';

type Scope = 'student' | 'class';
type View = 'points' | 'ranked';

type PointCategory = 'sport' | 'creative' | 'organizational' | 'intellectual' | 'volunteer';

const CATEGORY_LABELS: Record<PointCategory, string> = {
    sport: 'Спорт',
    creative: 'Творчість',
    organizational: 'Організ.',
    intellectual: 'Інтелект.',
    volunteer: 'Волонт.',
};

const CATEGORY_ORDER: PointCategory[] = [
    'sport',
    'creative',
    'organizational',
    'intellectual',
    'volunteer',
];

type CategoryPoints = Record<PointCategory, number>;

type StudentRow = {
    student_id: string;
    full_name: string;
    class: string | null;
    categories: CategoryPoints;
    total_points: number;
};

type ClassRow = {
    class_name: string;
    categories: CategoryPoints;
    total_points: number;
};

export default function RatingBoard() {
    const [scope, setScope] = useState<Scope>('student');
    const [view, setView] = useState<View>('points');
    const [search, setSearch] = useState('');
    const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
    const [classRows, setClassRows] = useState<ClassRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (currentScope: Scope, currentSearch: string) => {
        setLoading(true);
        const params = new URLSearchParams({ type: currentScope });
        if (currentSearch) params.set('search', currentSearch);

        const res = await fetch(`/api/v1/rating?${params.toString()}`);
        const json = await res.json();

        if (currentScope === 'student') {
            setStudentRows(json.data ?? []);
        } else {
            setClassRows(json.data ?? []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => load(scope, search), 250);
        return () => clearTimeout(timeout);
    }, [scope, search, load]);

    const rows = scope === 'student' ? studentRows : classRows;
    // У режимі "лише бали" показуємо 5 колонок категорій + разом.
    // У режимі "рейтинг з місцем" — тільки місце + загальна сума (бо рейтинг рахується по сумі).
    const colCount = view === 'points' ? (scope === 'student' ? 7 : 6) : 3;

    return (
        <section className="max-w-6xl mx-auto px-5 md:px-6 py-8 md:py-12">
            {/* Перемикач учні / класи */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <button
                    onClick={() => setScope(scope === 'student' ? 'class' : 'student')}
                    className="inline-flex items-center gap-2 font-grotesk font-semibold text-sm text-background bg-primary hover:bg-primary/90 transition-colors rounded-full px-4 py-2.5"
                >
                    <ArrowLeftRight size={15} />
                    {scope === 'student' ? 'Показати рейтинг класів' : 'Показати рейтинг учнів'}
                </button>

                <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={scope === 'student' ? 'Пошук за іменем...' : 'Пошук за класом...'}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-full border border-primary/15 bg-white/60 text-sm text-primary placeholder:text-primary/40 focus:outline-none focus:border-secondary"
                    />
                </div>
            </div>

            {/* Перемикач лише бали / рейтинг з місцем */}
            <div className="inline-flex rounded-full border border-primary/15 p-1 mb-6">
                <button
                    onClick={() => setView('points')}
                    className={`px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold uppercase tracking-wide transition-colors ${view === 'points' ? 'bg-primary text-background' : 'text-primary/60'
                        }`}
                >
                    Лише бали
                </button>
                <button
                    onClick={() => setView('ranked')}
                    className={`px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold uppercase tracking-wide transition-colors ${view === 'ranked' ? 'bg-primary text-background' : 'text-primary/60'
                        }`}
                >
                    Рейтинг (з місцем)
                </button>
            </div>

            <div className="border border-primary/10 rounded-2xl overflow-x-auto bg-white/40">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-primary/5 text-left font-grotesk text-xs uppercase tracking-wide text-primary/60">
                            {view === 'ranked' && <th className="px-4 py-3 w-14">№</th>}
                            <th className="px-4 py-3">{scope === 'student' ? 'ПІБ' : 'Клас'}</th>
                            {scope === 'student' && view === 'points' && (
                                <th className="px-4 py-3 w-20">Клас</th>
                            )}
                            {view === 'points' &&
                                CATEGORY_ORDER.map((cat) => (
                                    <th key={cat} className="px-3 py-3 w-20 text-right">
                                        {CATEGORY_LABELS[cat]}
                                    </th>
                                ))}
                            <th className="px-4 py-3 w-24 text-right">
                                {view === 'ranked' ? 'Σ місце' : 'Разом'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-6 text-center text-primary/50">
                                    Завантаження...
                                </td>
                            </tr>
                        )}

                        {!loading && rows.length === 0 && (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-6 text-center text-primary/50">
                                    Нічого не знайдено
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            scope === 'student' &&
                            studentRows.map((row, i) => (
                                <tr key={row.student_id} className="border-t border-primary/10">
                                    {view === 'ranked' && (
                                        <td className="px-4 py-3 text-primary/50">{i + 1}</td>
                                    )}
                                    <td className="px-4 py-3 text-primary font-medium">{row.full_name}</td>
                                    {view === 'points' && (
                                        <td className="px-4 py-3 text-primary/50 text-xs">{row.class ?? '—'}</td>
                                    )}
                                    {view === 'points' &&
                                        CATEGORY_ORDER.map((cat) => (
                                            <td key={cat} className="px-3 py-3 text-right text-primary/70">
                                                {row.categories[cat]}
                                            </td>
                                        ))}
                                    <td className="px-4 py-3 text-right font-grotesk font-semibold text-secondary">
                                        {view === 'ranked' ? `${i + 1} місце` : row.total_points}
                                    </td>
                                </tr>
                            ))}

                        {!loading &&
                            scope === 'class' &&
                            classRows.map((row, i) => (
                                <tr key={row.class_name} className="border-t border-primary/10">
                                    {view === 'ranked' && (
                                        <td className="px-4 py-3 text-primary/50">{i + 1}</td>
                                    )}
                                    <td className="px-4 py-3 text-primary font-medium">{row.class_name}</td>
                                    {view === 'points' &&
                                        CATEGORY_ORDER.map((cat) => (
                                            <td key={cat} className="px-3 py-3 text-right text-primary/70">
                                                {row.categories[cat]}
                                            </td>
                                        ))}
                                    <td className="px-4 py-3 text-right font-grotesk font-semibold text-secondary">
                                        {view === 'ranked' ? `${i + 1} місце` : row.total_points}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
