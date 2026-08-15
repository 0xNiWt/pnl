'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Check,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    TriangleAlert,
    Trophy,
    Users,
    X,
} from 'lucide-react';
import {
    POLL_SCOPE_LABELS,
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
    status: 'open' | 'closed';
    is_anonymous: boolean;
    created_at: string;
    closed_at: string | null;
};

type Option = { id: string; label: string; sort_order: number };

type Voter = { voter_name: string; voter_class: string | null; option_label: string };

export default function PollDetail({
    poll,
    options,
    hasVoted,
    isOrganizer,
    turnout,
    results,
    voters,
}: {
    poll: Poll;
    options: Option[];
    hasVoted: boolean;
    isOrganizer: boolean;
    turnout: { voted: number; eligible: number };
    results: PollOptionResult[] | null;
    voters: Voter[] | null;
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
                    <Badge>
                        {poll.scope === 'class'
                            ? `Клас ${poll.class_name}`
                            : POLL_SCOPE_LABELS.lyceum}
                    </Badge>
                    <Badge icon={poll.is_anonymous ? <EyeOff size={11} /> : <Eye size={11} />}>
                        {poll.is_anonymous ? 'Анонімне' : 'Відкрите'}
                    </Badge>
                    <Badge tone={isClosed ? 'muted' : 'active'}>
                        {isClosed ? 'Завершено' : 'Триває'}
                    </Badge>
                </div>

                <h1 className="font-grotesk font-bold text-2xl md:text-3xl text-primary tracking-tight">
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
                    <p className="flex items-center gap-2 text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/50">
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
                    {!poll.is_anonymous && (
                        <p className="flex items-start gap-2 text-xs text-primary/70 bg-accent/10 border border-accent/25 rounded-xl px-3.5 py-2.5">
                            <Eye size={14} className="shrink-0 mt-0.5 text-accent" />
                            Це відкрите голосування: після його завершення організатор побачить,
                            який варіант ти обрав.
                        </p>
                    )}

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
                        className="self-start inline-flex items-center gap-2 bg-primary text-background font-grotesk font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
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
                    <p className="flex items-center gap-2 text-xs font-grotesk font-semibold uppercase tracking-wider text-primary/50 mb-4">
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
                                                <span className="shrink-0 text-[10px] font-grotesk font-bold uppercase tracking-wider text-secondary bg-secondary/15 px-2 py-0.5 rounded-full">
                                                    {winners.length > 1 ? 'Нічия' : 'Перемагає'}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm shrink-0">
                                            <b className="font-grotesk text-primary">{share}%</b>
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

            {/* Поіменний список */}
            {isClosed && voters && voters.length > 0 && (
                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-primary/10 bg-primary/[0.03] flex items-center gap-2">
                        <Eye size={14} className="text-accent" />
                        <p className="font-grotesk font-bold text-sm text-primary">
                            Хто як проголосував
                        </p>
                    </div>

                    <div className="flex flex-col divide-y divide-primary/10">
                        {voters.map((v, i) => (
                            <div key={`${v.voter_name}-${i}`} className="flex items-center gap-4 px-5 py-2.5">
                                <p className="text-sm text-primary min-w-0 flex-1 truncate">
                                    {v.voter_name}
                                    <span className="ml-2 text-xs text-primary/40">
                                        {v.voter_class ?? ''}
                                    </span>
                                </p>
                                <p className="text-sm font-medium text-secondary shrink-0">
                                    {v.option_label}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p className="px-5 py-3 text-xs text-primary/40 border-t border-primary/10">
                        Список видно лише організатору, бо голосування створювали як відкрите.
                    </p>
                </div>
            )}

            {isClosed && poll.is_anonymous && isOrganizer && (
                <p className="flex items-start gap-2 text-xs text-primary/50 px-1">
                    <Lock size={13} className="shrink-0 mt-0.5" />
                    Це анонімне голосування — зв&apos;язок «хто за що» не зберігався в базі,
                    тому поіменного списку не існує навіть у адміністрації.
                </p>
            )}

            {/* Дії організатора */}
            {isOrganizer && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                    {!isClosed && (
                        <button
                            onClick={closePoll}
                            disabled={busy}
                            className="inline-flex items-center gap-2 bg-primary text-background font-grotesk font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
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
            className={`inline-flex items-center gap-1.5 text-[11px] font-grotesk font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${tone === 'active' ? 'bg-secondary/15 text-secondary' : 'bg-primary/5 text-primary/50'
                }`}
        >
            {icon}
            {children}
        </span>
    );
}
