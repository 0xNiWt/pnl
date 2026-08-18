'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Check,
    Coins,
    CreditCard,
    Eye,
    EyeOff,
    ImageOff,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    TriangleAlert,
    X,
} from 'lucide-react';
import { formatPoints, formatUah, type ShopProduct } from '@/lib/shop';

// Порожній рядок у полі означає «не заповнено», тому форму тримаємо
// в рядках і перетворюємо на числа лише при відправці.
type Draft = {
    title: string;
    description: string;
    imageUrl: string;
    pricePoints: string;
    priceUah: string;
    formUrl: string;
    stock: string;
    active: boolean;
};

const EMPTY: Draft = {
    title: '',
    description: '',
    imageUrl: '',
    pricePoints: '',
    priceUah: '',
    formUrl: '',
    stock: '',
    active: true,
};

function toDraft(product: ShopProduct): Draft {
    return {
        title: product.title,
        description: product.description ?? '',
        imageUrl: product.image_url ?? '',
        pricePoints: product.price_points === null ? '' : String(product.price_points),
        priceUah: product.price_uah === null ? '' : String(product.price_uah),
        formUrl: product.form_url ?? '',
        stock: product.stock === null ? '' : String(product.stock),
        active: product.active,
    };
}

function toBody(draft: Draft) {
    return {
        title: draft.title,
        description: draft.description,
        imageUrl: draft.imageUrl,
        pricePoints: draft.pricePoints.trim() === '' ? null : draft.pricePoints.replace(',', '.'),
        priceUah: draft.priceUah.trim() === '' ? null : draft.priceUah.replace(',', '.'),
        formUrl: draft.formUrl,
        stock: draft.stock.trim() === '' ? null : draft.stock,
        active: draft.active,
    };
}

export default function ShopProductsManager({ initialProducts }: { initialProducts: ShopProduct[] }) {
    const [products, setProducts] = useState<ShopProduct[]>(initialProducts);
    const [draft, setDraft] = useState<Draft | null>(null);
    // null — створюємо новий товар, id — редагуємо наявний.
    const [editingId, setEditingId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function startCreate() {
        setEditingId(null);
        setDraft({ ...EMPTY });
        setError(null);
    }

    function startEdit(product: ShopProduct) {
        setEditingId(product.id);
        setDraft(toDraft(product));
        setError(null);
    }

    function cancel() {
        setDraft(null);
        setEditingId(null);
        setError(null);
    }

    async function save() {
        if (!draft) return;
        setBusy(true);
        setError(null);

        const url = editingId ? `/api/v1/shop/products/${editingId}` : '/api/v1/shop/products';

        try {
            const res = await fetch(url, {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toBody(draft)),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти товар');
                return;
            }

            setProducts((prev) =>
                editingId
                    ? prev.map((p) => (p.id === editingId ? data.product : p))
                    : [...prev, data.product]
            );
            cancel();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    async function toggleActive(product: ShopProduct) {
        setBusy(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/shop/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...toBody(toDraft(product)), active: !product.active }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося змінити видимість');
                return;
            }
            setProducts((prev) => prev.map((p) => (p.id === product.id ? data.product : p)));
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    async function remove(product: ShopProduct) {
        if (!confirm(`Видалити «${product.title}» з магазину? Замовлення на нього залишаться.`)) {
            return;
        }
        setBusy(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/shop/products/${product.id}`, { method: 'DELETE' });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? 'Не вдалося видалити товар');
                return;
            }
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
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
                    <button onClick={() => setError(null)} className="ml-auto shrink-0" aria-label="Закрити">
                        <X size={14} />
                    </button>
                </div>
            )}

            {draft ? (
                <ProductForm
                    draft={draft}
                    setDraft={setDraft}
                    onSave={save}
                    onCancel={cancel}
                    busy={busy}
                    isEdit={editingId !== null}
                />
            ) : (
                <button
                    onClick={startCreate}
                    className="self-start inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={15} />
                    Додати товар
                </button>
            )}

            {products.length === 0 ? (
                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-10 text-center">
                    <p className="text-sm text-primary/40">Товарів ще немає.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center gap-4 bg-primary/[0.02] border border-primary/10 rounded-2xl p-4"
                        >
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-primary/5 shrink-0">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.title}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                ) : (
                                    <span className="absolute inset-0 flex items-center justify-center text-primary/20">
                                        <ImageOff size={18} />
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-primary truncate">
                                    {product.title}
                                    {!product.active && (
                                        <span className="ml-2 text-[10px] font-manrope font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary/50">
                                            прихований
                                        </span>
                                    )}
                                </p>
                                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-primary/50 mt-1">
                                    {product.price_points !== null && (
                                        <span className="inline-flex items-center gap-1">
                                            <Coins size={11} className="text-accent" />
                                            {formatPoints(product.price_points)}
                                        </span>
                                    )}
                                    {product.price_uah !== null && (
                                        <span className="inline-flex items-center gap-1">
                                            <CreditCard size={11} className="text-secondary" />
                                            {formatUah(product.price_uah)}
                                        </span>
                                    )}
                                    <span>
                                        {product.stock === null ? 'без обліку залишків' : `залишок: ${product.stock}`}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => toggleActive(product)}
                                    disabled={busy}
                                    title={product.active ? 'Сховати з вітрини' : 'Показати на вітрині'}
                                    className="w-9 h-9 rounded-lg bg-primary/5 hover:bg-primary/10 flex items-center justify-center text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
                                >
                                    {product.active ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={() => startEdit(product)}
                                    disabled={busy}
                                    title="Редагувати"
                                    className="w-9 h-9 rounded-lg bg-primary/5 hover:bg-primary/10 flex items-center justify-center text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => remove(product)}
                                    disabled={busy}
                                    title="Видалити"
                                    className="w-9 h-9 rounded-lg bg-accent/5 hover:bg-accent/10 flex items-center justify-center text-accent transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ProductForm({
    draft,
    setDraft,
    onSave,
    onCancel,
    busy,
    isEdit,
}: {
    draft: Draft;
    setDraft: (d: Draft) => void;
    onSave: () => void;
    onCancel: () => void;
    busy: boolean;
    isEdit: boolean;
}) {
    const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
        setDraft({ ...draft, [key]: value });

    return (
        <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <h3 className="font-manrope font-bold text-primary text-sm">
                {isEdit ? 'Редагування товару' : 'Новий товар'}
            </h3>

            <Field label="Назва">
                <input
                    value={draft.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="Худі ліцею"
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                />
            </Field>

            <Field label="Опис">
                <textarea
                    value={draft.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={3}
                    placeholder="Розміри, кольори, деталі..."
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm resize-none focus:outline-none focus:border-secondary"
                />
            </Field>

            <Field label="Посилання на фото" hint="Будь-яке посилання на картинку — http:// або https://">
                <input
                    value={draft.imageUrl}
                    onChange={(e) => set('imageUrl', e.target.value)}
                    placeholder="https://kpnl145.kyiv.ua/merch/hoodie.jpg"
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Ціна в балах" hint="Порожньо — за бали не продається">
                    <input
                        value={draft.pricePoints}
                        onChange={(e) => set('pricePoints', e.target.value)}
                        inputMode="numeric"
                        placeholder="250"
                        className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                    />
                </Field>

                <Field label="Ціна в гривнях" hint="Порожньо — за гроші не продається">
                    <input
                        value={draft.priceUah}
                        onChange={(e) => set('priceUah', e.target.value)}
                        inputMode="decimal"
                        placeholder="450"
                        className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                    />
                </Field>
            </div>

            <Field
                label="Google-форма для покупки за гроші"
                hint="Кнопка «Купити за гроші» відкриє це посилання. Без нього ціна в гривнях не спрацює."
            >
                <input
                    value={draft.formUrl}
                    onChange={(e) => set('formUrl', e.target.value)}
                    placeholder="https://forms.gle/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                />
            </Field>

            <Field label="Залишок" hint="Порожньо — облік не ведеться, товар не закінчується">
                <input
                    value={draft.stock}
                    onChange={(e) => set('stock', e.target.value)}
                    inputMode="numeric"
                    placeholder="20"
                    className="w-full sm:w-40 px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                />
            </Field>

            <label className="flex items-center gap-2.5 text-sm text-primary/80 cursor-pointer">
                <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => set('active', e.target.checked)}
                    className="w-4 h-4 accent-current"
                />
                Показувати на вітрині
            </label>

            <div className="flex items-center gap-3 pt-1">
                <button
                    onClick={onSave}
                    disabled={busy}
                    className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    Зберегти
                </button>
                <button
                    onClick={onCancel}
                    disabled={busy}
                    className="text-sm font-semibold text-primary/50 hover:text-primary transition-colors disabled:opacity-50"
                >
                    Скасувати
                </button>
            </div>
        </div>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-xs font-manrope font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                {label}
            </label>
            {children}
            {hint && <p className="text-xs text-primary/40 mt-1">{hint}</p>}
        </div>
    );
}
