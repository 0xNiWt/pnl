import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles } from '@/lib/roles';
import PollDetail from '@/components/polls/PollDetail';
import type { PollScope } from '@/lib/voting';

export const dynamic = 'force-dynamic';

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { user, roles } = await getCurrentUserWithRoles();
    if (!user) redirect('/auth/login');

    const supabase = await createClient();

    const { data: poll } = await supabase
        .from('polls')
        .select('id, title, description, scope, class_name, position_id, status, is_anonymous, created_by, created_at, closed_at')
        .eq('id', id)
        .maybeSingle();

    if (!poll) notFound();

    const { data: options } = await supabase
        .from('poll_options')
        .select('id, label, sort_order')
        .eq('poll_id', id)
        .order('sort_order', { ascending: true });

    const { data: myBallot } = await supabase
        .from('poll_ballots')
        .select('poll_id')
        .eq('poll_id', id)
        .maybeSingle();

    const { data: turnoutRows } = await supabase.rpc('poll_turnout', { p_poll_id: id });
    const turnout = Array.isArray(turnoutRows) ? turnoutRows[0] : turnoutRows;

    const isOrganizer =
        poll.created_by === user.id || roles.includes('owner') || roles.includes('moderator');
    const isClosed = poll.status === 'closed';

    // Результати з'являються лише після закриття (п. 3.6 Статуту).
    const { data: results } = isClosed
        ? await supabase.rpc('poll_results', { p_poll_id: id })
        : { data: null };

    // Поіменного списку не запитуємо взагалі: усі голосування таємні, тому
    // «хто за що» не показуємо нікому — ні організатору, ні адміністрації.

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-2xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile/votes"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Усі голосування
                </Link>

                <PollDetail
                    poll={{
                        id: poll.id,
                        title: poll.title,
                        description: poll.description,
                        scope: poll.scope as PollScope,
                        class_name: poll.class_name,
                        position_id: poll.position_id,
                        status: poll.status,
                        is_anonymous: poll.is_anonymous,
                        created_at: poll.created_at,
                        closed_at: poll.closed_at,
                    }}
                    options={options ?? []}
                    hasVoted={Boolean(myBallot)}
                    isOrganizer={isOrganizer}
                    turnout={{
                        voted: turnout?.voted ?? 0,
                        eligible: turnout?.eligible ?? 0,
                    }}
                    results={results ?? null}
                />
            </div>
        </main>
    );
}
