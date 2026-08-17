import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/server';
import LogoutButton from '@/components/profile/LogoutButton';
import { positionLabel } from '@/lib/positions';
import { canCreatePolls } from '@/lib/voting';
import { getMyRatingRow, type StudentRatingRow } from '@/lib/points';
import { getRatingVisibility } from '@/lib/ratingVisibility';
import { canManageRatingVisibility } from '@/lib/roles';
import {
    NOTHING_HIDDEN, RATING_LABELS, visibleRatings,
    type RatingKind, type RatingVisibility,
} from '@/lib/ratings';
import {
    User, Mail, ShieldCheck, Calendar, Newspaper, Users,
    Coins, TrendingUp, FileEdit, Settings,
    BarChart3, ClipboardList, Award, GraduationCap, Trophy,
    Vote, Plus, EyeOff, BookOpen,
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
        .select('full_name, roles, positions, created_at')
        .eq('id', user.id)
        .single();

    const roles = (profile?.roles ?? ['student']) as Role[];
    const positions = (profile?.positions ?? []) as string[];
    // Право створювати голосування дають посади (староста, представник РСЛ, ПРСЛ),
    // а не окремі ролі — див. lib/voting.ts.
    const mayCreatePolls = canCreatePolls(positions, roles);
    const roleLabelText = roles.map((r) => ROLE_LABELS[r]).join(' · ');
    const joinedDate = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    let pointsBalance = 0;
    let myRating: StudentRatingRow | null = null;
    let ratingHidden: RatingVisibility = NOTHING_HIDDEN;

    if (roles.includes('student')) {
        const [transactionsRes, ratingRow, visibility] = await Promise.all([
            supabase
                .from('point_transactions')
                .select('points')
                .eq('target', 'student')
                .eq('student_id', user.id),
            getMyRatingRow(user.id),
            getRatingVisibility(),
        ]);

        pointsBalance = (transactionsRes.data ?? []).reduce((sum, t) => sum + (t.points ?? 0), 0);
        myRating = ratingRow;
        ratingHidden = visibility;
    }

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
            <div className="w-full max-w-7xl mx-auto px-5 py-10 md:py-16">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                    <div>
                        <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                            <span className="w-5 h-px bg-secondary" />
                            {roleLabelText}
                        </span>
                        <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            {profile?.full_name || 'Профіль'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 bg-primary/[0.03] border border-primary/10 rounded-2xl px-5 py-3">
                        <span className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                            <Coins size={18} />
                        </span>
                        <div>
                            <p className="text-[11px] font-manrope font-semibold uppercase tracking-wider text-primary/50">
                                Баланс
                            </p>
                            <p className="text-lg font-manrope font-bold text-primary leading-none mt-0.5">
                                {pointsBalance} <span className="text-sm font-normal text-primary/50">балів</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

                    <div className="flex flex-col gap-6">
                        {roles.includes('student') && (
                            <StudentSection
                                rating={myRating}
                                hidden={ratingHidden}
                                canSeeHidden={canManageRatingVisibility(roles)}
                            />
                        )}
                        {(roles.includes('student') || mayCreatePolls) && (
                            <VotesSection mayCreate={mayCreatePolls} />
                        )}
                        {roles.includes('teacher') && <TeacherSection />}
                        {roles.includes('editor') && <EditorSection />}
                        {(roles.includes('owner') || roles.includes('moderator')) && <OwnerSection stats={ownerStats} />}
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6">
                            <h3 className="font-manrope font-bold text-primary text-sm mb-4">
                                Дані акаунту
                            </h3>
                            <div className="flex flex-col">
                                <ProfileRow icon={<User className="w-4 h-4" />} label="Повне ім'я" value={profile?.full_name || '—'} />
                                <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email ?? '—'} />
                                <ProfileRow icon={<ShieldCheck className="w-4 h-4" />} label="Ролі" value={roleLabelText} />
                                {/* Посаду показуємо учням (навіть якщо її ще нема)
                                    та будь-кому, у кого вона є. */}
                                {(roles.includes('student') || positions.length > 0) && (
                                    <ProfileRow
                                        icon={<Award className="w-4 h-4" />}
                                        label="Посада в активі"
                                        value={
                                            positions.length > 0
                                                ? positions.map((id) => positionLabel(id)).join(' · ')
                                                : 'Немає'
                                        }
                                    />
                                )}
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

// Місця учня за чотирма рейтингами (пп. 10.7.2 та 10.7.4 Статуту).
// Приховані адміністрацією рейтинги сюди не потрапляють.
function StudentSection({
    rating,
    hidden,
    canSeeHidden,
}: {
    rating: StudentRatingRow | null;
    hidden: RatingVisibility;
    canSeeHidden: boolean;
}) {
    const kinds = visibleRatings(hidden, canSeeHidden);
    const headline: RatingKind | undefined = kinds.includes('overall') ? 'overall' : kinds[0];

    return (
        <SectionCard title="Мій рейтинг" icon={<TrendingUp size={16} />}>
            {kinds.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-primary/50 py-2">
                    <EyeOff size={15} />
                    Рейтинги тимчасово приховані адміністрацією.
                </p>
            ) : (
                <>
                    <div className="flex items-center justify-between gap-4 py-2">
                        <div>
                            <p className="text-3xl font-manrope font-bold text-primary">
                                {rating && headline ? rating.places[headline] : '—'}
                            </p>
                            <p className="text-sm text-primary/50 mt-1">
                                {headline === 'overall'
                                    ? 'місце в загальному рейтингу ліцею'
                                    : `місце · ${headline ? RATING_LABELS[headline].toLowerCase() : ''}`}
                            </p>
                        </div>
                        <Link
                            href="/rating"
                            className="shrink-0 text-sm font-semibold text-secondary hover:text-primary transition-colors"
                        >
                            Переглянути →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-primary/10">
                        {kinds.map((kind) => (
                            <div
                                key={kind}
                                className="rounded-xl bg-primary/5 px-3.5 py-2.5"
                            >
                                <p className="flex items-center gap-1.5 text-[11px] font-manrope font-semibold uppercase tracking-wider text-primary/50">
                                    {RATING_LABELS[kind]}
                                    {hidden[kind] && <EyeOff size={11} className="text-accent" />}
                                </p>
                                <p className="font-manrope font-bold text-primary mt-0.5">
                                    {rating ? (
                                        <>
                                            {rating.places[kind]}
                                            <span className="text-xs font-normal text-primary/40"> місце</span>
                                        </>
                                    ) : (
                                        '—'
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-primary/10">
                <QuickAction label="За що нараховано бали" href="/profile/rating/history" icon={<Coins size={15} />} />
                <QuickAction label="Мої олімпіадні здобутки" href="/profile/rating/history#olympiads" icon={<Trophy size={15} />} />
            </div>
        </SectionCard>
    );
}

function VotesSection({ mayCreate }: { mayCreate: boolean }) {
    return (
        <SectionCard title="Голосування" icon={<Vote size={16} />}>
            <p className="text-sm text-primary/60 mb-4">
                Голосування класу та ліцею. Створювати їх можуть староста, представник РСЛ
                і ПРСЛ.
            </p>
            <div className="flex flex-col gap-2">
                <QuickAction
                    label="Переглянути голосування"
                    href="/profile/votes"
                    icon={<Vote size={15} />}
                />
                {mayCreate && (
                    <QuickAction
                        label="Створити голосування"
                        href="/profile/votes/new"
                        icon={<Plus size={15} />}
                    />
                )}
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
                <div className="pt-3 mt-1 border-t border-primary/10">
                    <QuickAction label="Весь список учнів" href="/profile/students/list" icon={<Users size={15} />} />
                </div>
            </SectionCard>

            <SectionCard title="Керування" icon={<Settings size={16} />}>
                <div className="flex flex-col gap-2">
                    <QuickAction label="Управління ролями" href="/profile/users" icon={<ShieldCheck size={15} />} />
                    <QuickAction label="Учні та посади" href="/profile/students" icon={<Award size={15} />} />
                    <QuickAction label="Керування новинами" href="/profile/news" icon={<Newspaper size={15} />} />
                    <QuickAction label="Нарахування балів" href="/profile/rating/settings" icon={<TrendingUp size={15} />} />
                    <QuickAction label="Навчальний рейтинг" href="/profile/rating/academic" icon={<GraduationCap size={15} />} />
                    <QuickAction label="Олімпіадний рейтинг" href="/profile/rating/olympiads" icon={<Trophy size={15} />} />
                    <QuickAction label="Перемоги на олімпіадах (сайт)" href="/profile/olympiads" icon={<BarChart3 size={15} />} />
                    <QuickAction label="Книга пам'яті" href="/profile/memory" icon={<BookOpen size={15} />} />
                    <QuickAction label="Видимість рейтингів" href="/profile/rating/visibility" icon={<EyeOff size={15} />} />
                    <QuickAction label="Вакансії" href="/profile/vacancies" icon={<ClipboardList size={15} />} />
                </div>
            </SectionCard>
        </>
    );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-manrope font-bold text-primary text-sm mb-4">
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
            <p className="text-2xl font-manrope font-bold text-primary">{value}</p>
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
                <p className="text-[11px] font-manrope font-semibold uppercase tracking-wider text-primary/50">
                    {label}
                </p>
                <p className="text-sm font-medium text-primary">{value}</p>
            </div>
        </div>
    );
}