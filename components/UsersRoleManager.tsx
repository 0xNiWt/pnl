"use client";

import { useState } from 'react';
import { assignableRoles, type Role } from '@/lib/rolesClient';
import { Check, X } from 'lucide-react';

type Profile = {
    id: string;
    full_name: string | null;
    roles: Role[] | null;
    created_at: string;
};

const ROLE_LABELS: Record<Role, string> = {
    student: 'Учень',
    teacher: 'Педагог',
    editor: 'Редактор новин',
    moderator: 'Модератор',
    owner: 'Адміністрація',
};

const ALL_ROLES: Role[] = ['student', 'teacher', 'editor', 'moderator', 'owner'];

export default function UsersRoleManager({
    currentUserId,
    actingRoles,
    initialProfiles,
}: {
    currentUserId: string;
    actingRoles: Role[];
    initialProfiles: Profile[];
}) {
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const myAssignable = assignableRoles(actingRoles);

    async function toggleRole(targetUserId: string, role: Role, has: boolean) {
        const key = `${targetUserId}-${role}`;
        setLoadingKey(key);
        setError(null);

        try {
            const res = await fetch(`/api/v1/users/${targetUserId}/roles`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, action: has ? 'remove' : 'add' }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? 'Не вдалося оновити роль');
                return;
            }

            setProfiles((prev) =>
                prev.map((p) => (p.id === targetUserId ? { ...p, roles: data.roles } : p))
            );
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setLoadingKey(null);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {error}
                </div>
            )}

            <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_3fr] gap-4 px-6 py-3 border-b border-primary/10 bg-primary/[0.03]">
                    <p className="text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50">
                        Користувач
                    </p>
                    <p className="text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50">
                        Ролі
                    </p>
                </div>

                <div className="flex flex-col divide-y divide-primary/10">
                    {profiles.map((profile) => {
                        const roles = profile.roles ?? [];
                        const isSelf = profile.id === currentUserId;

                        return (
                            <div
                                key={profile.id}
                                className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-3 md:gap-4 px-6 py-4"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-primary">
                                        {profile.full_name || 'Без імені'}
                                        {isSelf && (
                                            <span className="ml-2 text-xs font-normal text-primary/40">
                                                (це ви)
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {ALL_ROLES.map((role) => {
                                        const has = roles.includes(role);
                                        const canToggle = myAssignable.includes(role) && !isSelf;
                                        const key = `${profile.id}-${role}`;
                                        const isLoading = loadingKey === key;

                                        return (
                                            <button
                                                key={role}
                                                type="button"
                                                disabled={!canToggle || isLoading}
                                                onClick={() => toggleRole(profile.id, role, has)}
                                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors
                                                    ${has
                                                        ? 'bg-secondary/15 text-secondary'
                                                        : 'bg-primary/5 text-primary/40'}
                                                    ${canToggle ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed opacity-60'}
                                                `}
                                            >
                                                {has ? <Check size={12} /> : <X size={12} />}
                                                {ROLE_LABELS[role]}
                                                {isLoading && '…'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="text-xs text-primary/40 px-1">
                Роль учня видається автоматично під час реєстрації. Модератор може призначати ролі
                учня, педагога та редактора, але не роль модератора чи адміністрації. Ці дві ролі
                може призначати лише адміністрація.
            </p>
        </div>
    );
}
