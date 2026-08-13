'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Image as ImageIcon, Type, AlignLeft } from 'lucide-react';

type NewsFormProps = {
    mode: 'create' | 'edit';
    newsId?: string;
    initialData?: {
        title: string;
        excerpt: string | null;
        content: string;
        cover_url: string | null;
        published: boolean;
    };
};

export default function NewsForm({ mode, newsId, initialData }: NewsFormProps) {
    const router = useRouter();

    const [title, setTitle] = useState(initialData?.title ?? '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
    const [content, setContent] = useState(initialData?.content ?? '');
    const [coverUrl, setCoverUrl] = useState(initialData?.cover_url ?? '');
    const [published, setPublished] = useState(initialData?.published ?? false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const url = mode === 'create' ? '/api/v1/news' : `/api/v1/news/${newsId}`;
            const method = mode === 'create' ? 'POST' : 'PATCH';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    excerpt,
                    content,
                    coverUrl,
                    published,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти новину');
                return;
            }

            router.push('/profile/news');
            router.refresh();
        } catch {
            setError('Не вдалося зʼєднатися з сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
                <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-2.5 text-xs font-medium text-accent">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div>
                <label className="block text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                    Заголовок
                </label>
                <div className="relative">
                    <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Наприклад: Перемога на олімпіаді з фізики"
                        className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                    Короткий опис
                </label>
                <div className="relative">
                    <AlignLeft className="absolute left-3.5 top-3 w-4 h-4 text-primary/40" />
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Одне-два речення для картки новини"
                        rows={2}
                        className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20 resize-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                    Текст новини
                </label>
                <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Кожен абзац з нового рядка"
                    rows={10}
                    className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20 resize-y"
                />
            </div>

            <div>
                <label className="block text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
                    Обкладинка (URL)
                </label>
                <div className="relative">
                    <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <input
                        type="url"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                    />
                </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded border-primary/20 text-primary focus:ring-secondary/20 accent-primary"
                />
                <span className="text-sm text-primary/70">Опублікувати одразу</span>
            </label>

            <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-background tracking-wide hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Зберігаємо...' : mode === 'create' ? 'Створити новину' : 'Зберегти зміни'}
            </button>
        </form>
    );
}
