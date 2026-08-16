'use client';

import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { compareClasses, parallelOf, positionIdsMatching, positionLabel } from '@/lib/positions';

type Profile = {
    id: string;
    full_name: string | null;
    class: string | null;
    positions: string[] | null;
};

const NO_CLASS = 'Клас не вказано';

export default function ClassRoster({ profiles }: { profiles: Profile[] }) {
    const [query, setQuery] = useState('');

    // Посади, назви яких підходять під запит: «старост» → Староста,
    // Заступник старости. Пошук працює за іменем, класом і посадою.
    const queryPositions = useMemo(() => new Set(positionIdsMatching(query)), [query]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return profiles;

        return profiles.filter(
            (p) =>
                (p.full_name ?? '').toLowerCase().includes(q) ||
                (p.class ?? '').toLowerCase().includes(q) ||
                (p.positions ?? []).some((id) => queryPositions.has(id))
        );
    }, [profiles, query, queryPositions]);

    // Групуємо за класами. Учні без класу — окремою групою в кінці.
    const groups = useMemo(() => {
        const map = new Map<string, Profile[]>();

        for (const p of filtered) {
            const key = p.class || NO_CLASS;
            const list = map.get(key);
            if (list) list.push(p);
            else map.set(key, [p]);
        }

        return Array.from(map.entries())
            .map(([className, students]) => ({
                className,
                students: students.sort((a, b) =>
                    (a.full_name ?? '').localeCompare(b.full_name ?? '', 'uk')
                ),
            }))
            .sort((a, b) => {
                if (a.className === NO_CLASS) return 1;
                if (b.className === NO_CLASS) return -1;
                return compareClasses(a.className, b.className);
            });
    }, [filtered]);

    const withPositions = useMemo(
        () => filtered.filter((p) => (p.positions ?? []).length > 0).length,
        [filtered]
    );

    return (
        <div className="flex flex-col gap-4">

            {/* Пошук і коротка статистика */}
            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
                <div className="relative">
                    <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/30"
                    />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Пошук за іменем, класом або посадою: «10-А», «староста»..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-primary/50">
                    <span>
                        Учнів: <b className="text-primary">{filtered.length}</b>
                        {filtered.length !== profiles.length && ` з ${profiles.length}`}
                    </span>
                    <span>
                        Класів: <b className="text-primary">{groups.length}</b>
                    </span>
                    <span>
                        З посадами: <b className="text-primary">{withPositions}</b>
                    </span>
                    {query && (
                        <button onClick={() => setQuery('')} className="underline hover:text-primary">
                            Скинути пошук
                        </button>
                    )}
                </div>
            </div>

            {groups.length === 0 ? (
                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-10 text-center">
                    <p className="text-sm text-primary/40">За таким запитом нікого не знайдено.</p>
                </div>
            ) : (
                groups.map((group) => (
                    <div
                        key={group.className}
                        className="bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-primary/10 bg-primary/[0.03]">
                            <div className="flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
                                    <Users size={15} />
                                </span>
                                <div>
                                    <p className="font-manrope font-bold text-sm text-primary leading-none">
                                        {group.className}
                                    </p>
                                    {parallelOf(group.className) && (
                                        <p className="text-[11px] text-primary/40 mt-1">
                                            {parallelOf(group.className)} паралель
                                        </p>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-primary/40 shrink-0">
                                {group.students.length} {plural(group.students.length)}
                            </span>
                        </div>

                        <div className="flex flex-col divide-y divide-primary/10">
                            {group.students.map((student) => {
                                const positions = student.positions ?? [];

                                return (
                                    <div
                                        key={student.id}
                                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3"
                                    >
                                        <p className="text-sm font-medium text-primary">
                                            {student.full_name || 'Без імені'}
                                        </p>

                                        <div className="flex flex-wrap gap-1.5">
                                            {positions.length === 0 ? (
                                                <span className="text-xs text-primary/30">без посади</span>
                                            ) : (
                                                positions.map((id) => (
                                                    <span
                                                        key={id}
                                                        className="inline-block bg-secondary/15 text-secondary text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                                                    >
                                                        {positionLabel(id)}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// 1 учень, 2-4 учні, 5+ учнів
function plural(count: number): string {
    const mod100 = count % 100;
    const mod10 = count % 10;

    if (mod100 >= 11 && mod100 <= 14) return 'учнів';
    if (mod10 === 1) return 'учень';
    if (mod10 >= 2 && mod10 <= 4) return 'учні';
    return 'учнів';
}
