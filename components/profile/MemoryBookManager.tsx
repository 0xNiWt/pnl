'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Check, Loader2, Pencil, Plus, Search, Trash2, TriangleAlert, User, X,
} from 'lucide-react';
import { matchesQuery, type MemoryEntry } from '@/lib/memory';

type Draft = {
    id: string | null;
    name: string;
    relation: string;
    biography: string;
    photoUrl: string;
};

const EMPTY: Draft = { id: null, name: '', relation: '', biography: '', photoUrl: '' };
const PAGE_SIZE = 20;

export default function MemoryBookManager({ entries }: { entries: MemoryEntry[] }) {
    const router = useRouter();

    const [query, setQuery] = useState('');
    const [shown, setShown] = useState(PAGE_SIZE);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const found = useMemo(
        () => entries.filter((e) => matchesQuery(e, query)),
        [entries, query]
    );

    async function save() {
        if (!draft) return;
        if (!draft.name.trim()) {
            setError('Вкажіть імʼя');
            return;
        }

        setBusy(true);
        setError(null);

        const url = draft.id ? `/api/v1/memory/${draft.id}` : '/api/v1/memory';

        try {
            const res = await fetch(url, {
                method: draft.id ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: draft.name,
                    relation: draft.relation,
                    biography: draft.biography,
                    photoUrl: draft.photoUrl,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти');
                return;
            }

            setDraft(null);
            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    async function remove(entry: MemoryEntry) {
        if (!confirm(`Видалити запис «${entry.name}»?`)) return;

        setBusy(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/memory/${entry.id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося видалити');
                return;
            }
            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto shrink-0">
                        <X size={14} />
                    </button>
                </div>
            )}

            {draft ? (
                <div className="bg-white/40 border border-primary/10 rounded-2xl p-5 flex flex-col gap-4">
                    <h2 className="font-manrope font-bold text-primary">
                        {draft.id ? 'Редагування запису' : 'Новий запис'}
                    </h2>

                    <Field label="Імʼя та по батькові">
                        <input
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            placeholder="Наприклад: Мартиненко Петро Мойсейович"
                            className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/70 text-sm focus:outline-none focus:border-secondary"
                        />
                    </Field>

                    <Field label="Ким доводиться">
                        <input
                            value={draft.relation}
                            onChange={(e) => setDraft({ ...draft, relation: e.target.value })}
                            placeholder="Наприклад: прадід учениці Марії Іванової"
                            className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/70 text-sm focus:outline-none focus:border-secondary"
                        />
                    </Field>

                    <Field label="Історія">
                        <textarea
                            value={draft.biography}
                            onChange={(e) => setDraft({ ...draft, biography: e.target.value })}
                            rows={6}
                            placeholder="Де воював, які нагороди, що збереглося в родинній памʼяті…"
                            className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/70 text-sm resize-y focus:outline-none focus:border-secondary"
                        />
                    </Field>

                    <Field label="Фото — шлях або посилання (необовʼязково)">
                        <input
                            value={draft.photoUrl}
                            onChange={(e) => setDraft({ ...draft, photoUrl: e.target.value })}
                            placeholder="/memory/p002.jpg"
                            className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/70 text-sm focus:outline-none focus:border-secondary"
                        />
                        <p className="text-xs text-primary/40 mt-1.5">
                            Файл фото треба покласти в папку <b>public/memory</b> проєкту й
                            вказати тут шлях до нього. Без фото запис теж збережеться.
                        </p>
                    </Field>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={save}
                            disabled={busy}
                            className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                            Зберегти
                        </button>

                        <button
                            onClick={() => { setDraft(null); setError(null); }}
                            className="text-sm font-semibold text-primary/50 hover:text-primary transition-colors"
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setDraft({ ...EMPTY })}
                        className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={15} />
                        Додати людину
                    </button>

                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/35" />
                        <input
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setShown(PAGE_SIZE); }}
                            placeholder="Пошук"
                            className="w-full rounded-full border border-primary/15 bg-white/60 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-secondary"
                        />
                    </div>

                    <p className="text-sm text-primary/45">
                        {found.length} із {entries.length}
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-2">
                {found.slice(0, shown).map((entry) => (
                    <div
                        key={entry.id}
                        className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-4 flex items-start gap-4"
                    >
                        <div className="relative w-14 h-16 shrink-0 rounded-xl overflow-hidden bg-primary/5">
                            {entry.photo_url ? (
                                <Image
                                    src={entry.photo_url}
                                    alt={entry.name}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="absolute inset-0 flex items-center justify-center text-primary/25">
                                    <User size={18} />
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-primary">{entry.name}</p>
                            {entry.relation && (
                                <p className="text-xs text-secondary mt-0.5">{entry.relation}</p>
                            )}
                            {entry.biography && (
                                <p className="text-xs text-primary/45 mt-1 line-clamp-2">
                                    {entry.biography}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() =>
                                    setDraft({
                                        id: entry.id,
                                        name: entry.name,
                                        relation: entry.relation ?? '',
                                        biography: entry.biography ?? '',
                                        photoUrl: entry.photo_url ?? '',
                                    })
                                }
                                aria-label="Редагувати"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                                <Pencil size={15} />
                            </button>

                            <button
                                onClick={() => remove(entry)}
                                disabled={busy}
                                aria-label="Видалити"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-primary/30 hover:text-accent hover:bg-accent/5 transition-colors disabled:opacity-40"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                ))}

                {found.length === 0 && (
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-8 text-center">
                        <p className="text-sm text-primary/40">
                            {entries.length === 0
                                ? 'Записів ще немає — застосуйте міграцію sql/0010_memory_book.sql або додайте людину вручну.'
                                : 'Нічого не знайдено.'}
                        </p>
                    </div>
                )}
            </div>

            {shown < found.length && (
                <button
                    onClick={() => setShown(shown + PAGE_SIZE)}
                    className="self-center inline-flex items-center gap-2 rounded-full border border-primary/15 px-5 py-2.5 font-manrope text-sm font-semibold text-primary/70 hover:bg-primary/5 transition-colors"
                >
                    Показати ще
                    <span className="text-primary/40">{found.length - shown}</span>
                </button>
            )}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-manrope font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}
