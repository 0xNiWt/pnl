import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Vote } from 'lucide-react';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles } from '@/lib/roles';
import { canCreatePolls, POLL_SCOPE_LABELS, type PollScope } from '@/lib/voting';

export const dynamic = 'force-dynamic';

type Poll = {
    id: string;
    title: string;
    scope: PollScope;
    class_name: string | null;
    status: 'open' | 'closed';
    is_anonymous: boolean;
    created_at: string;
};

export default async function VotesPage() {
    const { user, roles } = await getCurrentUserWithRoles();
    if (!user) redirect('/auth/login');

    const supabase = await createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('positions')
        .eq('id', user.id)
        .single();

    const positions = (profile?.positions ?? []) as string[];
    const mayCreate = canCreatePolls(positions, roles);

    // RLS сама віддасть лише ті голосування, які адресовані цьому учню.
    const { data: polls, error } = await supabase
        .from('polls')
        .select('id, title, scope, class_name, status, is_anonymous, created_at')
        .order('created_at', { ascending: false });

    // У яких я вже брав участь — щоб не пропонувати голосувати вдруге.
    const { data: myBallots } = await supabase.from('poll_ballots').select('poll_id');
    const votedIn = new Set((myBallots ?? []).map((b) => b.poll_id));

    const rows = (polls ?? []) as Poll[];
    const open = rows.filter((p) => p.status === 'open');
    const closed = rows.filter((p) => p.status === 'closed');

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-3xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                    <div>
                        <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                            <span className="w-5 h-px bg-secondary" />
                            Учнівське самоврядування
                        </span>
                        <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            Голосування
                        </h1>
                    </div>

                    {mayCreate && (
                        <Link
                            href="/profile/votes/new"
                            className="inline-flex items-center gap-2 bg-primary text-background font-grotesk font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors"
                        >
                            <Plus size={15} />
                            Створити голосування
                        </Link>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                        Не вдалося завантажити: {error.message}
                    </div>
                )}

                <Section title="Триває" polls={open} votedIn={votedIn} empty="Зараз активних голосувань немає." />
                <Section title="Завершені" polls={closed} votedIn={votedIn} empty="Завершених голосувань поки немає." />
            </div>
        </main>
    );
}

function Section({
    title,
    polls,
    votedIn,
    empty,
}: {
    title: string;
    polls: Poll[];
    votedIn: Set<string>;
    empty: string;
}) {
    return (
        <div className="mb-8">
            <h2 className="font-grotesk font-semibold text-sm text-primary/70 uppercase tracking-wide mb-3">
                {title}
            </h2>

            {polls.length === 0 ? (
                <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-8 text-center">
                    <p className="text-sm text-primary/40">{empty}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {polls.map((poll) => (
                        <Link
                            key={poll.id}
                            href={`/profile/votes/${poll.id}`}
                            className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-5 hover:bg-primary/[0.04] transition-colors flex items-start gap-4"
                        >
                            <span className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                                <Vote size={17} />
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-primary">{poll.title}</p>
                                <p className="text-xs text-primary/45 mt-1">
                                    {poll.scope === 'class'
                                        ? `Клас ${poll.class_name}`
                                        : POLL_SCOPE_LABELS.lyceum}
                                    {' · '}
                                    {poll.is_anonymous ? 'анонімне' : 'відкрите'}
                                    {' · '}
                                    {new Date(poll.created_at).toLocaleDateString('uk-UA', {
                                        day: 'numeric',
                                        month: 'long',
                                    })}
                                </p>
                            </div>

                            <span className="shrink-0 text-[11px] font-grotesk font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/5 text-primary/50">
                                {poll.status === 'closed'
                                    ? 'Результати'
                                    : votedIn.has(poll.id)
                                        ? 'Ви проголосували'
                                        : 'Проголосувати'}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
