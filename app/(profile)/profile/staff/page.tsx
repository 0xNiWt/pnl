import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { canManageStaff, getCurrentUserWithRoles } from '@/lib/roles';
import { getStaffRows } from '@/lib/staffData';
import { groupByDepartment } from '@/lib/staff';
import StaffManager from '@/components/profile/StaffManager';

export const dynamic = 'force-dynamic';

export default async function StaffAdminPage() {
    const { user, roles } = await getCurrentUserWithRoles();
    if (!user) redirect('/auth/login?redirectTo=/profile/staff');
    if (!canManageStaff(roles)) redirect('/profile');

    // Тут показуємо саме те, що в базі: якщо порожньо — список теж порожній,
    // щоб було видно, що міграцію ще не застосовано.
    const departments = groupByDepartment(await getStaffRows());

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-7xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/78 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-plex text-[12px] font-semibold uppercase tracking-[0.22em] text-secondary-deep mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Сторінка «Педагоги»
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Педагогічний колектив
                    </h1>
                    <p className="mt-3 text-sm text-primary/78 max-w-2xl leading-relaxed">
                        Тут можна додати нового вчителя, змінити посаду чи фото, переставити
                        людей у кафедрі або прибрати зі сторінки. Зміни одразу видно на
                        сторінці «Педагоги».
                    </p>
                </div>

                <StaffManager departments={departments} />
            </div>
        </main>
    );
}
