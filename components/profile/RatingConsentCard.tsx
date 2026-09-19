'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';
import { CONSENT_LABEL, CONSENT_NOTE, POLOZHENNIA_URL } from '@/lib/consent';

/**
 * Прохання дати згоду на участь у рейтингах — для акаунтів, створених до
 * того, як галочка з'явилася у формі реєстрації (п. 10.1.2 Положення).
 * Тим, хто вже погодився, блок не показується взагалі.
 */
export default function RatingConsentCard() {
    const router = useRouter();

    const [agreed, setAgreed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit() {
        setBusy(true);
        setError(null);

        try {
            const res = await fetch('/api/v1/rating/consent', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти згоду');
                return;
            }

            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="bg-accent/[0.07] border border-accent/30 rounded-none p-6">
            <h3 className="flex items-center gap-2 font-manrope font-bold text-primary text-sm mb-3">
                <span className="text-accent">
                    <ShieldCheck size={16} />
                </span>
                Згода на участь у рейтингах
            </h3>

            <p className="text-sm text-primary/85 leading-relaxed mb-4">
                Ваш акаунт створено до того, як з&apos;явилася ця вимога. За п. 10.1.2
                Положення учня можна враховувати в ліцейських рейтингах лише за його
                добровільною згодою.
            </p>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-none px-4 py-3 mb-4">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <label className="flex items-start gap-3 rounded-none border border-primary/10 bg-background/60 p-3.5 cursor-pointer">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 shrink-0 rounded-none border-primary/25 accent-primary cursor-pointer"
                />
                <span className="text-xs text-primary/85 leading-relaxed">
                    {CONSENT_LABEL}{' '}
                    <Link
                        href={POLOZHENNIA_URL}
                        target="_blank"
                        className="font-semibold text-primary underline underline-offset-2 hover:text-accent transition-colors"
                    >
                        Читати Положення
                    </Link>
                    <span className="mt-1.5 block text-[13px] text-primary/65">
                        {CONSENT_NOTE}
                    </span>
                </span>
            </label>

            <button
                onClick={submit}
                disabled={busy || !agreed}
                className="mt-4 inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-none px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Погоджуюся
            </button>
        </div>
    );
}
