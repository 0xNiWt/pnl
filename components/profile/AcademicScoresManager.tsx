'use client';

import { useMemo, useState } from 'react';
import { Check, Loader2, Search, TriangleAlert, X } from 'lucide-react';
import { compareClasses, parallelOf } from '@/lib/positions';
import { averageOf } from '@/lib/ratings';

type Profile = {
    id: string;
    full_name: string | null;
    class: string | null;
    academic_score: number | string | null;
};

const ALL = 'all';

export default function AcademicScoresManager({
    initialProfiles,
}: {
    initialProfiles: Profile[];
}) {
    // Значення полів тримаємо рядками — щоб можна було спокійно вводити
    // «10,» на шляху до «10,5» і поле не стрибало.
    const [drafts, setDrafts] = useState<Record<string, string>>(() => {
        const start: Record<string, string> = {};
        for (const p of initialProfiles) {
            start[p.id] = p.academic_score === null ? '' : String(p.academic_score).replace('.', ',');
        }
        return start;
    });

    const [saved, setSaved] = useState<Record<string, number | null>>(() => {
        const start: Record<string, number | null> = {};
        for (const p of initialProfiles) {
            start[p.id] = p.academic_score === null ? null : Number(p.academic_score);
        }
        return start;
    });

    const [query, setQuery] = useState('');
    const [parallel, setParallel] = useState(ALL);
    const [className, setClassName] = useState(ALL);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [okId, setOkId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parallels = useMemo(() => {
        const set = new Set<string>();
        for (const p of initialProfiles) {
            const par = parallelOf(p.class);
            if (par) set.add(par);
        }
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [initialProfiles]);

    const classes = useMemo(() => {
        const set = new Set<string>();
        for (const p of initialProfiles) {
            if (!p.class) continue;
            if (parallel !== ALL && parallelOf(p.class) !== parallel) continue;
            set.add(p.class);
        }
        return Array.from(set).sort(compareClasses);
    }, [initialProfiles, parallel]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return initialProfiles.filter((p) => {
            if (q && !(p.full_name ?? '').toLowerCase().includes(q)) return false;
            if (parallel !== ALL && parallelOf(p.class) !== parallel) return false;
            if (className !== ALL && p.class !== className) return false;
            return true;
        });
    }, [initialProfiles, query, parallel, className]);

    const filledCount = useMemo(
        () => filtered.filter((p) => saved[p.id] !== null && saved[p.id] !== undefined).length,
        [filtered, saved]
    );

    const average = useMemo(
        () => averageOf(filtered.map((p) => saved[p.id] ?? null)),
        [filtered, saved]
    );

    async function save(profileId: string) {
        const raw = (drafts[profileId] ?? '').trim().replace(',', '.');
        const previous = saved[profileId] ?? null;

        // Порожнє поле = прибрати оцінку.
        const value = raw === '' ? null : Number(raw);

        if (value !== null && (!Number.isFinite(value) || value < 0 || value > 12)) {
            setError('Середній бал має бути числом від 0 до 12');
            setDrafts({ ...drafts, [profileId]: previous === null ? '' : String(previous).replace('.', ',') });
            return;
        }

        // Нічого не змінилося — не смикаємо сервер.
        if (value === previous) return;

        setSavingId(profileId);
        setError(null);

        try {
            const res = await fetch('/api/v1/rating/academic', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: profileId, score: value }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти');
                return;
            }

            const stored = data.score === null || data.score === undefined ? null : Number(data.score);
            setSaved({ ...saved, [profileId]: stored });
            setDrafts({
                ...drafts,
                [profileId]: stored === null ? '' : String(stored).replace('.', ','),
            });
            setOkId(profileId);
            setTimeout(() => setOkId((current) => (current === profileId ? null : current)), 1500);
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setSavingId(null);
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

            {/* Фільтри */}
            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/30" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Пошук за іменем..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                    <select
                        value={parallel}
                        onChange={(e) => {
                            setParallel(e.target.value);
                            setClassName(ALL);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm"
                    >
                        <option value={ALL}>Усі паралелі</option>
                        {parallels.map((p) => (
                            <option key={p} value={p}>
                                {p} клас
                            </option>
                        ))}
                    </select>

                    <select
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm"
                    >
                        <option value={ALL}>Усі класи</option>
                        {classes.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-primary/50">
                    <span>
                        Учнів: <b className="text-primary">{filtered.length}</b>
                    </span>
                    <span>
                        Заповнено: <b className="text-primary">{filledCount}</b>
                    </span>
                    <span>
                        Середнє по списку:{' '}
                        <b className="text-primary">
                            {average === null ? '—' : average.toFixed(2).replace('.', ',')}
                        </b>
                    </span>
                </div>
            </div>

            {/* Список */}
            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden">
                {filtered.length === 0 ? (
                    <p className="px-6 py-10 text-sm text-primary/40 text-center">
                        За такими умовами нікого не знайдено.
                    </p>
                ) : (
                    <div className="flex flex-col divide-y divide-primary/10">
                        {filtered.map((p) => (
                            <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-primary truncate">
                                        {p.full_name || 'Без імені'}
                                    </p>
                                    <p className="text-xs text-primary/40 mt-0.5">
                                        {p.class || 'Клас не вказано'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <input
                                        value={drafts[p.id] ?? ''}
                                        onChange={(e) => setDrafts({ ...drafts, [p.id]: e.target.value })}
                                        onBlur={() => save(p.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.currentTarget.blur();
                                        }}
                                        inputMode="decimal"
                                        placeholder="—"
                                        className="w-24 px-3 py-2 rounded-lg border border-primary/15 bg-white text-sm text-right focus:outline-none focus:border-secondary"
                                    />

                                    <span className="w-5 text-secondary">
                                        {savingId === p.id && <Loader2 size={15} className="animate-spin" />}
                                        {okId === p.id && savingId !== p.id && <Check size={15} />}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-xs text-primary/40 px-1">
                Порожнє поле означає «оцінку ще не внесено». Такі учні опиняються в кінці
                навчального рейтингу, але не заважають рахувати місця решті.
            </p>
        </div>
    );
}
