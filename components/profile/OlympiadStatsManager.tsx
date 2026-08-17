'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Plus, TriangleAlert, X } from 'lucide-react';
import {
    rowTotal,
    tableTotal,
    yearTotal,
    type OlympiadRow,
    type OlympiadTable,
} from '@/lib/olympiads';

type Draft = { years: string[]; rows: OlympiadRow[] };

export default function OlympiadStatsManager({ tables }: { tables: OlympiadTable[] }) {
    const router = useRouter();

    const [activeId, setActiveId] = useState(tables[0]?.id ?? '');
    const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
        Object.fromEntries(
            tables.map((t) => [t.id, { years: [...t.years], rows: t.rows.map((r) => ({ ...r, counts: { ...r.counts } })) }])
        )
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);

    if (tables.length === 0) {
        return (
            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-8 text-center">
                <p className="text-sm text-primary/50">
                    Таблиць ще немає — застосуйте міграцію sql/0008_olympiad_stats.sql.
                </p>
            </div>
        );
    }

    const table = tables.find((t) => t.id === activeId) ?? tables[0];
    const draft = drafts[table.id];

    function update(changes: Partial<Draft>) {
        setDrafts((prev) => ({ ...prev, [table.id]: { ...prev[table.id], ...changes } }));
        setSaved(null);
    }

    function setCell(rowIndex: number, year: string, raw: string) {
        const rows = draft.rows.map((row, i) => {
            if (i !== rowIndex) return row;

            const counts = { ...row.counts };
            const value = Number(raw);

            if (!raw.trim() || !Number.isFinite(value) || value <= 0) {
                delete counts[year];
            } else {
                counts[year] = Math.round(value);
            }
            return { ...row, counts };
        });

        update({ rows });
    }

    function setSubject(rowIndex: number, subject: string) {
        update({ rows: draft.rows.map((row, i) => (i === rowIndex ? { ...row, subject } : row)) });
    }

    function setTotal(rowIndex: number, raw: string) {
        const value = Number(raw);
        const total = !raw.trim() || !Number.isFinite(value) ? null : Math.round(value);
        update({ rows: draft.rows.map((row, i) => (i === rowIndex ? { ...row, total } : row)) });
    }

    function addRow() {
        update({ rows: [...draft.rows, { subject: '', total: null, counts: {} }] });
    }

    function removeRow(rowIndex: number) {
        update({ rows: draft.rows.filter((_, i) => i !== rowIndex) });
    }

    function addYear() {
        // Пропонуємо наступний навчальний рік після останнього наявного.
        const last = draft.years[draft.years.length - 1];
        const startYear = last ? Number(last.split('-')[0]) + 1 : new Date().getFullYear();
        const suggestion = `${startYear}-${startYear + 1}`;

        if (draft.years.includes(suggestion)) return;
        update({ years: [...draft.years, suggestion] });
    }

    function setYear(index: number, value: string) {
        const previous = draft.years[index];
        const years = draft.years.map((y, i) => (i === index ? value : y));

        // Перейменували колонку — переносимо в неї значення зі старої назви.
        const rows = draft.rows.map((row) => {
            if (!(previous in row.counts)) return row;

            const counts = { ...row.counts };
            const kept = counts[previous];
            delete counts[previous];
            counts[value] = kept;
            return { ...row, counts };
        });

        update({ years, rows });
    }

    function removeYear(index: number) {
        const year = draft.years[index];
        const years = draft.years.filter((_, i) => i !== index);
        const rows = draft.rows.map((row) => {
            const counts = { ...row.counts };
            delete counts[year];
            return { ...row, counts };
        });

        update({ years, rows });
    }

    async function save() {
        setSaving(true);
        setError(null);
        setSaved(null);

        const years = draft.years.map((y) => y.trim()).filter(Boolean);
        if (new Set(years).size !== years.length) {
            setError('Роки повторюються — виправте назви колонок');
            setSaving(false);
            return;
        }

        try {
            const res = await fetch(`/api/v1/olympiads/${table.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ years, rows: draft.rows }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти');
                return;
            }

            setSaved(table.id);
            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setSaving(false);
        }
    }

    const total = tableTotal(draft.rows);

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

            {/* Вибір таблиці */}
            <div className="flex flex-wrap gap-2">
                {tables.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveId(t.id)}
                        className={`rounded-full px-4 py-2 font-inter text-sm font-medium transition-colors ${t.id === table.id
                            ? 'bg-primary text-background'
                            : 'text-primary/70 bg-primary/5 hover:bg-primary/10'
                            }`}
                    >
                        {t.title}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={addRow}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary transition-colors"
                >
                    <Plus size={15} />
                    Додати предмет
                </button>
                <span className="text-primary/20">·</span>
                <button
                    onClick={addYear}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary transition-colors"
                >
                    <Plus size={15} />
                    Додати рік
                </button>

                <p className="ml-auto text-sm text-primary/50">
                    Разом: <b className="font-manrope text-primary">{total}</b>
                </p>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/[0.02] overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-primary/[0.04]">
                            <th className="text-left font-manrope text-xs font-semibold uppercase tracking-wider text-primary/60 px-3 py-2.5 min-w-[190px] border-b border-primary/10">
                                Предмет
                            </th>
                            <th className="font-manrope text-xs font-semibold uppercase tracking-wider text-primary/60 px-2 py-2.5 border-b border-primary/10 whitespace-nowrap">
                                Всього
                            </th>
                            {draft.years.map((year, index) => (
                                <th key={index} className="px-1.5 py-2 border-b border-primary/10">
                                    <div className="flex flex-col items-center gap-1">
                                        <input
                                            value={year}
                                            onChange={(e) => setYear(index, e.target.value)}
                                            className="w-[86px] rounded-lg border border-primary/15 bg-white/70 px-1.5 py-1 text-center text-[11px] focus:outline-none focus:border-secondary"
                                        />
                                        <button
                                            onClick={() => removeYear(index)}
                                            className="text-primary/25 hover:text-accent transition-colors"
                                            aria-label={`Прибрати рік ${year}`}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </th>
                            ))}
                            <th className="px-2 py-2.5 border-b border-primary/10" />
                        </tr>
                    </thead>

                    <tbody>
                        {draft.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-primary/[0.02]">
                                <td className="px-3 py-1.5 border-b border-primary/[0.07]">
                                    <input
                                        value={row.subject}
                                        onChange={(e) => setSubject(rowIndex, e.target.value)}
                                        placeholder="Назва предмета"
                                        className="w-full rounded-lg border border-primary/15 bg-white/70 px-2.5 py-1.5 text-sm focus:outline-none focus:border-secondary"
                                    />
                                </td>

                                <td className="px-2 py-1.5 border-b border-primary/[0.07]">
                                    <input
                                        value={row.total ?? ''}
                                        onChange={(e) => setTotal(rowIndex, e.target.value)}
                                        inputMode="numeric"
                                        placeholder={String(rowTotal({ ...row, total: null }))}
                                        title="Порожньо — рахується як сума по роках"
                                        className="w-[70px] rounded-lg border border-primary/15 bg-white/70 px-2 py-1.5 text-center text-sm tabular-nums focus:outline-none focus:border-secondary"
                                    />
                                </td>

                                {draft.years.map((year) => (
                                    <td key={year} className="px-1.5 py-1.5 border-b border-primary/[0.07]">
                                        <input
                                            value={row.counts[year] ?? ''}
                                            onChange={(e) => setCell(rowIndex, year, e.target.value)}
                                            inputMode="numeric"
                                            className="w-[54px] rounded-lg border border-primary/10 bg-white/60 px-1 py-1.5 text-center text-sm tabular-nums focus:outline-none focus:border-secondary"
                                        />
                                    </td>
                                ))}

                                <td className="px-2 py-1.5 border-b border-primary/[0.07]">
                                    <button
                                        onClick={() => removeRow(rowIndex)}
                                        className="text-primary/25 hover:text-accent transition-colors"
                                        aria-label="Прибрати предмет"
                                    >
                                        <X size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {draft.rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={draft.years.length + 3}
                                    className="px-4 py-8 text-center text-sm text-primary/40"
                                >
                                    Предметів ще немає — додайте перший.
                                </td>
                            </tr>
                        )}
                    </tbody>

                    <tfoot>
                        <tr className="bg-primary/[0.04]">
                            <th className="text-left font-manrope font-bold text-primary px-3 py-2.5">
                                Загалом
                            </th>
                            <td className="text-center font-manrope font-bold text-primary px-2 py-2.5 tabular-nums">
                                {total}
                            </td>
                            {draft.years.map((year) => (
                                <td
                                    key={year}
                                    className="text-center font-manrope font-semibold text-primary/60 px-1.5 py-2.5 tabular-nums"
                                >
                                    {yearTotal(draft.rows, year)}
                                </td>
                            ))}
                            <td />
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    Зберегти таблицю
                </button>

                {saved === table.id && (
                    <span className="text-sm text-secondary font-semibold">Збережено</span>
                )}

                <p className="text-xs text-primary/40 basis-full">
                    Колонка «Всього» порожня — рахується як сума по роках. Заповнюйте її
                    лише тоді, коли частина перемог припадає на роки, яких немає в
                    колонках.
                </p>
            </div>
        </div>
    );
}
