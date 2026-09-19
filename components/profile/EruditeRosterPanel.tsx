'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Check, Loader2, Send, TriangleAlert, X } from 'lucide-react';
import {
    ROSTER_STATUS_LABELS,
    TEAM_SIZE,
    type EruditeGame,
    type EruditePerson,
    type EruditeRoster,
    type EruditeTeam,
} from '@/lib/erudite';

// Команда капітана. id = null — команди ще немає: база створить її для
// класу капітана разом із першою заявкою.
type CaptainTeam = Pick<EruditeTeam, 'name' | 'class_name' | 'captain_id' | 'members'> & { id: string | null };

/**
 * Заявки капітана: на кожну заплановану гру капітан обирає до п'яти
 * гравців зі свого класу, а президент клубу підтверджує заявку.
 * Планувати ігри й вносити результати капітан не може — це робить президент.
 */
export default function EruditeRosterPanel({
    teams,
    captainId,
    captainClass,
    games,
    rosters,
    people,
}: {
    teams: EruditeTeam[];
    captainId: string;
    captainClass: string | null;
    games: EruditeGame[];
    rosters: EruditeRoster[];
    people: EruditePerson[];
}) {
    const myTeams: CaptainTeam[] = teams.length
        ? teams
        : captainClass
            ? [{ id: null, name: captainClass, class_name: captainClass, captain_id: captainId, members: [captainId] }]
            : [];

    const personNames = useMemo(
        () => Object.fromEntries(people.map((p) => [p.id, p.full_name ?? 'Без імені'])),
        [people]
    );

    return (
        <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 font-manrope font-bold text-primary text-sm">
                <CalendarClock size={16} className="text-accent" />
                Заявки моєї команди на ігри
            </h2>

            <p className="text-sm text-primary/75 -mt-1">
                Оберіть до {TEAM_SIZE} гравців зі свого класу (п. 9.3.1). Заявку підтверджує президент клубу —
                після цього гравці автоматично стають учасниками клубу «Ерудит».
            </p>

            {myTeams.length === 0 ? (
                <Notice>У вашому профілі не вказано клас — зверніться до адміністрації, щоб подавати заявки.</Notice>
            ) : games.length === 0 ? (
                <Notice>
                    Запланованих ігор поки немає. Щойно президент клубу оголосить гру, тут можна буде подати заявку.
                </Notice>
            ) : (
                <div className="flex flex-col gap-3">
                    {games.map((game) =>
                        myTeams.map((team) => (
                            <RosterCard
                                key={`${game.id}-${team.id ?? 'new'}`}
                                game={game}
                                team={team}
                                roster={team.id ? rosters.find((r) => r.game_id === game.id && r.team_id === team.id) : undefined}
                                candidates={people
                                    .filter((p) => p.class === team.class_name || team.members.includes(p.id))
                                    .sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? '', 'uk'))}
                                personNames={personNames}
                            />
                        ))
                    )}
                </div>
            )}
        </section>
    );
}

function Notice({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-secondary/[0.08] border border-primary/10 px-5 py-6 text-sm text-primary/70">
            {children}
        </div>
    );
}

function RosterCard({
    game,
    team,
    roster,
    candidates,
    personNames,
}: {
    game: EruditeGame;
    team: CaptainTeam;
    roster?: EruditeRoster;
    candidates: EruditePerson[];
    personNames: Record<string, string>;
}) {
    const router = useRouter();
    const [editing, setEditing] = useState(!roster);
    const [players, setPlayers] = useState<string[]>(roster?.players ?? []);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function toggle(id: string) {
        setError(null);
        if (players.includes(id)) {
            setPlayers(players.filter((p) => p !== id));
        } else if (players.length >= TEAM_SIZE) {
            setError(`У заявці може бути не більше ${TEAM_SIZE} гравців (п. 9.3.1)`);
        } else {
            setPlayers([...players, id]);
        }
    }

    async function submit() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/erudite/rosters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: game.id, teamId: team.id, players }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error ?? 'Не вдалося подати заявку');
                return;
            }
            setEditing(false);
            router.refresh();
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
        } finally {
            setBusy(false);
        }
    }

    const statusTone =
        roster?.status === 'approved'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : roster?.status === 'rejected'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-accent/10 text-accent border-accent/30';

    return (
        <div className="bg-secondary/[0.08] border border-primary/10 p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="font-semibold text-primary">{game.title}</p>
                    <p className="text-xs text-primary/70">
                        {new Date(game.played_on).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
                        {' · '}команда «{team.name}»
                    </p>
                </div>
                {roster && (
                    <span className={`border px-2.5 py-1 font-plex text-[10px] uppercase tracking-wider ${statusTone}`}>
                        {ROSTER_STATUS_LABELS[roster.status]}
                    </span>
                )}
            </div>

            {roster?.status === 'rejected' && roster.note && (
                <p className="text-sm text-red-700">Коментар президента: {roster.note}</p>
            )}

            {!editing && roster ? (
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-primary/85 flex-1 min-w-0">
                        {roster.players.map((id) => personNames[id] ?? '—').join(', ')}
                    </p>
                    <button
                        onClick={() => {
                            setPlayers(roster.players);
                            setEditing(true);
                        }}
                        className="text-sm font-semibold text-accent hover:text-primary transition-colors"
                    >
                        Змінити заявку
                    </button>
                </div>
            ) : (
                <>
                    {candidates.length === 0 ? (
                        <p className="text-sm text-primary/70">У вашому класі ще немає зареєстрованих учнів.</p>
                    ) : (
                        <div className="grid gap-1.5 sm:grid-cols-2">
                            {candidates.map((p) => {
                                const checked = players.includes(p.id);
                                return (
                                    <label
                                        key={p.id}
                                        className={`flex items-center gap-2 px-3 py-2 text-sm border cursor-pointer transition-colors ${checked ? 'border-accent/50 bg-accent/[0.07] text-primary' : 'border-primary/10 text-primary/80'
                                            }`}
                                    >
                                        <input type="checkbox" checked={checked} onChange={() => toggle(p.id)} />
                                        <span className="truncate">{p.full_name ?? 'Без імені'}</span>
                                        {p.id === team.captain_id && (
                                            <span className="ml-auto font-plex text-[9px] uppercase tracking-wider text-accent">капітан</span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {error && (
                        <p className="flex items-start gap-2 text-sm text-red-700">
                            <TriangleAlert size={15} className="shrink-0 mt-0.5" />
                            {error}
                        </p>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={submit}
                            disabled={busy || players.length === 0}
                            className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                            {roster ? 'Подати повторно' : 'Подати заявку'} · {players.length}/{TEAM_SIZE}
                        </button>
                        {roster && (
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setError(null);
                                }}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-primary/70 hover:text-primary transition-colors"
                            >
                                <X size={14} />
                                Скасувати
                            </button>
                        )}
                    </div>

                    {roster?.status === 'approved' && (
                        <p className="flex items-center gap-1.5 text-xs text-primary/70">
                            <Check size={13} />
                            Після зміни заявка знову піде на підтвердження президенту.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
