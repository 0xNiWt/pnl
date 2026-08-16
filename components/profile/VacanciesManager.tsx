"use client";

import { useState } from 'react';
import { Trash2, Plus, Pencil, Check, X } from 'lucide-react';

type Vacancy = {
    id: string;
    title: string;
    url: string;
    sort_order: number;
};

export default function VacanciesManager({ initialVacancies }: { initialVacancies: Vacancy[] }) {
    const [vacancies, setVacancies] = useState<Vacancy[]>(initialVacancies);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editUrl, setEditUrl] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleAdd() {
        if (!newTitle.trim() || !newUrl.trim()) {
            setError("Заповніть назву і посилання");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/vacancies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    url: newUrl,
                    sortOrder: vacancies.length,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Не вдалося додати вакансію');
                return;
            }
            setVacancies((prev) => [...prev, data.vacancy]);
            setNewTitle('');
            setNewUrl('');
        } catch {
            setError('Помилка мережі');
        } finally {
            setLoading(false);
        }
    }

    function startEdit(v: Vacancy) {
        setEditingId(v.id);
        setEditTitle(v.title);
        setEditUrl(v.url);
    }

    async function saveEdit(id: string) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/v1/vacancies/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle, url: editUrl }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти зміни');
                return;
            }
            setVacancies((prev) => prev.map((v) => (v.id === id ? data.vacancy : v)));
            setEditingId(null);
        } catch {
            setError('Помилка мережі');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Видалити цю вакансію?')) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/v1/vacancies/${id}`, { method: 'DELETE' });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError(data?.error ?? 'Не вдалося видалити вакансію');
                return;
            }
            setVacancies((prev) => prev.filter((v) => v.id !== id));
        } catch {
            setError('Помилка мережі');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {error}
                </div>
            )}

            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden">
                <div className="flex flex-col divide-y divide-primary/10">
                    {vacancies.map((v) => (
                        <div key={v.id} className="flex items-center gap-3 px-5 py-3.5">
                            {editingId === v.id ? (
                                <>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="Назва вакансії"
                                            className="rounded-lg border border-primary/10 bg-white px-3 py-1.5 text-sm outline-none focus:border-secondary"
                                        />
                                        <input
                                            value={editUrl}
                                            onChange={(e) => setEditUrl(e.target.value)}
                                            placeholder="/vacancies/..."
                                            className="rounded-lg border border-primary/10 bg-white px-3 py-1.5 text-sm outline-none focus:border-secondary"
                                        />
                                    </div>
                                    <button
                                        onClick={() => saveEdit(v.id)}
                                        disabled={loading}
                                        className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center hover:opacity-80"
                                    >
                                        <Check size={15} />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="w-8 h-8 rounded-lg bg-primary/5 text-primary/50 flex items-center justify-center hover:opacity-80"
                                    >
                                        <X size={15} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-primary">{v.title}</p>
                                        <p className="text-xs text-primary/50">{v.url}</p>
                                    </div>
                                    <button
                                        onClick={() => startEdit(v)}
                                        className="w-8 h-8 rounded-lg bg-primary/5 text-primary/50 flex items-center justify-center hover:text-primary hover:bg-primary/10"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(v.id)}
                                        disabled={loading}
                                        className="w-8 h-8 rounded-lg bg-accent/5 text-accent flex items-center justify-center hover:bg-accent/10"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}

                    {vacancies.length === 0 && (
                        <p className="text-sm text-primary/40 text-center py-8">Вакансій ще немає</p>
                    )}
                </div>
            </div>

            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5">
                <h3 className="text-sm font-manrope font-bold text-primary mb-3">Додати вакансію</h3>
                <div className="flex flex-col gap-2">
                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Наприклад: Вчитель фізики"
                        className="rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary"
                    />
                    <input
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="/vacancies/physics"
                        className="rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-secondary"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary text-background py-2.5 text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Plus size={15} />
                        Додати
                    </button>
                </div>
            </div>
        </div>
    );
}
