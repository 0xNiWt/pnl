import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { getEruditeAccess, getEruditeSeason } from '@/lib/eruditeData';
import {
    currentSeason,
    eruditeStats,
    isSeason,
    personalStandings,
    rankGame,
    teamStandings,
} from '@/lib/erudite';
import EruditeBoard from '@/components/profile/EruditeBoard';
import EruditeRosterPanel from '@/components/profile/EruditeRosterPanel';

export const dynamic = 'force-dynamic';

export default async function EruditePage({
    searchParams,
}: {
    searchParams: Promise<{ season?: string }>;
}) {
    const { user, positions, className, canView, canManage } = await getEruditeAccess();
    if (!user) redirect('/auth/login');
    // Бачать лише учасники клубу, капітани команд і президент (та адміністрація).
    if (!canView) redirect('/profile');

    const { season: requested } = await searchParams;
    const season = isSeason(requested) ? requested : currentSeason();

    const data = await getEruditeSeason(season);
    const rankable = new Set(data.rankablePeopleIds);
    const playedGames = data.games.filter((g) => g.status === 'played');
    const plannedGames = data.games.filter((g) => g.status === 'planned');

    const standings = teamStandings(data.teams, data.games, data.results, data.penalties);
    const people = personalStandings(
        data.teams,
        data.games,
        data.results,
        data.people.filter((p) => rankable.has(p.id))
    );

    const games = playedGames.map((game) => ({
        id: game.id,
        title: game.title,
        played_on: game.played_on,
        rows: rankGame(data.results.filter((r) => r.game_id === game.id)),
    }));

    const teamNames = Object.fromEntries(data.teams.map((t) => [t.id, t.name]));
    const personNames = Object.fromEntries(data.people.map((p) => [p.id, p.full_name ?? 'Без імені']));

    // Команди, де цей учень — капітан: для них показуємо заявки на ігри.
    // Капітан за посадою бачить заявки, навіть якщо команду ще не створено.
    const myTeams = data.teams.filter((t) => t.captain_id === user.id);
    const isCaptain = myTeams.length > 0 || positions.includes('erudite-captain');

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col font-inter">
            <div className="w-full max-w-6xl mx-auto px-5 py-10 md:py-16">

                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-2 font-plex text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary-deep mb-3">
                            <span className="w-5 h-px bg-secondary" />
                            Клуб інтелектуальних ігор · {season}
                        </span>
                        <h1 className="font-manrope font-bold text-3xl md:text-4xl text-primary tracking-tight">
                            Рейтинг «Ерудит»
                        </h1>
                        <p className="mt-3 text-sm text-primary/60 max-w-2xl leading-relaxed">
                            Окремий рейтинг клубу за розділом 9 Положення. Бачать лише учасники клубу,
                            капітани команд і президент клубу.
                        </p>
                    </div>

                    {canManage && (
                        <Link
                            href={`/profile/erudite/manage?season=${encodeURIComponent(season)}`}
                            className="inline-flex items-center gap-2 self-start md:self-auto bg-primary text-background font-manrope font-semibold text-sm px-5 py-2.5 hover:bg-primary/90 transition-colors"
                        >
                            <Settings size={15} />
                            Керування клубом
                        </Link>
                    )}
                </div>

                <div className="flex flex-col gap-10">
                    {isCaptain && (
                        <EruditeRosterPanel
                            teams={myTeams}
                            captainId={user.id}
                            captainClass={className}
                            games={plannedGames}
                            rosters={data.rosters}
                            people={data.people}
                        />
                    )}

                    <EruditeBoard
                        season={season}
                        seasons={data.seasons}
                        stats={eruditeStats(standings, data.games, data.participantsCount)}
                        standings={standings}
                        people={people}
                        games={games}
                        penalties={data.penalties}
                        teamNames={teamNames}
                        personNames={personNames}
                        currentUserId={user.id}
                    />
                </div>
            </div>
        </main>
    );
}
