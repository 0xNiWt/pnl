import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';
import StudentsDirectory from '@/components/StudentsDirectory';

export default async function StudentsPage() {
    const { user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManageUsers(roles)) redirect('/profile');

    const supabase = await createClient();
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, class, roles, positions')
        .contains('roles', ['student'])
        .order('full_name', { ascending: true });

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-5xl mx-auto px-5 py-10 md:py-16">

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
                        Учні та посади
                    </h1>
                    <p className="text-sm text-primary/50 mt-2 max-w-2xl">
                        Посади активу за п. 1.2 Статуту. Вони не дають жодних прав у системі —
                        це позначка про те, хто чим займається в активі. Права роздаються
                        ролями на сторінці «Управління ролями».
                    </p>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        Не вдалося завантажити список: {error.message}
                    </div>
                ) : (
                    <StudentsDirectory initialProfiles={profiles ?? []} />
                )}
            </div>
        </main>
    );
}
