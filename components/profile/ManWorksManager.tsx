'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowDown, ArrowUp, Check, FlaskConical, Loader2, Pencil, Plus, Trash2, TriangleAlert, X,
} from 'lucide-react';
import type { ManWork } from '@/lib/manWorks';
import UploadButton from './UploadButton';

type Draft = {
    id: string | null;
    title: string;
    author: string;
    authorInfo: string;
    supervisor: string;
    section: string;
    year: string;
    summary: string;
    description: string;
    photoUrl: string;
    fileUrl: string;
};

const EMPTY: Draft = {
    id: null, title: '', author: '', authorInfo: '', supervisor: '',
    section: '', year: '', summary: '', description: '', photoUrl: '', fileUrl: '',
};

export default function ManWorksManager({ works }: { works: ManWork[] }) {
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
        if (!draft.title.trim()) { setError('Вкажіть тему роботи'); return; }
        if (!draft.author.trim()) { setError('Вкажіть автора роботи'); return; }

        const payload = {
            title: draft.title,
            author: draft.author,
            authorInfo: draft.authorInfo,
            supervisor: draft.supervisor,
            section: draft.section,
            year: draft.year,
            summary: draft.summary,
            description: draft.description,
            photoUrl: draft.photoUrl,
            fileUrl: draft.fileUrl,
        };

        const ok = draft.id
            ? await send(`/api/v1/man/${draft.id}`, 'PATCH', payload)
            : await send('/api/v1/man', 'POST', payload);

        if (ok) setDraft(null);
    }

    // Переставляння: міняємо місцями порядкові номери сусідніх робіт.
    async function move(index: number, delta: -1 | 1) {
        const a = works[index];
        const b = works[index + delta];
        if (!a || !b) return;

        setBusy(true);
        setError(null);
        try {
            await Promise.all([
                fetch(`/api/v1/man/${a.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sortOrder: b.sort_order }),
                }),
                fetch(`/api/v1/man/${b.id}`, {
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
                    {works.length} {works.length === 1 ? 'робота' : 'робіт'} у збірці
                </p>
                <button
                    type="button"
                    onClick={() => { setDraft({ ...EMPTY }); setError(null); }}
                    className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-none px-5 py-2.5 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={15} />
                    Додати роботу
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
                            {draft.id ? 'Редагування роботи' : 'Нова робота'}
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

                    {field('Тема роботи', 'title', { rows: 2 })}
                    {field('Автор', 'author', { placeholder: 'Прізвище, ім’я та по батькові' })}
                    {field('Про автора', 'authorInfo', { placeholder: 'Учень 9-А класу ліцею № 145' })}
                    {field('Наукові керівники', 'supervisor', { rows: 2 })}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {field('Відділення і секція', 'section', { placeholder: 'Хімія і біологія · Органічна хімія' })}
                        {field('Рік', 'year', { placeholder: '2025' })}
                    </div>

                    {field('Короткий опис', 'summary', {
                        rows: 2,
                        hint: 'Одне-два речення — те, що видно одразу під темою.',
                    })}
                    {field('Про що робота', 'description', {
                        rows: 5,
                        hint: 'Докладніше: мета, що зробив автор, який результат.',
                    })}
                    <div className="flex flex-col gap-2">
                        {field('Фото з роботи', 'photoUrl', {
                            placeholder: 'Оберіть файл кнопкою нижче або вставте посилання',
                        })}
                        <UploadButton
                            folder="man"
                            kind="image"
                            label="Обрати фото з компʼютера"
                            onUploaded={(url) => setDraft((d) => (d ? { ...d, photoUrl: url } : d))}
                            onError={setError}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        {field('Файл роботи', 'fileUrl', {
                            placeholder: 'Оберіть файл кнопкою нижче або вставте посилання',
                            hint: 'PDF або презентація — кнопка на сайті підпишеться сама.',
                        })}
                        <UploadButton
                            folder="man"
                            kind="any"
                            label="Обрати файл роботи з компʼютера"
                            onUploaded={(url) => setDraft((d) => (d ? { ...d, fileUrl: url } : d))}
                            onError={setError}
                        />
                    </div>

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

            {works.length === 0 && !draft && (
                <p className="border border-primary/10 bg-primary/[0.02] rounded-none px-6 py-10 text-center text-sm text-primary/60">
                    Збірка порожня. Натисніть «Додати роботу».
                </p>
            )}

            <ul className="flex flex-col gap-3">
                {works.map((work, i) => (
                    <li
                        key={work.id}
                        className="flex items-start gap-4 border border-primary/15 bg-primary/[0.02] rounded-none p-4"
                    >
                        <span className="relative w-20 h-20 shrink-0 overflow-hidden bg-primary/5">
                            {work.photo_url ? (
                                <Image src={work.photo_url} alt={work.title} fill sizes="80px" className="object-cover" />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center text-primary/30">
                                    <FlaskConical size={18} />
                                </span>
                            )}
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-primary">{work.title}</span>
                            <span className="block text-xs text-primary/70 mt-0.5">
                                {[work.author, work.section, work.year].filter(Boolean).join(' · ')}
                            </span>
                            {work.summary && (
                                <span className="block text-xs text-primary/60 mt-1 line-clamp-2">{work.summary}</span>
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
                                disabled={busy || i === works.length - 1}
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
                                        id: work.id,
                                        title: work.title,
                                        author: work.author,
                                        authorInfo: work.author_info ?? '',
                                        supervisor: work.supervisor ?? '',
                                        section: work.section ?? '',
                                        year: work.year ?? '',
                                        summary: work.summary ?? '',
                                        description: work.description ?? '',
                                        photoUrl: work.photo_url ?? '',
                                        fileUrl: work.file_url ?? '',
                                    });
                                }}
                                aria-label="Редагувати"
                                className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-primary"
                            >
                                <Pencil size={15} />
                            </button>
                            {confirmDelete === work.id ? (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const ok = await send(`/api/v1/man/${work.id}`, 'DELETE');
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
                                    onClick={() => setConfirmDelete(work.id)}
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
