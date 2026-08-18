'use client';

import { useState } from 'react';
import { Check, Coins, Loader2, RotateCcw, TriangleAlert, Undo2, X } from 'lucide-react';
import {
    formatPoints,
    ORDER_STATUS_LABELS,
    type OrderStatus,
    type ShopOrder,
} from '@/lib/shop';

// Замовлення разом з іменем учня: ім'я підтягує сторінка окремим запитом,
// бо в самому замовленні лежить лише id покупця.
export type OrderRow = ShopOrder & { student_name: string; student_class: string | null };

const STATUS_STYLES: Record<OrderStatus, string> = {
    new: 'bg-accent/12 text-accent',
    issued: 'bg-secondary/15 text-secondary',
    cancelled: 'bg-primary/8 text-primary/40',
};

export default function ShopOrdersList({ initialOrders }: { initialOrders: OrderRow[] }) {
    const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<OrderStatus | 'all'>('new');

    async function setStatus(order: OrderRow, status: OrderStatus) {
        if (status === 'cancelled' && !confirm(`Скасувати замовлення? ${formatPoints(order.points_spent)} повернуться учню.`)) {
            return;
        }

        setBusyId(order.id);
        setError(null);

        try {
            const res = await fetch(`/api/v1/shop/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося змінити статус');
                return;
            }

            setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? { ...o, status } : o))
            );
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusyId(null);
        }
    }

    const counts = {
        all: orders.length,
        new: orders.filter((o) => o.status === 'new').length,
        issued: orders.filter((o) => o.status === 'issued').length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };

    const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

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

            <div className="inline-flex flex-wrap gap-1 rounded-full border border-primary/15 p-1 self-start">
                {(['new', 'issued', 'cancelled', 'all'] as const).map((key) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-1.5 rounded-full text-xs font-manrope font-semibold uppercase tracking-wide transition-colors ${
                            filter === key ? 'bg-primary text-background' : 'text-primary/60 hover:text-primary'
                        }`}
                    >
                        {key === 'all' ? 'Усі' : ORDER_STATUS_LABELS[key]}
                        <span className="ml-1.5 opacity-60">{counts[key]}</span>
                    </button>
                ))}
            </div>

            {shown.length === 0 ? (
                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-10 text-center">
                    <p className="text-sm text-primary/40">
                        {filter === 'new' ? 'Замовлень, що чекають видачі, немає.' : 'Тут порожньо.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {shown.map((order) => {
                        const busy = busyId === order.id;

                        return (
                            <div
                                key={order.id}
                                className="flex flex-wrap items-center gap-4 bg-primary/[0.02] border border-primary/10 rounded-2xl p-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-primary truncate">
                                        {order.product_title}
                                    </p>
                                    <p className="text-xs text-primary/50 mt-1">
                                        {order.student_name}
                                        {order.student_class ? ` · ${order.student_class}` : ''}
                                        {' · '}
                                        {new Date(order.created_at).toLocaleDateString('uk-UA', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary shrink-0">
                                    <Coins size={12} className="text-accent" />
                                    {formatPoints(order.points_spent)}
                                </span>

                                <span
                                    className={`shrink-0 text-[11px] font-manrope font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}
                                >
                                    {ORDER_STATUS_LABELS[order.status]}
                                </span>

                                <div className="flex items-center gap-2 shrink-0">
                                    {busy && <Loader2 size={15} className="animate-spin text-primary/40" />}

                                    {order.status === 'new' && (
                                        <>
                                            <button
                                                onClick={() => setStatus(order, 'issued')}
                                                disabled={busy}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-primary text-background px-4 py-1.5 text-xs font-manrope font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                                            >
                                                <Check size={13} />
                                                Видано
                                            </button>
                                            <button
                                                onClick={() => setStatus(order, 'cancelled')}
                                                disabled={busy}
                                                className="text-xs font-semibold text-primary/45 hover:text-accent transition-colors disabled:opacity-50"
                                            >
                                                Скасувати
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'issued' && (
                                        <button
                                            onClick={() => setStatus(order, 'new')}
                                            disabled={busy}
                                            title="Повернути в чергу"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/45 hover:text-primary transition-colors disabled:opacity-50"
                                        >
                                            <Undo2 size={13} />
                                            У чергу
                                        </button>
                                    )}

                                    {order.status === 'cancelled' && (
                                        <button
                                            onClick={() => setStatus(order, 'new')}
                                            disabled={busy}
                                            title="Відновити замовлення — бали спишуться знову"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/45 hover:text-primary transition-colors disabled:opacity-50"
                                        >
                                            <RotateCcw size={13} />
                                            Відновити
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="text-xs text-primary/40 px-1">
                Скасування повертає бали учню автоматично: баланс рахує лише незаскасовані
                замовлення.
            </p>
        </div>
    );
}
