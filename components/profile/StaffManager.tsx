'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowDown, ArrowUp, Check, Loader2, Pencil, Plus, Trash2, TriangleAlert, User, X,
} from 'lucide-react';
import type { StaffDepartment, StaffRow } from '@/lib/staff';
import UploadButton from './UploadButton';

type Draft = {
    id: string | null;
    department: string;
    name: string;
    position: string;
    photoUrl: string;
};

const EMPTY: Draft = { id: null, department: '', name: '', position: '', photoUrl: '' };

export default function StaffManager({ departments }: { departments: StaffDepartment[] }) {
    const router = useRouter();

    const [openDept, setOpenDept] = useState<string | null>(departments[0]?.title ?? null);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const deptNames = useMemo(() => departments.map((d) => d.title), [departments]);
    const total = useMemo(
        () => departments.reduce((sum, d) => sum + d.members.length, 0),
        [departments]
    );

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
        if (!draft.name.trim()) {
            setError('Вкажіть прізвище, ім’я та по батькові');
            return;
        }
        if (!draft.department.trim()) {
            setError('Оберіть або впишіть кафедру');
            return;
        }

        const payload = {
            department: draft.department,
            name: draft.name,
            position: draft.position,
            photoUrl: draft.photoUrl,
        };

        const ok = draft.id
            ? await send(`/api/v1/staff/${draft.id}`, 'PATCH', payload)
            : await send('/api/v1/staff', 'POST', payload);

        if (ok) {
            setOpenDept(draft.department.trim());
            setDraft(null);
        }
    }

    // Переставляння: міняємо місцями порядкові номери сусідів у кафедрі.
    async function move(dept: StaffDepartment, index: number, delta: -1 | 1) {
        const a = dept.members[index];
        const b = dept.members[index + delta];
        if (!a || !b) return;

        setBusy(true);
        setError(null);
        try {
            await Promise.all([
                fetch(`/api/v1/staff/${a.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sortOrder: b.sort_order }),
                }),
                fetch(`/api/v1/staff/${b.id}`, {
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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-primary/70">
                    {departments.length} кафедр · {total} педагогів
                </p>
                <button
                    type="button"
                    onClick={() => { setDraft({ ...EMPTY, department: openDept ?? '' }); setError(null); }}
                    className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-none px-5 py-2.5 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={15} />
                    Додати педагога
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
                            {draft.id ? 'Редагування педагога' : 'Новий педагог'}
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

                    <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-primary/85">Кафедра</span>
                        <input
                            list="staff-departments"
                            value={draft.department}
                            onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                            placeholder="Наприклад, Кафедра математики"
                            className="border border-primary/15 bg-white rounded-none px-3 py-2 text-primary outline-none focus:border-primary/40"
                        />
                        <datalist id="staff-departments">
                            {deptNames.map((n) => <option key={n} value={n} />)}
                        </datalist>
                        <span className="text-xs text-primary/60">
                            Впишіть нову назву — і кафедра зʼявиться на сторінці сама.
                        </span>
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-primary/85">Прізвище, ім’я та по батькові</span>
                        <input
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            className="border border-primary/15 bg-white rounded-none px-3 py-2 text-primary outline-none focus:border-primary/40"
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-primary/85">Посада і звання</span>
                        <textarea
                            value={draft.position}
                            onChange={(e) => setDraft({ ...draft, position: e.target.value })}
                            rows={2}
                            className="border border-primary/15 bg-white rounded-none px-3 py-2 text-primary outline-none focus:border-primary/40 resize-none"
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-primary/85">Фото</span>
                        <input
                            value={draft.photoUrl}
                            onChange={(e) => setDraft({ ...draft, photoUrl: e.target.value })}
                            placeholder="/staff/prizvyshche.jpg"
                            className="border border-primary/15 bg-white rounded-none px-3 py-2 text-primary outline-none focus:border-primary/40"
                        />
                        <span className="text-xs text-primary/60">
                            Оберіть файл кнопкою нижче або вставте посилання. Можна лишити
                            порожнім — тоді покажемо ініціали.
                        </span>
                    </label>

                    <UploadButton
                        folder="staff"
                        kind="image"
                        label="Обрати фото з компʼютера"
                        onUploaded={(url) => setDraft((d) => (d ? { ...d, photoUrl: url } : d))}
                        onError={setError}
                    />

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

            {departments.length === 0 && !draft && (
                <p className="border border-primary/10 bg-primary/[0.02] rounded-none px-6 py-10 text-center text-sm text-primary/60">
                    Список порожній. Натисніть «Додати педагога».
                </p>
            )}

            {departments.map((dept) => {
                const open = openDept === dept.title;
                return (
                    <section key={dept.title} className="border border-primary/15 rounded-none bg-primary/[0.02]">
                        <button
                            type="button"
                            onClick={() => setOpenDept(open ? null : dept.title)}
                            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                        >
                            <span className="font-manrope font-bold text-primary">{dept.title}</span>
                            <span className="font-plex text-xs font-semibold text-primary/60">
                                {dept.members.length} {dept.members.length === 1 ? 'педагог' : 'педагогів'}
                            </span>
                        </button>

                        {open && (
                            <ul className="flex flex-col border-t border-primary/10">
                                {dept.members.map((member: StaffRow, i) => (
                                    <li
                                        key={member.id}
                                        className="flex items-center gap-4 px-5 py-3 border-b border-primary/[0.06] last:border-b-0"
                                    >
                                        <span className="relative w-12 h-14 shrink-0 overflow-hidden bg-primary/5">
                                            {member.photo_url ? (
                                                <Image
                                                    src={member.photo_url}
                                                    alt={member.name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="w-full h-full flex items-center justify-center text-primary/30">
                                                    <User size={18} />
                                                </span>
                                            )}
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-primary">{member.name}</span>
                                            <span className="block text-xs text-primary/60 line-clamp-2">{member.position}</span>
                                        </span>

                                        <span className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => move(dept, i, -1)}
                                                disabled={busy || i === 0}
                                                aria-label="Вище"
                                                className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-primary disabled:opacity-30"
                                            >
                                                <ArrowUp size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => move(dept, i, 1)}
                                                disabled={busy || i === dept.members.length - 1}
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
                                                        id: member.id,
                                                        department: member.department,
                                                        name: member.name,
                                                        position: member.position,
                                                        photoUrl: member.photo_url ?? '',
                                                    });
                                                }}
                                                aria-label="Редагувати"
                                                className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-primary"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            {confirmDelete === member.id ? (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const ok = await send(`/api/v1/staff/${member.id}`, 'DELETE');
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
                                                    onClick={() => setConfirmDelete(member.id)}
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
                        )}
                    </section>
                );
            })}
        </div>
    );
}
