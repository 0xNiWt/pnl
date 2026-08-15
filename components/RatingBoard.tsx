'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowLeftRight, Search, Info } from 'lucide-react';
import { RATING_LABELS, type RatingKind } from '@/lib/ratings';

type Scope = 'student' | 'class';

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

const RATING_ORDER: RatingKind[] = ['points', 'academic', 'olympiad', 'overall'];

const RATING_HINTS: Record<RatingKind, string> = {
    points: 'Сума балів за п\'ятьма категоріями активності (п. 10.7.2 Статуту).',
    academic: 'За середнім навчальним балом за підсумками семестру (п. 10.7.2).',
    olympiad: 'За сумою здобутків на предметних олімпіадах та МАН (п. 10.7.2).',
    overall:
        'Сума місць за трьома попередніми рейтингами. Найменша сума — найвище місце (пп. 10.7.4, 10.11.5).',
};

type CategoryPoints = Record<PointCategory, number>;

type Places = { points: number; academic: number; olympiad: number; overall: number };

type BaseRow = {
    categories: CategoryPoints;
    total_points: number;
    academic_score: number | null;
    olympiad_points: number;
    places: Places;
    overall_sum: number;
};

type StudentRow = BaseRow & {
    student_id: string;
    full_name: string;
    class: string | null;
};

type ClassRow = BaseRow & {
    class_name: string;
    students_count: number;
};

type Row = StudentRow | ClassRow;

function isStudent(row: Row): row is StudentRow {
    return 'student_id' in row;
}

export default function RatingBoard() {
    const [scope, setScope] = useState<Scope>('student');
    const [rating, setRating] = useState<RatingKind>('points');
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

    // Місця приходять з сервера порахованими по всьому ліцею —
    // тут лише сортуємо за обраним рейтингом.
    const rows = useMemo<Row[]>(() => {
        const source: Row[] = scope === 'student' ? studentRows : classRows;
        return [...source].sort((a, b) => {
            const diff = a.places[rating] - b.places[rating];
            if (diff !== 0) return diff;
            const an = isStudent(a) ? a.full_name : a.class_name;
            const bn = isStudent(b) ? b.full_name : b.class_name;
            return an.localeCompare(bn, 'uk');
        });
    }, [scope, rating, studentRows, classRows]);

    // Скільки колонок займає таблиця — потрібно для рядка «Завантаження...».
    // № + назва + (клас або к-сть учнів) = 3, далі залежить від рейтингу.
    const colCount = rating === 'points' ? 9 : rating === 'overall' ? 7 : 4;

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

            {/* Чотири рейтинги за пп. 10.7 та 10.11 Статуту */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {RATING_ORDER.map((kind) => (
                    <button
                        key={kind}
                        onClick={() => setRating(kind)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-grotesk font-semibold uppercase tracking-wide transition-colors ${rating === kind
                            ? 'bg-primary text-background border-primary'
                            : 'border-primary/15 text-primary/60 hover:bg-primary/5'
                            }`}
                    >
                        {RATING_LABELS[kind]}
                    </button>
                ))}
            </div>

            <p className="flex items-start gap-2 text-xs text-primary/50 mb-6 max-w-2xl">
                <Info size={14} className="shrink-0 mt-0.5 text-secondary" />
                {RATING_HINTS[rating]}
            </p>

            <div className="border border-primary/10 rounded-2xl overflow-x-auto bg-white/40">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-primary/5 text-left font-grotesk text-xs uppercase tracking-wide text-primary/60">
                            <th className="px-4 py-3 w-14">№</th>
                            <th className="px-4 py-3">{scope === 'student' ? 'ПІБ' : 'Клас'}</th>
                            {scope === 'student' && <th className="px-4 py-3 w-20">Клас</th>}
                            {scope === 'class' && <th className="px-4 py-3 w-20 text-right">Учнів</th>}

                            {rating === 'points' &&
                                CATEGORY_ORDER.map((cat) => (
                                    <th key={cat} className="px-3 py-3 w-20 text-right">
                                        {CATEGORY_LABELS[cat]}
                                    </th>
                                ))}

                            {rating === 'overall' && (
                                <>
                                    <th className="px-3 py-3 w-24 text-right">Навч.</th>
                                    <th className="px-3 py-3 w-24 text-right">Олімп.</th>
                                    <th className="px-3 py-3 w-24 text-right">Бали</th>
                                </>
                            )}

                            <th className="px-4 py-3 w-28 text-right">
                                {rating === 'points'
                                    ? 'Разом'
                                    : rating === 'academic'
                                        ? 'Середній бал'
                                        : rating === 'olympiad'
                                            ? 'Олімп. бали'
                                            : 'Σ місць'}
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
                            rows.map((row) => {
                                const key = isStudent(row) ? row.student_id : row.class_name;
                                const name = isStudent(row) ? row.full_name : row.class_name;

                                return (
                                    <tr key={key} className="border-t border-primary/10">
                                        <td className="px-4 py-3 text-primary/50">
                                            {row.places[rating]}
                                        </td>
                                        <td className="px-4 py-3 text-primary font-medium">{name}</td>

                                        {isStudent(row) && (
                                            <td className="px-4 py-3 text-primary/50 text-xs">
                                                {row.class ?? '—'}
                                            </td>
                                        )}
                                        {!isStudent(row) && (
                                            <td className="px-4 py-3 text-right text-primary/50 text-xs">
                                                {row.students_count}
                                            </td>
                                        )}

                                        {rating === 'points' &&
                                            CATEGORY_ORDER.map((cat) => (
                                                <td key={cat} className="px-3 py-3 text-right text-primary/70">
                                                    {row.categories[cat]}
                                                </td>
                                            ))}

                                        {rating === 'overall' && (
                                            <>
                                                <td className="px-3 py-3 text-right text-primary/60">
                                                    {row.places.academic}
                                                </td>
                                                <td className="px-3 py-3 text-right text-primary/60">
                                                    {row.places.olympiad}
                                                </td>
                                                <td className="px-3 py-3 text-right text-primary/60">
                                                    {row.places.points}
                                                </td>
                                            </>
                                        )}

                                        <td className="px-4 py-3 text-right font-grotesk font-semibold text-secondary">
                                            {rating === 'points' && row.total_points}
                                            {rating === 'academic' &&
                                                (row.academic_score === null
                                                    ? '—'
                                                    : row.academic_score.toFixed(2).replace('.', ','))}
                                            {rating === 'olympiad' && row.olympiad_points}
                                            {rating === 'overall' && row.overall_sum}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {rating === 'olympiad' && (
                <p className="text-xs text-primary/40 mt-3 max-w-2xl">
                    Шкала балів за етапи олімпіад і МАН у Статуті поки позначена як «ДОРОБИТИ»
                    (п. 10.7.6). Зараз діють тимчасові значення, які адміністрація може змінити
                    в кабінеті без зміни коду.
                </p>
            )}
        </section>
    );
}
