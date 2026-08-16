'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Image as ImageIcon, Type, AlignLeft, Plus, X } from 'lucide-react';

type NewsFormProps = {
    mode: 'create' | 'edit';
    newsId?: string;
    initialData?: {
        title: string;
        excerpt: string | null;
        content: string;
        cover_url: string | null;
        images: string[] | null;
        published: boolean;
    };
};

export default function NewsForm({ mode, newsId, initialData }: NewsFormProps) {
    const router = useRouter();

    const startingImages = initialData?.images && initialData.images.length > 0
        ? initialData.images
        : initialData?.cover_url
            ? [initialData.cover_url]
            : [''];

    const [title, setTitle] = useState(initialData?.title ?? '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
    const [content, setContent] = useState(initialData?.content ?? '');
    const [images, setImages] = useState<string[]>(startingImages);
    const [published, setPublished] = useState(initialData?.published ?? false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updateImage = (index: number, value: string) => {
        setImages((prev) => prev.map((img, i) => (i === index ? value : img)));
    };

    const addImageField = () => {
        setImages((prev) => [...prev, '']);
    };

    const removeImageField = (index: number) => {
        setImages((prev) => (prev.length === 1 ? [''] : prev.filter((_, i) => i !== index)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const url = mode === 'create' ? '/api/v1/news' : `/api/v1/news/${newsId}`;
            const method = mode === 'create' ? 'POST' : 'PATCH';

            const cleanImages = images.map((img) => img.trim()).filter(Boolean);

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    excerpt,
                    content,
                    coverUrl: cleanImages[0] ?? null,
                    images: cleanImages,
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
                <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
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
                <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
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
                <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70 mb-1.5">
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
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-manrope font-semibold uppercase tracking-wider text-primary/70">
                        Фото (перше — обкладинка картки)
                    </label>
                    <button
                        type="button"
                        onClick={addImageField}
                        className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors"
                    >
                        <Plus size={14} />
                        Додати фото
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {images.map((img, index) => (
                        <div key={index} className="relative flex items-center gap-2">
                            <div className="relative flex-1">
                                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                <input
                                    type="url"
                                    value={img}
                                    onChange={(e) => updateImage(index, e.target.value)}
                                    placeholder={index === 0 ? 'https://... (пряме посилання на фото)' : 'https://...'}
                                    className="w-full rounded-xl border border-primary/10 bg-primary/5 pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-primary/30 outline-none transition-all focus:border-secondary focus:bg-white focus:ring-2 focus:ring-secondary/20"
                                />
                            </div>
                            {images.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeImageField(index)}
                                    className="w-9 h-9 flex-shrink-0 rounded-lg bg-accent/5 hover:bg-accent/10 flex items-center justify-center text-accent transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-1.5 text-xs text-primary/40">
                    Посилання має вести напряму на файл зображення (.jpg, .png, .webp)
                </p>
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