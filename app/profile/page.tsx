import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/server';
import LogoutButton from '@/components/LogoutButton';
import {
    User, Mail, ShieldCheck, Calendar, Newspaper, Users,
    GraduationCap, Coins, TrendingUp, FileEdit, Settings,
    BarChart3, ClipboardList,
} from 'lucide-react';

type Role = 'student' | 'teacher' | 'editor' | 'moderator' | 'owner';

const ROLE_LABELS: Record<Role, string> = {
    student: 'Учень',
    teacher: 'Педагог',
    editor: 'Редактор новин',
    moderator: 'Модератор',
    owner: 'Адміністрація',
};

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, roles, created_at')
        .eq('id', user.id)
        .single();

    const roles = (profile?.roles ?? ['student']) as Role[];
    const roleLabelText = roles.map((r) => ROLE_LABELS[r]).join(' · ');
    const joinedDate = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    let ownerStats: { students: number; teachers: number; news: number } | null = null;
    if (roles.includes('owner') || roles.includes('moderator')) {
        const [studentsRes, teachersRes, newsRes] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }).contains('roles', ['student']),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).contains('roles', ['teacher']),
            supabase.from('news').select('id', { count: 'exact', head: true }).eq('published', true),
        ]);

        ownerStats = {
            students: studentsRes.count ?? 0,
            teachers: teachersRes.count ?? 0,
            news: newsRes.count ?? 0,
        };
    }

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-5xl mx-auto px-5 py-10 md:py-16">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                    <div>
                        <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                            <span className="w-5 h-px bg-secondary" />
                            {roleLabelText}
                        </span>
                        <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            {profile?.full_name || 'Профіль'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 bg-primary/[0.03] border border-primary/10 rounded-2xl px-5 py-3">
                        <span className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                            <Coins size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50">
                                Баланс
                            </p>
                            <p className="text-lg font-grotesk font-bold text-primary leading-none mt-0.5">
                                0 <span className="text-sm font-normal text-primary/50">балів</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

                    <div className="flex flex-col gap-6">
                        {roles.includes('student') && <StudentSection />}
                        {roles.includes('teacher') && <TeacherSection />}
                        {roles.includes('editor') && <EditorSection />}
                        {(roles.includes('owner') || roles.includes('moderator')) && <OwnerSection stats={ownerStats} />}
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6">
                            <h3 className="font-grotesk font-bold text-primary text-sm mb-4">
                                Дані акаунту
                            </h3>
                            <div className="flex flex-col">
                                <ProfileRow icon={<User className="w-4 h-4" />} label="Повне ім'я" value={profile?.full_name || '—'} />
                                <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email ?? '—'} />
                                <ProfileRow icon={<ShieldCheck className="w-4 h-4" />} label="Ролі" value={roleLabelText} />
                                {joinedDate && (
                                    <ProfileRow icon={<Calendar className="w-4 h-4" />} label="Реєстрація" value={joinedDate} />
                                )}
                            </div>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function StudentSection() {
    return (
        <SectionCard title="Мій рейтинг" icon={<TrendingUp size={16} />}>
            <div className="flex items-center justify-between py-2">
                <div>
                    <p className="text-3xl font-grotesk font-bold text-primary">—</p>
                    <p className="text-sm text-primary/50 mt-1">місце в рейтингу школи</p>
                </div>
                <Link
                    href="/rating"
                    className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
                >
                    Переглянути →
                </Link>
            </div>
            <div className="pt-3 mt-1 border-t border-primary/10">
                <QuickAction label="За що нараховано бали" href="/profile/rating/history" />
            </div>
        </SectionCard>
    );
}

function TeacherSection() {
    return null;
}

function EditorSection() {
    return (
        <SectionCard title="Керування новинами" icon={<Newspaper size={16} />}>
            <p className="text-sm text-primary/60 mb-4">
                Публікуйте, редагуйте та видаляйте новини сайту.
            </p>
            <div className="flex flex-col gap-2">
                <QuickAction label="Усі новини" href="/profile/news" icon={<Newspaper size={15} />} />
                <QuickAction label="Створити новину" href="/profile/news/new" icon={<FileEdit size={15} />} />
            </div>
        </SectionCard>
    );
}

function OwnerSection({ stats }: { stats: { students: number; teachers: number; news: number } | null }) {
    return (
        <>
            <SectionCard title="Огляд системи" icon={<BarChart3 size={16} />}>
                <div className="grid grid-cols-3 gap-4 py-2">
                    <MiniStat value={stats ? String(stats.students) : "—"} label="учнів" />
                    <MiniStat value={stats ? String(stats.teachers) : "—"} label="вчителів" />
                    <MiniStat value={stats ? String(stats.news) : "—"} label="новин" />
                </div>
            </SectionCard>

            <SectionCard title="Керування" icon={<Settings size={16} />}>
                <div className="flex flex-col gap-2">
                    <QuickAction label="Керування новинами" href="/profile/news" icon={<Newspaper size={15} />} />
                    <QuickAction label="Користувачі та ролі" href="/profile/users" icon={<Users size={15} />} />
                    <QuickAction label="Налаштування рейтингу" href="/profile/rating/settings" icon={<TrendingUp size={15} />} />
                    <QuickAction label="Вакансії" href="/profile/vacancies" icon={<ClipboardList size={15} />} />
                </div>
            </SectionCard>
        </>
    );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-grotesk font-bold text-primary text-sm mb-4">
                <span className="text-secondary">{icon}</span>
                {title}
            </h3>
            {children}
        </div>
    );
}

function QuickAction({ label, href, icon }: { label: string; href: string; icon?: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary/70 bg-primary/5 hover:bg-primary/10 hover:text-primary transition-colors"
        >
            {icon}
            {label}
        </Link>
    );
}

function MiniStat({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <p className="text-2xl font-grotesk font-bold text-primary">{value}</p>
            <p className="text-xs text-primary/50 mt-0.5">{label}</p>
        </div>
    );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 py-2.5 border-b border-primary/10 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/50 flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50">
                    {label}
                </p>
                <p className="text-sm font-medium text-primary">{value}</p>
            </div>
        </div>
    );
}