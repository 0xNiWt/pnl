'use client';

import { useMemo, useState } from 'react';
import { Check, Loader2, Plus, Search, TriangleAlert, Trophy, X } from 'lucide-react';
import {
    OLYMPIAD_LEVELS,
    OLYMPIAD_PLACES,
    olympiadLevelLabel,
    olympiadPlaceLabel,
} from '@/lib/ratings';

type Profile = { id: string; full_name: string | null; class: string | null };

type ScaleRow = { level: string; place: number; points: number };

type Result = {
    id: string;
    student_id: string;
    subject: string;
    level: string;
    place: number;
    points: number;
    created_at: string;
};

export default function OlympiadsManager({
    initialProfiles,
    initialScale,
    initialResults,
}: {
    initialProfiles: Profile[];
    initialScale: ScaleRow[];
    initialResults: Result[];
}) {
    const [results, setResults] = useState<Result[]>(initialResults);
    const [scale, setScale] = useState<ScaleRow[]>(initialScale);

    // Форма додавання
    const [studentQuery, setStudentQuery] = useState('');
    const [student, setStudent] = useState<Profile | null>(null);
    const [subject, setSubject] = useState('');
    const [level, setLevel] = useState(OLYMPIAD_LEVELS[0].id);
    const [place, setPlace] = useState<number>(1);
    const [customPoints, setCustomPoints] = useState('');

    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savingCell, setSavingCell] = useState<string | null>(null);
    const [okCell, setOkCell] = useState<string | null>(null);

    const profileById = useMemo(
        () => new Map(initialProfiles.map((p) => [p.id, p])),
        [initialProfiles]
    );

    const suggestions = useMemo(() => {
        const q = studentQuery.trim().toLowerCase();
        if (!q) return [];
        return initialProfiles
            .filter((p) => (p.full_name ?? '').toLowerCase().includes(q))
            .slice(0, 8);
    }, [initialProfiles, studentQuery]);

    function scalePoints(levelId: string, placeValue: number): number {
        return scale.find((s) => s.level === levelId && s.place === placeValue)?.points ?? 0;
    }

    // Скільки балів отримає учень: або вручну, або зі шкали.
    const previewPoints = customPoints.trim()
        ? Number(customPoints.replace(',', '.'))
        : scalePoints(level, place);

    // Сума балів по кожному учню — щоб одразу бачити внесок у рейтинг.
    const totalsByStudent = useMemo(() => {
        const map = new Map<string, number>();
        for (const r of results) {
            map.set(r.student_id, (map.get(r.student_id) ?? 0) + r.points);
        }
        return map;
    }, [results]);

    async function addResult() {
        if (!student) {
            setError('Обери учня');
            return;
        }
        if (!subject.trim()) {
            setError('Вкажи предмет або тему роботи');
            return;
        }

        setAdding(true);
        setError(null);

        try {
            const res = await fetch('/api/v1/rating/olympiads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: student.id,
                    subject,
                    level,
                    place,
                    points: customPoints.trim() ? previewPoints : undefined,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося додати здобуток');
                return;
            }

            setResults([data.data, ...results]);
            setSubject('');
            setCustomPoints('');
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setAdding(false);
        }
    }

    async function removeResult(id: string) {
        setError(null);
        const res = await fetch(`/api/v1/rating/olympiads?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? 'Не вдалося видалити');
            return;
        }
        setResults(results.filter((r) => r.id !== id));
    }

    async function saveScale(levelId: string, placeValue: number, raw: string) {
        const points = Number(raw.replace(',', '.'));
        if (!Number.isFinite(points)) {
            setError('Бали мають бути числом');
            return;
        }
        if (points === scalePoints(levelId, placeValue)) return;

        const cell = `${levelId}-${placeValue}`;
        setSavingCell(cell);
        setError(null);

        try {
            const res = await fetch('/api/v1/rating/olympiads/scale', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level: levelId, place: placeValue, points }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти шкалу');
                return;
            }

            setScale((prev) => {
                const rest = prev.filter((s) => !(s.level === levelId && s.place === placeValue));
                return [...rest, { level: levelId, place: placeValue, points: Math.round(points) }];
            });
            setOkCell(cell);
            setTimeout(() => setOkCell((c) => (c === cell ? null : c)), 1500);
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setSavingCell(null);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto shrink-0">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Додати здобуток */}
            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5 flex flex-col gap-4">
                <h2 className="font-grotesk font-bold text-sm text-primary">Додати здобуток</h2>

                <div>
                    <label className="block text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50 mb-1.5">
                        Учень
                    </label>

                    {student ? (
                        <div className="inline-flex items-center gap-2 bg-secondary/10 text-primary text-sm font-medium px-3.5 py-2 rounded-xl">
                            {student.full_name ?? 'Без імені'}
                            <span className="text-primary/40 text-xs">{student.class ?? '—'}</span>
                            <button
                                onClick={() => {
                                    setStudent(null);
                                    setStudentQuery('');
                                }}
                                className="text-primary/40 hover:text-accent"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/30" />
                            <input
                                value={studentQuery}
                                onChange={(e) => setStudentQuery(e.target.value)}
                                placeholder="Почни вводити ім'я учня..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                            />
                            {suggestions.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-primary/10 rounded-xl shadow-lg overflow-hidden">
                                    {suggestions.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setStudent(p);
                                                setStudentQuery('');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 flex justify-between"
                                        >
                                            <span>{p.full_name ?? 'Без імені'}</span>
                                            <span className="text-primary/40">{p.class}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50 mb-1.5">
                            Предмет або тема
                        </label>
                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Математика, Історія України..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm focus:outline-none focus:border-secondary"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50 mb-1.5">
                            Етап
                        </label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm"
                        >
                            {OLYMPIAD_LEVELS.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50 mb-1.5">
                            Результат
                        </label>
                        <select
                            value={place}
                            onChange={(e) => setPlace(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm"
                        >
                            {OLYMPIAD_PLACES.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50 mb-1.5">
                            Бали (порожньо — зі шкали)
                        </label>
                        <input
                            value={customPoints}
                            onChange={(e) => setCustomPoints(e.target.value)}
                            inputMode="numeric"
                            placeholder={String(scalePoints(level, place))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm focus:outline-none focus:border-secondary"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={addResult}
                        disabled={adding}
                        className="inline-flex items-center gap-2 bg-primary text-background font-grotesk font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                        Додати
                    </button>
                    <span className="text-xs text-primary/50">
                        Нарахується <b className="text-primary">{Number.isFinite(previewPoints) ? previewPoints : 0}</b> балів
                    </span>
                </div>
            </div>

            {/* Список здобутків */}
            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-primary/10 bg-primary/[0.03] flex items-center gap-2">
                    <Trophy size={15} className="text-secondary" />
                    <p className="font-grotesk font-bold text-sm text-primary">
                        Здобутки ({results.length})
                    </p>
                </div>

                {results.length === 0 ? (
                    <p className="px-6 py-10 text-sm text-primary/40 text-center">
                        Поки що жодного здобутку не внесено.
                    </p>
                ) : (
                    <div className="flex flex-col divide-y divide-primary/10">
                        {results.map((r) => {
                            const profile = profileById.get(r.student_id);
                            return (
                                <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-primary truncate">
                                            {profile?.full_name ?? 'Невідомий учень'}
                                            <span className="ml-2 text-xs font-normal text-primary/40">
                                                {profile?.class ?? ''}
                                            </span>
                                        </p>
                                        <p className="text-xs text-primary/50 mt-0.5">
                                            {r.subject} · {olympiadLevelLabel(r.level)} ·{' '}
                                            {olympiadPlaceLabel(r.place)}
                                        </p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="font-grotesk font-bold text-secondary">+{r.points}</p>
                                        <p className="text-[11px] text-primary/35">
                                            разом {totalsByStudent.get(r.student_id) ?? 0}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => removeResult(r.id)}
                                        className="text-primary/25 hover:text-accent shrink-0"
                                        aria-label="Видалити здобуток"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Шкала */}
            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-primary/10 bg-primary/[0.03]">
                    <p className="font-grotesk font-bold text-sm text-primary">Шкала балів</p>
                    <p className="text-xs text-primary/40 mt-0.5">
                        П. 10.7.6 Статуту поки позначений як «ДОРОБИТИ» — це тимчасові значення.
                        Зміна шкали не перераховує вже внесені здобутки.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-primary/[0.02] text-left font-grotesk text-[11px] uppercase tracking-wider text-primary/50">
                                <th className="px-5 py-2.5">Етап</th>
                                {OLYMPIAD_PLACES.map((p) => (
                                    <th key={p.value} className="px-3 py-2.5 w-28 text-right">
                                        {p.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {OLYMPIAD_LEVELS.map((l) => (
                                <tr key={l.id} className="border-t border-primary/10">
                                    <td className="px-5 py-2.5 text-primary font-medium">{l.label}</td>
                                    {OLYMPIAD_PLACES.map((p) => {
                                        const cell = `${l.id}-${p.value}`;
                                        return (
                                            <td key={p.value} className="px-3 py-2 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <span className="w-4 text-secondary">
                                                        {savingCell === cell && (
                                                            <Loader2 size={13} className="animate-spin" />
                                                        )}
                                                        {okCell === cell && savingCell !== cell && (
                                                            <Check size={13} />
                                                        )}
                                                    </span>
                                                    <input
                                                        defaultValue={scalePoints(l.id, p.value)}
                                                        onBlur={(e) => saveScale(l.id, p.value, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') e.currentTarget.blur();
                                                        }}
                                                        inputMode="numeric"
                                                        className="w-16 px-2 py-1.5 rounded-lg border border-primary/15 bg-white text-sm text-right focus:outline-none focus:border-secondary"
                                                    />
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
