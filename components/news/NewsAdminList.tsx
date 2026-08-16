'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileEdit, Trash2, Eye, EyeOff } from 'lucide-react';

type NewsItem = {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    published_at: string | null;
    created_at: string;
};

export default function NewsAdminList({ items }: { items: NewsItem[] }) {
    const router = useRouter();
    const [pendingId, setPendingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Видалити цю новину? Дію не можна скасувати.')) return;

        setPendingId(id);
        try {
            const res = await fetch(`/api/v1/news/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json().catch(() => null);
                alert(data?.error ?? `Не вдалося видалити новину (код ${res.status})`);
            }
        } finally {
            setPendingId(null);
        }
    };

    const handleTogglePublish = async (item: NewsItem) => {
        setPendingId(item.id);
        try {
            const res = await fetch(`/api/v1/news/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: !item.published }),
            });
            if (res.ok) {
                router.refresh();
            }
        } finally {
            setPendingId(null);
        }
    };

    if (items.length === 0) {
        return (
            <p className="text-sm text-primary/50 py-10 text-center">
                Новин ще немає. Створіть першу.
            </p>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-primary/10">
            {items.map((item) => {
                const dateLabel = new Date(item.published_at ?? item.created_at).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                });
                const isPending = pendingId === item.id;

                return (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className={`text-[10px] font-manrope font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        item.published
                                            ? 'bg-secondary/15 text-secondary'
                                            : 'bg-primary/10 text-primary/50'
                                    }`}
                                >
                                    {item.published ? 'Опубліковано' : 'Чернетка'}
                                </span>
                                <span className="text-xs text-primary/40">{dateLabel}</span>
                            </div>
                            <p className="font-manrope font-bold text-primary truncate">{item.title}</p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                                onClick={() => handleTogglePublish(item)}
                                disabled={isPending}
                                title={item.published ? 'Зняти з публікації' : 'Опублікувати'}
                                className="w-9 h-9 rounded-lg bg-primary/5 hover:bg-primary/10 flex items-center justify-center text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
                            >
                                {item.published ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>

                            <Link
                                href={`/profile/news/${item.id}/edit`}
                                className="w-9 h-9 rounded-lg bg-primary/5 hover:bg-primary/10 flex items-center justify-center text-primary/60 hover:text-primary transition-colors"
                            >
                                <FileEdit size={16} />
                            </Link>

                            <button
                                onClick={() => handleDelete(item.id)}
                                disabled={isPending}
                                className="w-9 h-9 rounded-lg bg-accent/5 hover:bg-accent/10 flex items-center justify-center text-accent transition-colors disabled:opacity-50"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
