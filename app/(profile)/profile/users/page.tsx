import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';
import UsersRoleManager from '@/components/profile/UsersRoleManager';

export default async function UsersEdit() {
    const { user, roles } = await getCurrentUserWithRoles();

    if (!user) redirect('/auth/login');
    if (!canManageUsers(roles)) redirect('/profile');

    const supabase = await createClient();
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, roles, created_at')
        .order('created_at', { ascending: false });

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
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Огляд системи
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Управління ролями
                    </h1>
                    <p className="text-sm text-primary/50 mt-2 max-w-2xl">
                        Ролі відповідають за права доступу в системі. Посади активу
                        (староста, фізорг, ПРСЛ тощо) призначаються окремо — на сторінці
                        «Учні та посади».
                    </p>
                </div>

                <UsersRoleManager
                    currentUserId={user.id}
                    actingRoles={roles}
                    initialProfiles={profiles ?? []}
                />
            </div>
        </main>
    );
}
