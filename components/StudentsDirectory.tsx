'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, TriangleAlert, X } from 'lucide-react';
import {
    POSITIONS,
    POSITION_SCOPES,
    compareClasses,
    isLyceumPosition,
    parallelOf,
    positionIdsMatching,
    positionLabel,
    positionsByScope,
    type PositionScope,
} from '@/lib/positions';

type Profile = {
    id: string;
    full_name: string | null;
    class: string | null;
    roles: string[] | null;
    positions: string[] | null;
};

type Tab = 'students' | 'positions';

const ALL = 'all';
const NONE = 'none';

export default function StudentsDirectory({ initialProfiles }: { initialProfiles: Profile[] }) {
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
    const [tab, setTab] = useState<Tab>('students');

    // Фільтри
    const [query, setQuery] = useState('');
    const [parallel, setParallel] = useState<string>(ALL);
    const [className, setClassName] = useState<string>(ALL);
    const [position, setPosition] = useState<string>(ALL);

    // Хто зараз редагується + стан запиту
    const [openId, setOpenId] = useState<string | null>(null);
    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    // Усі паралелі, які реально є в базі: 8, 9, 10, 11...
    const parallels = useMemo(() => {
        const set = new Set<string>();
        for (const p of profiles) {
            const par = parallelOf(p.class);
            if (par) set.add(par);
        }
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [profiles]);

    // Класи — залежать від обраної паралелі.
    const classes = useMemo(() => {
        const set = new Set<string>();
        for (const p of profiles) {
            if (!p.class) continue;
            if (parallel !== ALL && parallelOf(p.class) !== parallel) continue;
            set.add(p.class);
        }
        return Array.from(set).sort(compareClasses);
    }, [profiles, parallel]);

    // Посади, назви яких підходять під пошуковий запит: «старост» → Староста,
    // Заступник старости. Завдяки цьому пошук працює і за посадою, не лише за іменем.
    const queryPositions = useMemo(() => new Set(positionIdsMatching(query)), [query]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        return profiles.filter((p) => {
            if (q) {
                const byName = (p.full_name ?? '').toLowerCase().includes(q);
                const byPosition = (p.positions ?? []).some((id) => queryPositions.has(id));
                if (!byName && !byPosition) return false;
            }
            if (parallel !== ALL && parallelOf(p.class) !== parallel) return false;
            if (className !== ALL && p.class !== className) return false;

            const positions = p.positions ?? [];
            if (position === NONE && positions.length > 0) return false;
            if (position !== ALL && position !== NONE && !positions.includes(position)) return false;

            return true;
        });
    }, [profiles, query, queryPositions, parallel, className, position]);

    const withPositions = useMemo(
        () => profiles.filter((p) => (p.positions ?? []).length > 0).length,
        [profiles]
    );

    function resetFilters() {
        setQuery('');
        setParallel(ALL);
        setClassName(ALL);
        setPosition(ALL);
    }

    // Хто ще займає цю посаду: для ліцейських — по всьому ліцею,
    // для класних — у межах того самого класу (п. 4.3.1 Статуту).
    function otherHolders(positionId: string, profile: Profile): Profile[] {
        return profiles.filter((p) => {
            if (p.id === profile.id) return false;
            if (!(p.positions ?? []).includes(positionId)) return false;
            if (isLyceumPosition(positionId)) return true;
            return p.class === profile.class;
        });
    }

    function holdersOf(positionId: string): Profile[] {
        return profiles
            .filter((p) => (p.positions ?? []).includes(positionId))
            .sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? '', 'uk'));
    }

    async function togglePosition(profile: Profile, positionId: string, has: boolean) {
        const key = `${profile.id}-${positionId}`;
        setLoadingKey(key);
        setError(null);
        setWarning(null);

        try {
            const res = await fetch(`/api/v1/users/${profile.id}/positions`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position: positionId, action: has ? 'remove' : 'add' }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося оновити посаду');
                return;
            }

            setProfiles((prev) =>
                prev.map((p) => (p.id === profile.id ? { ...p, positions: data.positions } : p))
            );

            // Не блокуємо, але попереджаємо: посада вже за кимось закріплена.
            if (!has) {
                const others = otherHolders(positionId, profile);
                if (others.length > 0) {
                    const names = others.map((o) => o.full_name ?? 'Без імені').join(', ');
                    setWarning(
                        `«${positionLabel(positionId)}» тепер займає більше однієї особи${isLyceumPosition(positionId) ? '' : ` в класі ${profile.class ?? '—'}`
                        }: ${names}. За п. 4.3.1 Статуту суміщення посад заборонено — перевір, чи це навмисно.`
                    );
                }
            }
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setLoadingKey(null);
        }
    }

    return (
        <div className="flex flex-col gap-4">

            {/* Перемикач вигляду */}
            <div className="inline-flex self-start rounded-full border border-primary/15 p-1">
                <button
                    onClick={() => setTab('students')}
                    className={`px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold uppercase tracking-wide transition-colors ${tab === 'students' ? 'bg-primary text-background' : 'text-primary/60'
                        }`}
                >
                    Список учнів
                </button>
                <button
                    onClick={() => setTab('positions')}
                    className={`px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold uppercase tracking-wide transition-colors ${tab === 'positions' ? 'bg-primary text-background' : 'text-primary/60'
                        }`}
                >
                    Усі посади
                </button>
            </div>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto shrink-0">
                        <X size={14} />
                    </button>
                </div>
            )}

            {warning && (
                <div className="flex items-start gap-2 bg-accent/10 border border-accent/30 text-primary text-sm rounded-xl px-4 py-3">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5 text-accent" />
                    <span>{warning}</span>
                    <button onClick={() => setWarning(null)} className="ml-auto shrink-0 text-primary/40">
                        <X size={14} />
                    </button>
                </div>
            )}

            {tab === 'students' ? (
                <>
                    {/* Фільтри */}
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
                        <div className="relative">
                            <Search
                                size={15}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/30"
                            />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Пошук за іменем або посадою: «Іваненко», «староста», «фізорг»..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                            />
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3">
                            <Filter label="Паралель">
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
                            </Filter>

                            <Filter label="Клас">
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
                            </Filter>

                            <Filter label="Посада">
                                <select
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm"
                                >
                                    <option value={ALL}>Будь-яка посада</option>
                                    <option value={NONE}>Без посади</option>
                                    {POSITION_SCOPES.map((scope) => (
                                        <optgroup key={scope.id} label={scope.label}>
                                            {positionsByScope(scope.id).map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.label}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </Filter>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-primary/50">
                            <span>
                                Показано <b className="text-primary">{filtered.length}</b> з {profiles.length}
                            </span>
                            <span>
                                З посадами: <b className="text-primary">{withPositions}</b>
                            </span>
                            {(query || parallel !== ALL || className !== ALL || position !== ALL) && (
                                <button onClick={resetFilters} className="underline hover:text-primary">
                                    Скинути фільтри
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Список учнів */}
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden">
                        {filtered.length === 0 ? (
                            <p className="px-6 py-10 text-sm text-primary/40 text-center">
                                За такими умовами нікого не знайдено.
                            </p>
                        ) : (
                            <div className="flex flex-col divide-y divide-primary/10">
                                {filtered.map((profile) => {
                                    const positions = profile.positions ?? [];
                                    const isOpen = openId === profile.id;

                                    return (
                                        <div key={profile.id}>
                                            <button
                                                onClick={() => setOpenId(isOpen ? null : profile.id)}
                                                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-primary/[0.03] transition-colors"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-primary truncate">
                                                        {profile.full_name || 'Без імені'}
                                                    </p>
                                                    <p className="text-xs text-primary/40 mt-0.5">
                                                        {profile.class || 'Клас не вказано'}
                                                    </p>
                                                </div>

                                                <div className="hidden sm:flex flex-wrap justify-end gap-1.5 max-w-[55%]">
                                                    {positions.length === 0 ? (
                                                        <span className="text-xs text-primary/30">без посади</span>
                                                    ) : (
                                                        positions.map((id) => (
                                                            <PositionBadge key={id} id={id} />
                                                        ))
                                                    )}
                                                </div>

                                                <ChevronDown
                                                    size={16}
                                                    className={`shrink-0 text-primary/30 transition-transform ${isOpen ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>

                                            {/* Мобільна версія значків — під іменем */}
                                            {!isOpen && positions.length > 0 && (
                                                <div className="sm:hidden flex flex-wrap gap-1.5 px-5 pb-4 -mt-2">
                                                    {positions.map((id) => (
                                                        <PositionBadge key={id} id={id} />
                                                    ))}
                                                </div>
                                            )}

                                            {isOpen && (
                                                <div className="px-5 pb-5 pt-1 flex flex-col gap-4 bg-primary/[0.02]">
                                                    {POSITION_SCOPES.map((scope) => (
                                                        <div key={scope.id}>
                                                            <p className="text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50 mb-2">
                                                                {scope.label}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {positionsByScope(scope.id).map((p) => {
                                                                    const has = positions.includes(p.id);
                                                                    const key = `${profile.id}-${p.id}`;
                                                                    const isLoading = loadingKey === key;
                                                                    const taken = otherHolders(p.id, profile);

                                                                    return (
                                                                        <button
                                                                            key={p.id}
                                                                            type="button"
                                                                            disabled={isLoading}
                                                                            onClick={() => togglePosition(profile, p.id, has)}
                                                                            title={
                                                                                taken.length > 0
                                                                                    ? `Вже займає: ${taken
                                                                                        .map((t) => t.full_name ?? 'Без імені')
                                                                                        .join(', ')}`
                                                                                    : undefined
                                                                            }
                                                                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${has
                                                                                ? 'bg-secondary/15 text-secondary'
                                                                                : 'bg-primary/5 text-primary/40 hover:bg-primary/10'
                                                                                }`}
                                                                        >
                                                                            {has ? <Check size={12} /> : <X size={12} />}
                                                                            {p.label}
                                                                            {!has && taken.length > 0 && (
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                                            )}
                                                                            {isLoading && '…'}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <p className="text-xs text-primary/40">
                                                        Крапка <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent align-middle" />{' '}
                                                        означає, що посаду вже хтось займає
                                                        {' '}(у класі — для класних посад, у ліцеї — для ліцейських).
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Вкладка «Усі посади» */
                <div className="flex flex-col gap-4">
                    {POSITION_SCOPES.map((scope) => (
                        <ScopeCard key={scope.id} scope={scope} holdersOf={holdersOf} />
                    ))}

                    <p className="text-xs text-primary/40 px-1">
                        Усього посад у Статуті: {POSITIONS.length}. Класні посади повторюються
                        в кожному класі, ліцейські — одні на весь ліцей.
                    </p>
                </div>
            )}
        </div>
    );
}

function ScopeCard({
    scope,
    holdersOf,
}: {
    scope: { id: PositionScope; label: string; hint: string };
    holdersOf: (id: string) => Profile[];
}) {
    return (
        <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-primary/10 bg-primary/[0.03]">
                <p className="font-grotesk font-bold text-sm text-primary">{scope.label}</p>
                <p className="text-xs text-primary/40 mt-0.5">{scope.hint}</p>
            </div>

            <div className="flex flex-col divide-y divide-primary/10">
                {positionsByScope(scope.id).map((p) => {
                    const holders = holdersOf(p.id);

                    return (
                        <div
                            key={p.id}
                            className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 sm:gap-4 px-5 py-3.5"
                        >
                            <p className="text-sm font-semibold text-primary">{p.label}</p>

                            <div className="flex flex-wrap gap-1.5">
                                {holders.length === 0 ? (
                                    <span className="text-xs text-primary/30">вакантно</span>
                                ) : (
                                    holders.map((h) => (
                                        <span
                                            key={h.id}
                                            className="inline-flex items-center gap-1.5 bg-secondary/10 text-primary text-xs font-medium px-3 py-1 rounded-full"
                                        >
                                            {h.full_name ?? 'Без імені'}
                                            {h.class && (
                                                <span className="text-primary/40">{h.class}</span>
                                            )}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PositionBadge({ id }: { id: string }) {
    return (
        <span className="inline-block bg-secondary/15 text-secondary text-[11px] font-semibold px-2.5 py-1 rounded-lg">
            {positionLabel(id)}
        </span>
    );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50 mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}
