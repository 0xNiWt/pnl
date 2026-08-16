'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, EyeOff, Info, Search } from 'lucide-react';
import {
    NOTHING_HIDDEN,
    RATING_LABELS,
    visibleRatings,
    type RatingKind,
    type RatingVisibility,
} from '@/lib/ratings';

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

export type StudentRow = BaseRow & {
    student_id: string;
    full_name: string;
    class: string | null;
};

export type ClassRow = BaseRow & {
    class_name: string;
    students_count: number;
};

type Row = StudentRow | ClassRow;

function isStudent(row: Row): row is StudentRow {
    return 'student_id' in row;
}

export default function RatingBoard({
    students,
    classes,
    hidden = NOTHING_HIDDEN,
    canSeeHidden = false,
}: {
    students: StudentRow[];
    classes: ClassRow[];
    hidden?: RatingVisibility;
    canSeeHidden?: boolean;
}) {
    // Дані приходять уже порахованими з сервера, тож перемикання вкладок,
    // масштабу й пошук працюють миттєво — без жодного запиту.
    const available = useMemo(() => visibleRatings(hidden, canSeeHidden), [hidden, canSeeHidden]);

    const [scope, setScope] = useState<Scope>('student');
    const [rating, setRating] = useState<RatingKind>(available[0] ?? 'points');
    const [search, setSearch] = useState('');

    const rows = useMemo<Row[]>(() => {
        const source: Row[] = scope === 'student' ? students : classes;
        const query = search.trim().toLowerCase();

        const filtered = query
            ? source.filter((row) =>
                (isStudent(row) ? row.full_name : row.class_name).toLowerCase().includes(query)
            )
            : source;

        return [...filtered].sort((a, b) => {
            const diff = a.places[rating] - b.places[rating];
            if (diff !== 0) return diff;
            const an = isStudent(a) ? a.full_name : a.class_name;
            const bn = isStudent(b) ? b.full_name : b.class_name;
            return an.localeCompare(bn, 'uk');
        });
    }, [scope, rating, students, classes, search]);

    // У загальному рейтингу не показуємо колонки з місцями за прихованими
    // рейтингами — інакше приховане проглядалося б наскрізь.
    const overallColumns = useMemo(
        () =>
            (['academic', 'olympiad', 'points'] as const).filter(
                (kind) => canSeeHidden || !hidden[kind]
            ),
        [hidden, canSeeHidden]
    );

    if (available.length === 0) {
        return (
            <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-12">
                <div className="border border-primary/10 rounded-2xl bg-white/40 px-6 py-12 text-center">
                    <EyeOff size={22} className="mx-auto mb-3 text-primary/30" />
                    <p className="text-sm text-primary/55">
                        Рейтинги тимчасово приховані адміністрацією ліцею.
                    </p>
                </div>
            </section>
        );
    }

    const activeRating = available.includes(rating) ? rating : available[0];
    const colCount =
        activeRating === 'points'
            ? 9
            : activeRating === 'overall'
                ? 4 + overallColumns.length
                : 4;

    return (
        <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-12">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <button
                    onClick={() => setScope(scope === 'student' ? 'class' : 'student')}
                    className="inline-flex items-center gap-2 font-manrope font-semibold text-sm text-background bg-primary hover:bg-primary/90 transition-colors rounded-full px-4 py-2.5"
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

            <div className="flex flex-wrap gap-1.5 mb-3">
                {available.map((kind) => (
                    <button
                        key={kind}
                        onClick={() => setRating(kind)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-manrope font-semibold uppercase tracking-wide transition-colors ${activeRating === kind
                            ? 'bg-primary text-background border-primary'
                            : 'border-primary/15 text-primary/60 hover:bg-primary/5'
                            }`}
                    >
                        {RATING_LABELS[kind]}
                        {hidden[kind] && <EyeOff size={12} />}
                    </button>
                ))}
            </div>

            {hidden[activeRating] && canSeeHidden && (
                <p className="flex items-start gap-2 text-xs text-accent bg-accent/10 border border-accent/25 rounded-xl px-3.5 py-2.5 mb-3 max-w-2xl">
                    <EyeOff size={14} className="shrink-0 mt-0.5" />
                    Цей рейтинг приховано — його бачите тільки ви, адміністрація та модератори.
                </p>
            )}

            <p className="flex items-start gap-2 text-xs text-primary/50 mb-6 max-w-2xl">
                <Info size={14} className="shrink-0 mt-0.5 text-secondary" />
                {RATING_HINTS[activeRating]}
            </p>

            <div className="border border-primary/10 rounded-2xl overflow-x-auto bg-white/40">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-primary/5 text-left font-manrope text-xs uppercase tracking-wide text-primary/60">
                            <th className="px-4 py-3 w-14">№</th>
                            <th className="px-4 py-3">{scope === 'student' ? 'ПІБ' : 'Клас'}</th>
                            {scope === 'student' && <th className="px-4 py-3 w-20">Клас</th>}
                            {scope === 'class' && <th className="px-4 py-3 w-20 text-right">Учнів</th>}

                            {activeRating === 'points' &&
                                CATEGORY_ORDER.map((cat) => (
                                    <th key={cat} className="px-3 py-3 w-20 text-right">
                                        {CATEGORY_LABELS[cat]}
                                    </th>
                                ))}

                            {activeRating === 'overall' &&
                                overallColumns.map((kind) => (
                                    <th key={kind} className="px-3 py-3 w-24 text-right">
                                        {kind === 'academic' ? 'Навч.' : kind === 'olympiad' ? 'Олімп.' : 'Бали'}
                                    </th>
                                ))}

                            <th className="px-4 py-3 w-28 text-right">
                                {activeRating === 'points'
                                    ? 'Разом'
                                    : activeRating === 'academic'
                                        ? 'Середній бал'
                                        : activeRating === 'olympiad'
                                            ? 'Олімп. бали'
                                            : 'Σ місць'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-6 text-center text-primary/50">
                                    Нічого не знайдено
                                </td>
                            </tr>
                        )}

                        {rows.map((row) => {
                            const key = isStudent(row) ? row.student_id : row.class_name;
                            const name = isStudent(row) ? row.full_name : row.class_name;

                            return (
                                <tr key={key} className="border-t border-primary/10">
                                    <td className="px-4 py-3 text-primary/50">
                                        {row.places[activeRating]}
                                    </td>
                                    <td className="px-4 py-3 text-primary font-medium">{name}</td>

                                    {isStudent(row) ? (
                                        <td className="px-4 py-3 text-primary/50 text-xs">
                                            {row.class ?? '—'}
                                        </td>
                                    ) : (
                                        <td className="px-4 py-3 text-right text-primary/50 text-xs">
                                            {row.students_count}
                                        </td>
                                    )}

                                    {activeRating === 'points' &&
                                        CATEGORY_ORDER.map((cat) => (
                                            <td key={cat} className="px-3 py-3 text-right text-primary/70">
                                                {row.categories[cat]}
                                            </td>
                                        ))}

                                    {activeRating === 'overall' &&
                                        overallColumns.map((kind) => (
                                            <td key={kind} className="px-3 py-3 text-right text-primary/60">
                                                {row.places[kind]}
                                            </td>
                                        ))}

                                    <td className="px-4 py-3 text-right font-manrope font-semibold text-secondary">
                                        {activeRating === 'points' && row.total_points}
                                        {activeRating === 'academic' &&
                                            (row.academic_score === null
                                                ? '—'
                                                : row.academic_score.toFixed(2).replace('.', ','))}
                                        {activeRating === 'olympiad' && row.olympiad_points}
                                        {activeRating === 'overall' && row.overall_sum}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {activeRating === 'olympiad' && (
                <p className="text-xs text-primary/40 mt-3 max-w-2xl">
                    Шкала балів за етапи олімпіад і МАН у Статуті поки позначена як «ДОРОБИТИ»
                    (п. 10.7.6). Зараз діють тимчасові значення, які адміністрація може змінити
                    в кабінеті без зміни коду.
                </p>
            )}
        </section>
    );
}
