'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Check,
    Coins,
    CreditCard,
    ExternalLink,
    ImageOff,
    Loader2,
    PackageX,
    TriangleAlert,
    X,
} from 'lucide-react';
import {
    canBuyForMoney,
    canBuyForPoints,
    formatPoints,
    formatUah,
    isSoldOut,
    type ShopProduct,
} from '@/lib/shop';

export default function ShopGrid({
    products,
    isLoggedIn,
    balance,
}: {
    products: ShopProduct[];
    isLoggedIn: boolean;
    // null — гість: баланс показувати нема чого.
    balance: number | null;
}) {
    const router = useRouter();

    const [currentBalance, setCurrentBalance] = useState<number | null>(balance);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [bought, setBought] = useState<string | null>(null);

    async function buyForPoints(product: ShopProduct) {
        setBusyId(product.id);
        setError(null);
        setBought(null);

        try {
            const res = await fetch('/api/v1/shop/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося оформити замовлення');
                return;
            }

            setCurrentBalance(data.balance ?? currentBalance);
            setBought(product.title);
            // Оновлюємо сторінку: могли змінитися залишки товару.
            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusyId(null);
        }
    }

    if (products.length === 0) {
        return (
            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-16 text-center">
                <PackageX size={28} className="mx-auto text-primary/25 mb-3" />
                <p className="text-sm text-primary/50">
                    Товарів поки немає. Зазирніть пізніше — мерч ось-ось буде.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Баланс і повідомлення */}
            <div className="flex flex-wrap items-center gap-3">
                {currentBalance !== null && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/25 px-4 py-2 text-sm">
                        <Coins size={15} className="text-accent" />
                        <span className="text-primary/60">Ваш баланс:</span>
                        <b className="font-manrope text-primary">{formatPoints(currentBalance)}</b>
                    </span>
                )}

                {!isLoggedIn && (
                    <span className="text-sm text-primary/50">
                        <Link href="/auth/login" className="font-semibold text-secondary hover:text-primary">
                            Увійдіть
                        </Link>
                        , щоб купувати за бали.
                    </span>
                )}
            </div>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto shrink-0" aria-label="Закрити">
                        <X size={14} />
                    </button>
                </div>
            )}

            {bought && (
                <div className="flex items-start gap-2 bg-secondary/[0.08] border border-secondary/25 text-primary/80 text-sm rounded-xl px-4 py-3">
                    <Check size={16} className="shrink-0 mt-0.5 text-secondary" />
                    <span>
                        Замовлено <b className="text-primary">{bought}</b>. Бали списано — по мерч
                        підійдіть до активу. Замовлення видно в{' '}
                        <Link href="/profile/orders" className="font-semibold text-secondary hover:text-primary">
                            кабінеті
                        </Link>
                        .
                    </span>
                    <button onClick={() => setBought(null)} className="ml-auto shrink-0" aria-label="Закрити">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        isLoggedIn={isLoggedIn}
                        balance={currentBalance}
                        busy={busyId === product.id}
                        onBuy={() => buyForPoints(product)}
                    />
                ))}
            </div>
        </div>
    );
}

function ProductCard({
    product,
    isLoggedIn,
    balance,
    busy,
    onBuy,
}: {
    product: ShopProduct;
    isLoggedIn: boolean;
    balance: number | null;
    busy: boolean;
    onBuy: () => void;
}) {
    const soldOut = isSoldOut(product);
    const forPoints = canBuyForPoints(product);
    const forMoney = canBuyForMoney(product);
    const notEnough =
        forPoints && balance !== null && product.price_points !== null && balance < product.price_points;

    return (
        <div className="flex flex-col bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden">
            <div className="relative w-full aspect-[4/3] bg-primary/5">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        // Фото приходить із довільного сайту, тому не проганяємо
                        // його через оптимізатор: той пускає лише хости з
                        // next.config.ts і на чуже посилання відповів би 400.
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-primary/20">
                        <ImageOff size={28} />
                    </span>
                )}

                {!product.active && (
                    <span className="absolute top-3 left-3 text-[10px] font-manrope font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary text-background">
                        Прихований
                    </span>
                )}
                {soldOut && (
                    <span className="absolute top-3 right-3 text-[10px] font-manrope font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-accent text-background">
                        Немає
                    </span>
                )}
            </div>

            <div className="flex flex-col flex-1 p-5">
                <h3 className="font-manrope font-bold text-primary">{product.title}</h3>

                {product.description && (
                    <p className="text-sm text-primary/60 mt-1.5 leading-relaxed whitespace-pre-line">
                        {product.description}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3">
                    {product.price_points !== null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Coins size={12} className="text-accent" />
                            {formatPoints(product.price_points)}
                        </span>
                    )}
                    {product.price_uah !== null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/12 px-3 py-1 text-xs font-semibold text-primary">
                            <CreditCard size={12} className="text-secondary" />
                            {formatUah(product.price_uah)}
                        </span>
                    )}
                    {product.stock !== null && !soldOut && (
                        <span className="text-xs text-primary/40">лишилось {product.stock}</span>
                    )}
                </div>

                <div className="flex flex-col gap-2 mt-auto pt-4">
                    {forPoints && (
                        <button
                            onClick={onBuy}
                            disabled={busy || !isLoggedIn || notEnough}
                            title={
                                !isLoggedIn
                                    ? 'Увійдіть, щоб купувати за бали'
                                    : notEnough
                                        ? 'Не вистачає балів'
                                        : undefined
                            }
                            className="inline-flex items-center justify-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-40"
                        >
                            {busy ? <Loader2 size={15} className="animate-spin" /> : <Coins size={15} />}
                            {notEnough ? 'Не вистачає балів' : 'Купити за бали'}
                        </button>
                    )}

                    {forMoney && product.form_url && (
                        <a
                            href={product.form_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 border border-primary/20 text-primary font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/5 transition-colors"
                        >
                            <ExternalLink size={15} />
                            Купити за гроші
                        </a>
                    )}

                    {!forPoints && !forMoney && (
                        <p className="text-xs text-primary/40 text-center py-1">
                            {soldOut ? 'Товар закінчився' : 'Купівля тимчасово недоступна'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
