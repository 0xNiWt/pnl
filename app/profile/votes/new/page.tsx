import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles } from '@/lib/roles';
import { pollScopesFor } from '@/lib/voting';
import PollCreateForm from '@/components/PollCreateForm';

export default async function NewPollPage() {
    const { user, roles } = await getCurrentUserWithRoles();
    if (!user) redirect('/auth/login');

    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('class, positions')
        .eq('id', user.id)
        .single();

    const positions = (profile?.positions ?? []) as string[];
    const scopes = pollScopesFor(positions, roles);

    // Немає жодного дозволеного масштабу — на сторінці робити нічого.
    if (scopes.length === 0) redirect('/profile/votes');

    const isAdmin = roles.includes('owner') || roles.includes('moderator');

    // Адміністрація може створювати для будь-якого класу, староста — лише для свого.
    const { data: classRows } = isAdmin
        ? await supabase.from('profiles').select('class').not('class', 'is', null)
        : { data: null };

    const allClasses = isAdmin
        ? Array.from(new Set((classRows ?? []).map((r) => r.class as string)))
        : [];

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-2xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile/votes"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до голосувань
                </Link>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Нове голосування
                    </span>
                    <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Створити голосування
                    </h1>
                </div>

                <PollCreateForm
                    scopes={scopes}
                    myClass={profile?.class ?? null}
                    allClasses={allClasses}
                />
            </div>
        </main>
    );
}
