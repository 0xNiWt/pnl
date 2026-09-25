'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowDown, ArrowUp, Check, Loader2, Pencil, Plus, Trash2, TriangleAlert, User, X,
} from 'lucide-react';
import type { Alum } from '@/lib/alumni';
import UploadButton from './UploadButton';

type Draft = {
    id: string | null;
    name: string;
    headline: string;
    years: string;
    bio: string;
    photoUrl: string;
    linkUrl: string;
};

const EMPTY: Draft = { id: null, name: '', headline: '', years: '', bio: '', photoUrl: '', linkUrl: '' };

export default function AlumniManager({ alumni }: { alumni: Alum[] }) {
    const router = useRouter();

    const [draft, setDraft] = useState<Draft | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    async function send(url: string, method: string, body?: unknown) {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(url, {
                method,
                headers: body ? { 'Content-Type': 'application/json' } : undefined,
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти');
                return false;
            }
            router.refresh();
            return true;
        } catch {
            setError('Немає зʼєднання — спробуйте ще раз');
            return false;
        } finally {
            setBusy(false);
        }
    }

    async function save() {
        if (!draft) return;
        if (!draft.name.trim()) { setError('Вкажіть імʼя випускника'); return; }

        const payload = {
            name: draft.name,
            headline: draft.headline,
            years: draft.years,
            bio: draft.bio,
            photoUrl: draft.photoUrl,
            linkUrl: draft.linkUrl,
        };

        const ok = draft.id
            ? await send(`/api/v1/alumni/${draft.id}`, 'PATCH', payload)
            : await send('/api/v1/alumni', 'POST', payload);

        if (ok) setDraft(null);
    }

    // Переставляння: міняємо місцями порядкові номери сусідів.
    async function move(index: number, delta: -1 | 1) {
        const a = alumni[index];
        const b = alumni[index + delta];
        if (!a || !b) return;

        setBusy(true);
        setError(null);
        try {
            await Promise.all([
                fetch(`/api/v1/alumni/${a.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sortOrder: b.sort_order }),
                }),
                fetch(`/api/v1/alumni/${b.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sortOrder: a.sort_order }),
                }),
            ]);
            router.refresh();
        } catch {
            setError('Немає зʼєднання — спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    const field = (
        label: string,
        key: keyof Omit<Draft, 'id'>,
        opts: { rows?: number; hint?: string; placeholder?: string } = {}
    ) => (
        <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-primary/85">{label}</span>
            {opts.rows ? (
                <textarea
                    value={draft![key]}
                    onChange={(e) => setDraft({ ...draft!, [key]: e.target.value })}
                    rows={opts.rows}
                    placeholder={opts.placeholder}
                    className="border border-primary/15 bg-white rounded-none px-3 py-2 text-primary outline-none focus:border-primary/40 resize-y"
                />
            ) : (
                <input
                    value={draft![key]}
                    onChange={(e) => setDraft({ ...draft!, [key]: e.target.value })}
                    placeholder={opts.placeholder}
                    className="border border-primary/15 bg-white rounded-none px-3 py-2 text-primary outline-none focus:border-primary/40"
                />
            )}
            {opts.hint && <span className="text-xs text-primary/60">{opts.hint}</span>}
        </label>
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-primary/70">
                    {alumni.length} у списку
                </p>
                <button
                    type="button"
                    onClick={() => { setDraft({ ...EMPTY }); setError(null); }}
                    className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-none px-5 py-2.5 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={15} />
                    Додати випускника
                </button>
            </div>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-none px-4 py-3">
                    <TriangleAlert size={15} className="mt-0.5 shrink-0" />
                    {error}
                </div>
            )}

            {draft && (
                <div className="border border-primary/15 bg-primary/[0.02] rounded-none p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-manrope font-bold text-primary">
                            {draft.id ? 'Редагування випускника' : 'Новий випускник'}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setDraft(null)}
                            className="text-primary/60 hover:text-primary"
                            aria-label="Закрити"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {field('Імʼя та прізвище', 'name')}
                    {field('Ким є зараз', 'headline', {
                        placeholder: 'Математикиня, лауреатка Філдсівської премії',
                        hint: 'Один рядок — те, що видно на картці під імʼям.',
                    })}
                    {field('Роки навчання в ліцеї', 'years', { placeholder: '1994–2001' })}
                    {field('Про випускника', 'bio', {
                        rows: 5,
                        hint: 'Кілька речень: чим займається, чим відомий, що пов’язує з ліцеєм.',
                    })}

                    <div className="flex flex-col gap-2">
                        {field('Фото', 'photoUrl', { placeholder: 'Оберіть файл кнопкою нижче або вставте посилання' })}
                        <UploadButton
                            folder="alumni"
                            kind="image"
                            label="Обрати фото з компʼютера"
                            onUploaded={(url) => setDraft((d) => (d ? { ...d, photoUrl: url } : d))}
                            onError={setError}
                        />
                    </div>

                    {field('Посилання «Докладніше»', 'linkUrl', {
                        placeholder: 'https://…',
                        hint: 'Необовʼязково: сторінка у Вікіпедії, інтервʼю чи профіль.',
                    })}

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={save}
                            disabled={busy}
                            className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-none px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
                        >
                            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                            Зберегти
                        </button>
                        <button
                            type="button"
                            onClick={() => setDraft(null)}
                            className="font-manrope font-semibold text-sm text-primary/70 px-4 hover:text-primary"
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            )}

            {alumni.length === 0 && !draft && (
                <p className="border border-primary/10 bg-primary/[0.02] rounded-none px-6 py-10 text-center text-sm text-primary/60">
                    Список порожній. Натисніть «Додати випускника».
                </p>
            )}

            <ul className="flex flex-col gap-3">
                {alumni.map((alum, i) => (
                    <li
                        key={alum.id}
                        className="flex items-start gap-4 border border-primary/15 bg-primary/[0.02] rounded-none p-4"
                    >
                        <span className="relative w-16 h-16 shrink-0 overflow-hidden bg-primary/5">
                            {alum.photo_url ? (
                                <Image src={alum.photo_url} alt={alum.name} fill sizes="64px" className="object-cover" />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center text-primary/30">
                                    <User size={18} />
                                </span>
                            )}
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-primary">{alum.name}</span>
                            {alum.headline && (
                                <span className="block text-xs text-primary/70 mt-0.5">{alum.headline}</span>
                            )}
                            {alum.years && (
                                <span className="block text-xs text-primary/60 mt-0.5">Навчання: {alum.years}</span>
                            )}
                        </span>

                        <span className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={() => move(i, -1)}
                                disabled={busy || i === 0}
                                aria-label="Вище"
                                className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-primary disabled:opacity-30"
                            >
                                <ArrowUp size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => move(i, 1)}
                                disabled={busy || i === alumni.length - 1}
                                aria-label="Нижче"
                                className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-primary disabled:opacity-30"
                            >
                                <ArrowDown size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setError(null);
                                    setDraft({
                                        id: alum.id,
                                        name: alum.name,
                                        headline: alum.headline ?? '',
                                        years: alum.years ?? '',
                                        bio: alum.bio ?? '',
                                        photoUrl: alum.photo_url ?? '',
                                        linkUrl: alum.link_url ?? '',
                                    });
                                }}
                                aria-label="Редагувати"
                                className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-primary"
                            >
                                <Pencil size={15} />
                            </button>
                            {confirmDelete === alum.id ? (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const ok = await send(`/api/v1/alumni/${alum.id}`, 'DELETE');
                                        if (ok) setConfirmDelete(null);
                                    }}
                                    disabled={busy}
                                    className="font-manrope text-xs font-bold text-red-700 px-2"
                                >
                                    Точно?
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(alum.id)}
                                    aria-label="Видалити"
                                    className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-red-700"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
