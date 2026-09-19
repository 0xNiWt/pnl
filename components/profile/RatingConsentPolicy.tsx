'use client';

import { useState } from 'react';
import { Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';

/**
 * Строгий режим за п. 10.1.2 Положення: чи виключати з рейтингів учнів,
 * які не дали згоди. Поки вимкнено, у рейтингах лишаються всі — щоб таблиці
 * не спорожніли того ж дня, коли з'явилася вимога згоди.
 */
export default function RatingConsentPolicy({
    initialEnforced,
    consented,
    totalStudents,
}: {
    initialEnforced: boolean;
    consented: number;
    totalStudents: number;
}) {
    const [enforced, setEnforced] = useState(initialEnforced);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const without = Math.max(totalStudents - consented, 0);

    async function toggle() {
        const next = !enforced;
        setBusy(true);
        setError(null);

        try {
            const res = await fetch('/api/v1/rating/consent', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enforced: next }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти');
                return;
            }

            setEnforced(next);
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-none px-4 py-3">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex items-center justify-between gap-4 bg-primary/[0.04] border border-primary/10 rounded-none px-5 py-4">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 font-manrope font-bold text-primary text-sm">
                        <ShieldCheck size={15} className="text-accent" />
                        Враховувати лише учнів зі згодою
                    </p>
                    <p className="text-xs text-primary/70 mt-1">
                        {enforced
                            ? 'Увімкнено: у рейтингах лише ті, хто дав згоду.'
                            : 'Вимкнено: у рейтингах поки що всі учні.'}
                    </p>
                </div>

                <button
                    onClick={toggle}
                    disabled={busy}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-none px-4 py-2 text-sm font-manrope font-semibold transition-colors disabled:opacity-50 ${enforced
                        ? 'bg-primary/5 text-primary/85 hover:bg-primary/10'
                        : 'bg-primary text-background hover:bg-primary/90'
                        }`}
                >
                    {busy && <Loader2 size={15} className="animate-spin" />}
                    {enforced ? 'Вимкнути' : 'Увімкнути'}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Stat value={consented} label="дали згоду" />
                <Stat value={without} label="ще не дали" tone={without > 0 ? 'warn' : 'calm'} />
            </div>

            <p className="text-xs text-primary/65 max-w-2xl">
                Учні без згоди не потрапляють ані до індивідуальних рейтингів, ані до
                показників свого класу (пп. 10.1.2 і 10.2.2 Положення) і не можуть
                претендувати на нагороди, критерії яких спираються на рейтинги
                (п. 10.1.3). Вмикати строгий режим варто тоді, коли більшість уже
                погодилася: решта побачить прохання про згоду в кабінеті.
            </p>

            <p className="text-xs text-primary/65 max-w-2xl">
                Відкликати згоду через сайт не можна: за п. 10.1.4 це робиться
                виключно письмовою заявою на ім&apos;я директора.
            </p>
        </div>
    );
}

function Stat({
    value,
    label,
    tone = 'calm',
}: {
    value: number;
    label: string;
    tone?: 'calm' | 'warn';
}) {
    return (
        <div className="rounded-none border border-primary/10 bg-primary/[0.03] px-5 py-4">
            <p
                className={`font-manrope font-bold text-2xl ${tone === 'warn' ? 'text-accent' : 'text-primary'
                    }`}
            >
                {value}
            </p>
            <p className="text-xs text-primary/70 mt-0.5">{label}</p>
        </div>
    );
}
