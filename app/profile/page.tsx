import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import Header from "@/components/Header";
import { User, Mail, ShieldCheck, Calendar } from 'lucide-react';

export default async function ProfilePage() {
    const supabase = await createClient();

    // middleware вже захищає цей роут, але дублюємо перевірку
    // на випадок прямого виклику Server Component / зміни middleware
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Дані з таблиці profiles (full_name, role і тд)
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, created_at')
        .eq('id', user.id)
        .single();

    const joinedDate = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('uk-UA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null;

    return (
        <main className="bg-background min-h-screen flex flex-col font-inter selection:bg-primary selection:text-background">
            <Header />

            <div className="flex-1 flex items-center justify-center px-5 py-10 md:py-16">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                            <span className="w-5 h-px bg-secondary" />
                            Особистий кабінет
                            <span className="w-5 h-px bg-secondary" />
                        </span>
                        <h1 className="font-grotesk font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            {profile?.full_name || 'Профіль'}
                        </h1>
                    </div>

                    <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm space-y-4">
                        <ProfileRow icon={<User className="w-4 h-4" />} label="Повне ім'я" value={profile?.full_name || '—'} />
                        <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email ?? '—'} />
                        <ProfileRow icon={<ShieldCheck className="w-4 h-4" />} label="Роль" value={profile?.role ?? 'student'} />
                        {joinedDate && (
                            <ProfileRow icon={<Calendar className="w-4 h-4" />} label="Дата реєстрації" value={joinedDate} />
                        )}
                    </div>
                </div>
            </div>
        </main>
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
