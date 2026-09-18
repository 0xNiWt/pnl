import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getEruditeAccess, getEruditeSeason } from '@/lib/eruditeData';
import { currentSeason, isSeason } from '@/lib/erudite';
import EruditeManager from '@/components/profile/EruditeManager';

export const dynamic = 'force-dynamic';

export default async function EruditeManagePage({
    searchParams,
}: {
    searchParams: Promise<{ season?: string }>;
}) {
    const { user, canManage } = await getEruditeAccess();
    if (!user) redirect('/auth/login');
    // Пп. 3.1.5 та 9.4.2: рейтинг веде президент клубу.
    if (!canManage) redirect('/profile/erudite');

    const { season: requested } = await searchParams;
    const season = isSeason(requested) ? requested : currentSeason();
    const data = await getEruditeSeason(season);

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-5xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href={`/profile/erudite?season=${encodeURIComponent(season)}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    До рейтингу
                </Link>

                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 font-plex text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary-deep mb-3">
                        <span className="w-5 h-px bg-secondary" />
                        Клуб «Ерудит» · {season}
                    </span>
                    <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                        Керування клубом
                    </h1>
                    <p className="mt-3 text-sm text-primary/60 max-w-2xl leading-relaxed">
                        Плануйте ігри, підтверджуйте заявки капітанів, вносьте результати й штрафи.
                        Місця, додаткові бали, штрафи за неявки й обидва рейтинги рахуються автоматично.
                    </p>
                </div>

                <EruditeManager
                    season={season}
                    teams={data.teams}
                    games={data.games}
                    results={data.results}
                    rosters={data.rosters}
                    penalties={data.penalties}
                    people={data.people}
                />
            </div>
        </main>
    );
}
