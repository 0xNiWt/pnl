import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import { getCurrentUserWithRoles, canManageUsers } from '@/lib/roles';
import UsersRoleManager from '@/components/UsersRoleManager';

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
                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Керування
                    </span>
                    <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Користувачі та ролі
                    </h1>
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
