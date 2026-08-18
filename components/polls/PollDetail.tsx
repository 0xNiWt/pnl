'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Check,
    EyeOff,
    Loader2,
    Lock,
    PieChart,
    TriangleAlert,
    Trophy,
    Users,
    X,
} from 'lucide-react';
import {
    pollAudienceLabel,
    QUORUM,
    hasQuorum,
    optionPercent,
    pollWinners,
    turnoutPercent,
    type PollOptionResult,
    type PollScope,
} from '@/lib/voting';

type Poll = {
    id: string;
    title: string;
    description: string | null;
    scope: PollScope;
    class_name: string | null;
    position_id: string | null;
    status: 'open' | 'closed';
    is_anonymous: boolean;
    created_at: string;
    closed_at: string | null;
};

type Option = { id: string; label: string; sort_order: number };

export default function PollDetail({
    poll,
    options,
    hasVoted,
    isOrganizer,
    turnout,
    results,
}: {
    poll: Poll;
    options: Option[];
    hasVoted: boolean;
    isOrganizer: boolean;
    turnout: { voted: number; eligible: number };
    results: PollOptionResult[] | null;
}) {
    const router = useRouter();

    const [chosen, setChosen] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isClosed = poll.status === 'closed';
    const percent = turnoutPercent(turnout.voted, turnout.eligible);
    const quorumReached = hasQuorum(poll.scope, turnout.voted, turnout.eligible);

    const totalVotes = (results ?? []).reduce((sum, r) => sum + r.votes, 0);
    const winners = results ? pollWinners(results) : [];
    const winnerIds = new Set(winners.map((w) => w.option_id));

    async function vote() {
        if (!chosen) {
            setError('Обери варіант');
            return;
        }
        setBusy(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/polls/${poll.id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionId: chosen }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося проголосувати');
                return;
            }
            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    async function closePoll() {
        setBusy(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/polls/${poll.id}`, { method: 'PATCH' });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося закрити');
                return;
            }
            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    async function removePoll() {
        setBusy(true);
        setError(null);

        try {
            const res = await fetch(`/api/v1/polls/${poll.id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося видалити');
                return;
            }
            router.push('/profile/votes');
            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Шапка */}
            <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge>{pollAudienceLabel(poll)}</Badge>
                    <Badge icon={<EyeOff size={11} />}>
                        {poll.is_anonymous ? 'Таємне' : 'Архівне · створене як відкрите'}
                    </Badge>
                    <Badge tone={isClosed ? 'muted' : 'active'}>
                        {isClosed ? 'Завершено' : 'Триває'}
                    </Badge>
                </div>

                <h1 className="font-manrope font-bold text-2xl md:text-3xl text-primary tracking-tight">
                    {poll.title}
                </h1>
                {poll.description && (
                    <p className="text-sm text-primary/60 mt-2">{poll.description}</p>
                )}
            </div>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto shrink-0">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Явка */}
            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="flex items-center gap-2 text-xs font-manrope font-semibold uppercase tracking-wider text-primary/50">
                        <Users size={13} />
                        Явка
                    </p>
                    <p className="text-sm text-primary/60">
                        <b className="text-primary">{turnout.voted}</b> з {turnout.eligible}
                        <span className="text-primary/40"> · {percent}%</span>
                    </p>
                </div>

                <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${quorumReached ? 'bg-secondary' : 'bg-accent'
                            }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                </div>

                <p className="text-xs text-primary/45 mt-2">
                    Потрібно щонайменше {Math.round(QUORUM[poll.scope] * 100)}% (п. 3.6 Статуту).{' '}
                    {quorumReached ? (
                        <b className="text-secondary">Кворум набрано.</b>
                    ) : (
                        <b className="text-accent">Кворуму ще немає.</b>
                    )}
                </p>
            </div>

            {/* Голосування */}
            {!isClosed && !hasVoted && (
                <div className="bg-white/40 border border-primary/10 rounded-2xl p-5 flex flex-col gap-3">
                    <p className="flex items-start gap-2 text-xs text-primary/70 bg-secondary/[0.08] border border-secondary/25 rounded-xl px-3.5 py-2.5">
                        <EyeOff size={14} className="shrink-0 mt-0.5 text-secondary" />
                        Голосування таємне: твій вибір не зберігається поруч з іменем, тому
                        побачити, за що саме ти проголосував, не зможе ніхто.
                    </p>

                    <div className="flex flex-col gap-2">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setChosen(option.id)}
                                className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border text-sm transition-colors ${chosen === option.id
                                    ? 'border-secondary bg-secondary/10 text-primary'
                                    : 'border-primary/10 bg-white/60 hover:bg-primary/5 text-primary/80'
                                    }`}
                            >
                                <span
                                    className={`w-4 h-4 rounded-full border-2 shrink-0 ${chosen === option.id
                                        ? 'border-secondary bg-secondary'
                                        : 'border-primary/25'
                                        }`}
                                />
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={vote}
                        disabled={busy}
                        className="self-start inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                        Проголосувати
                    </button>
                    <p className="text-xs text-primary/40">
                        Голос можна віддати лише один раз — змінити його потім не вийде.
                    </p>
                </div>
            )}

            {!isClosed && hasVoted && (
                <div className="flex items-start gap-2.5 bg-secondary/[0.08] border border-secondary/25 rounded-2xl px-5 py-4">
                    <Check size={16} className="shrink-0 mt-0.5 text-secondary" />
                    <p className="text-sm text-primary/75">
                        Твій голос зараховано. Результати з&apos;являться тут, коли організатор
                        завершить голосування.
                    </p>
                </div>
            )}

            {/* Результати */}
            {isClosed && results && (
                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5">
                    <p className="flex items-center gap-2 text-xs font-manrope font-semibold uppercase tracking-wider text-primary/50 mb-4">
                        <Trophy size={13} />
                        Результати · {totalVotes} {totalVotes === 1 ? 'голос' : 'голосів'}
                    </p>

                    <div className="flex flex-col gap-3.5">
                        {results.map((r) => {
                            const share = optionPercent(r.votes, totalVotes);
                            const isWinner = winnerIds.has(r.option_id);

                            return (
                                <div key={r.option_id}>
                                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                                        <p className="text-sm text-primary flex items-center gap-2 min-w-0">
                                            <span className="truncate">{r.label}</span>
                                            {isWinner && (
                                                <span className="shrink-0 text-[10px] font-manrope font-bold uppercase tracking-wider text-secondary bg-secondary/15 px-2 py-0.5 rounded-full">
                                                    {winners.length > 1 ? 'Нічия' : 'Перемагає'}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm shrink-0">
                                            <b className="font-manrope text-primary">{share}%</b>
                                            <span className="text-primary/40"> · {r.votes}</span>
                                        </p>
                                    </div>

                                    <div className="h-3 rounded-full bg-primary/[0.07] overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${isWinner ? 'bg-secondary' : 'bg-primary/30'
                                                }`}
                                            style={{ width: `${share}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalVotes === 0 && (
                        <p className="text-sm text-primary/40 mt-3">
                            Ніхто не проголосував — рахувати нічого.
                        </p>
                    )}
                </div>
            )}

            {/* Поіменного списку немає й бути не може: сторінка навмисно
                не запитує зв'язок «хто за що». */}

            {/* Кругова діаграма — тільки організатору (та адміністрації
                з модератором, які теж вважаються організаторами). */}
            {isClosed && results && isOrganizer && totalVotes > 0 && (
                <ResultsDonut results={results} totalVotes={totalVotes} />
            )}

            {isClosed && (
                <p className="flex items-start gap-2 text-xs text-primary/50 px-1">
                    <Lock size={13} className="shrink-0 mt-0.5" />
                    {poll.is_anonymous
                        ? 'Голосування таємне — зв’язок «хто за що» не зберігався в базі, тому поіменного списку не існує ні в організатора, ні в адміністрації.'
                        : 'Це давнє голосування створювали за старими правилами як відкрите, але поіменний список більше не показується нікому.'}
                </p>
            )}

            {/* Дії організатора */}
            {isOrganizer && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                    {!isClosed && (
                        <button
                            onClick={closePoll}
                            disabled={busy}
                            className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {busy ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                            Завершити голосування
                        </button>
                    )}

                    <button
                        onClick={removePoll}
                        disabled={busy}
                        className="text-xs font-semibold text-primary/45 hover:text-accent transition-colors disabled:opacity-50"
                    >
                        Видалити голосування
                    </button>
                </div>
            )}

            {isOrganizer && !isClosed && (
                <p className="text-xs text-primary/40 px-1">
                    Поки голосування триває, результатів не бачить ніхто — навіть ти. Так
                    проміжні цифри не впливають на тих, хто ще не голосував.
                </p>
            )}
        </div>
    );
}

// Кольори сегментів — з палітри сайту, по колу, якщо варіантів більше шести.
const DONUT_COLORS = ['#63A8CC', '#C79D5A', '#1C2D56', '#ECD792', '#8FB9A8', '#B07C9E'];

/**
 * Кругова діаграма розподілу голосів. Показуємо її лише організатору:
 * поіменний список і так бачить тільки він, а тут — та сама картина
 * у відсотках, зручна для протоколу.
 */
function ResultsDonut({
    results,
    totalVotes,
}: {
    results: PollOptionResult[];
    totalVotes: number;
}) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    const counted = results.filter((r) => r.votes > 0);

    const segments = counted.map((r, i) => {
        // Скільки кола вже зайняли попередні сегменти — з цього місця
        // починається поточний.
        const votesBefore = counted.slice(0, i).reduce((sum, x) => sum + x.votes, 0);

        return {
            ...r,
            color: DONUT_COLORS[i % DONUT_COLORS.length],
            length: (r.votes / totalVotes) * circumference,
            offset: -(votesBefore / totalVotes) * circumference,
            percent: optionPercent(r.votes, totalVotes),
        };
    });

    return (
        <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5">
            <p className="flex items-center gap-2 text-xs font-manrope font-semibold uppercase tracking-wider text-primary/50 mb-4">
                <PieChart size={13} />
                Розподіл голосів
                <span className="ml-auto normal-case tracking-normal font-medium text-primary/40">
                    видно лише організатору
                </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
                <svg viewBox="0 0 180 180" className="w-40 h-40 shrink-0">
                    {/* Повертаємо тільки кільце, щоб перший сегмент починався
                        згори; підпис усередині лишається рівним. */}
                    <g transform="rotate(-90 90 90)">
                        <circle
                            cx="90"
                            cy="90"
                            r={radius}
                            fill="none"
                            stroke="rgba(28,45,86,0.07)"
                            strokeWidth="26"
                        />
                        {segments.map((s) => (
                            <circle
                                key={s.option_id}
                                cx="90"
                                cy="90"
                                r={radius}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="26"
                                strokeDasharray={`${s.length} ${circumference - s.length}`}
                                strokeDashoffset={s.offset}
                            />
                        ))}
                    </g>
                    <text
                        x="90"
                        y="84"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-primary font-manrope"
                        fontSize="26"
                        fontWeight="700"
                    >
                        {totalVotes}
                    </text>
                    <text
                        x="90"
                        y="104"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-primary/50"
                        fontSize="11"
                    >
                        голосів
                    </text>
                </svg>

                <div className="flex flex-col gap-2 w-full min-w-0">
                    {segments.map((s) => (
                        <div key={s.option_id} className="flex items-center gap-2.5 min-w-0">
                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: s.color }}
                            />
                            <span className="text-sm text-primary truncate min-w-0 flex-1">
                                {s.label}
                            </span>
                            <span className="text-sm shrink-0">
                                <b className="font-manrope text-primary">{s.percent}%</b>
                                <span className="text-primary/40">
                                    {' · '}
                                    {s.votes} {s.votes === 1 ? 'голос' : 'голосів'}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Badge({
    children,
    icon,
    tone = 'muted',
}: {
    children: React.ReactNode;
    icon?: React.ReactNode;
    tone?: 'muted' | 'active';
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-manrope font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${tone === 'active' ? 'bg-secondary/15 text-secondary' : 'bg-primary/5 text-primary/50'
                }`}
        >
            {icon}
            {children}
        </span>
    );
}
