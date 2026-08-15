import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';
import OlympiadsManager from '@/components/OlympiadsManager';

export default async function OlympiadsPage() {
    const { user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManageUsers(roles)) redirect('/profile');

    const supabase = await createClient();

    const [{ data: profiles }, { data: scale }, { data: results }] = await Promise.all([
        supabase
            .from('profiles')
            .select('id, full_name, class')
            .contains('roles', ['student'])
            .order('full_name', { ascending: true }),
        supabase.from('olympiad_scale').select('level, place, points'),
        supabase
            .from('olympiad_results')
            .select('id, student_id, subject, level, place, points, created_at')
            .order('created_at', { ascending: false }),
    ]);

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-4xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Керування
                    </span>
                    <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Олімпіадний рейтинг
                    </h1>
                    <p className="text-sm text-primary/50 mt-2 max-w-2xl">
                        Здобутки на предметних олімпіадах та в конкурсі-захисті МАН
                        (п. 10.7.2 Статуту). Бали за кожен здобуток беруться зі шкали —
                        її можна змінити внизу сторінки.
                    </p>
                </div>

                <OlympiadsManager
                    initialProfiles={profiles ?? []}
                    initialScale={scale ?? []}
                    initialResults={results ?? []}
                />
            </div>
        </main>
    );
}
