'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, EyeOff, Eye, Loader2, Plus, TriangleAlert, X } from 'lucide-react';
import { compareClasses } from '@/lib/positions';
import { POLL_SCOPE_LABELS, QUORUM, type PollScope } from '@/lib/voting';

export default function PollCreateForm({
    scopes,
    myClass,
    allClasses,
}: {
    scopes: PollScope[];
    myClass: string | null;
    allClasses: string[];
}) {
    const router = useRouter();

    const [scope, setScope] = useState<PollScope>(scopes[0]);
    const [className, setClassName] = useState<string>(myClass ?? allClasses[0] ?? '');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [options, setOptions] = useState<string[]>(['', '']);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const classChoices = allClasses.length > 0
        ? [...allClasses].sort(compareClasses)
        : myClass
            ? [myClass]
            : [];

    function setOption(index: number, value: string) {
        setOptions(options.map((o, i) => (i === index ? value : o)));
    }

    function addOption() {
        if (options.length >= 20) return;
        setOptions([...options, '']);
    }

    function removeOption(index: number) {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    }

    async function submit() {
        setError(null);

        if (!title.trim()) {
            setError('Напиши питання');
            return;
        }
        const clean = options.map((o) => o.trim()).filter(Boolean);
        if (clean.length < 2) {
            setError('Потрібно щонайменше два варіанти відповіді');
            return;
        }
        if (scope === 'class' && !className) {
            setError('Обери клас');
            return;
        }

        setSaving(true);

        try {
            const res = await fetch('/api/v1/polls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    scope,
                    className: scope === 'class' ? className : null,
                    isAnonymous,
                    options: clean,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося створити голосування');
                return;
            }

            router.push(`/profile/votes/${data.id}`);
            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setSaving(false);
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

            {/* Для кого */}
            <div>
                <label className="block text-xs font-manrope font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                    Для кого голосування
                </label>

                <div className="inline-flex rounded-full border border-primary/15 p-1">
                    {scopes.map((s) => (
                        <button
                            key={s}
                            onClick={() => setScope(s)}
                            className={`px-4 py-1.5 rounded-full text-xs font-manrope font-semibold uppercase tracking-wide transition-colors ${scope === s ? 'bg-primary text-background' : 'text-primary/60'
                                }`}
                        >
                            {POLL_SCOPE_LABELS[s]}
                        </button>
                    ))}
                </div>

                {scope === 'class' && (
                    <div className="mt-3">
                        {classChoices.length > 1 ? (
                            <select
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm"
                            >
                                {classChoices.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-primary/60">
                                Клас <b className="text-primary">{className || '—'}</b> — голосувати
                                зможуть лише його учні.
                            </p>
                        )}
                    </div>
                )}

                <p className="text-xs text-primary/45 mt-2">
                    Мінімальна явка за п. 3.6 Статуту:{' '}
                    <b className="text-primary/70">{Math.round(QUORUM[scope] * 100)}%</b>
                    {scope === 'class' ? ' для голосувань класу.' : ' для загальноліцейських.'}
                </p>
            </div>

            {/* Питання */}
            <div>
                <label className="block text-xs font-manrope font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                    Питання
                </label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Наприклад: Куди йдемо на екскурсію?"
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                />
            </div>

            <div>
                <label className="block text-xs font-manrope font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                    Пояснення (необов&apos;язково)
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Деталі, дата, умови..."
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm resize-none focus:outline-none focus:border-secondary"
                />
            </div>

            {/* Варіанти */}
            <div>
                <label className="block text-xs font-manrope font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                    Варіанти відповіді
                </label>

                <div className="flex flex-col gap-2">
                    {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="w-6 text-xs text-primary/35 shrink-0">{index + 1}.</span>
                            <input
                                value={option}
                                onChange={(e) => setOption(index, e.target.value)}
                                placeholder={index === 0 ? 'Так' : index === 1 ? 'Ні' : 'Ще варіант'}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                            />
                            <button
                                onClick={() => removeOption(index)}
                                disabled={options.length <= 2}
                                className="text-primary/25 hover:text-accent disabled:opacity-30 disabled:hover:text-primary/25 shrink-0"
                                aria-label="Прибрати варіант"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addOption}
                    disabled={options.length >= 20}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors disabled:opacity-40"
                >
                    <Plus size={14} />
                    Додати варіант
                </button>
            </div>

            {/* Анонімність */}
            <div>
                <label className="block text-xs font-manrope font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                    Тип голосування
                </label>

                <div className="grid sm:grid-cols-2 gap-2">
                    <button
                        onClick={() => setIsAnonymous(true)}
                        className={`text-left px-4 py-3 rounded-xl border transition-colors ${isAnonymous
                            ? 'border-secondary bg-secondary/10'
                            : 'border-primary/10 bg-white/40 hover:bg-primary/5'
                            }`}
                    >
                        <p className="flex items-center gap-2 text-sm font-medium text-primary">
                            <EyeOff size={14} className="text-secondary" />
                            Анонімне
                        </p>
                        <p className="text-xs text-primary/50 mt-1">
                            Хто за що голосував — не зберігається взагалі. Видно лише відсотки
                            та явку. Так вимагає п. 3.6 Статуту.
                        </p>
                    </button>

                    <button
                        onClick={() => setIsAnonymous(false)}
                        className={`text-left px-4 py-3 rounded-xl border transition-colors ${!isAnonymous
                            ? 'border-secondary bg-secondary/10'
                            : 'border-primary/10 bg-white/40 hover:bg-primary/5'
                            }`}
                    >
                        <p className="flex items-center gap-2 text-sm font-medium text-primary">
                            <Eye size={14} className="text-accent" />
                            Відкрите
                        </p>
                        <p className="text-xs text-primary/50 mt-1">
                            Після закриття організатор побачить поіменний список. Учні
                            попереджаються про це перед голосуванням.
                        </p>
                    </button>
                </div>
            </div>

            <div>
                <button
                    onClick={submit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    Створити
                </button>
                <p className="text-xs text-primary/40 mt-2">
                    Після створення варіанти змінити не можна — тільки видалити голосування
                    й зробити нове.
                </p>
            </div>
        </div>
    );
}
