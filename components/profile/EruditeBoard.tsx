'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Crown, Gamepad2, Trophy, User, Users } from 'lucide-react';
import {
    FREE_NO_SHOWS,
    PENALTY_REASONS,
    PLACE_POINTS,
    type EruditePenalty,
    type EruditeStats,
    type GameRow,
    type PersonStanding,
    type TeamStanding,
} from '@/lib/erudite';

export type BoardGame = {
    id: string;
    title: string;
    played_on: string;
    rows: GameRow[];
};

type Tab = 'teams' | 'personal';

export default function EruditeBoard({
    season,
    seasons,
    stats,
    standings,
    people,
    games,
    penalties,
    teamNames,
    personNames,
    currentUserId,
}: {
    season: string;
    seasons: string[];
    stats: EruditeStats;
    standings: TeamStanding[];
    people: PersonStanding[];
    games: BoardGame[];
    penalties: EruditePenalty[];
    teamNames: Record<string, string>;
    personNames: Record<string, string>;
    currentUserId: string;
}) {
    const [tab, setTab] = useState<Tab>('teams');

    return (
        <div className="flex flex-col gap-6">
            <StatTiles stats={stats} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex border border-primary/15 p-1">
                    <TabButton active={tab === 'teams'} onClick={() => setTab('teams')} icon={<Users size={14} />}>
                        Загальний
                    </TabButton>
                    <TabButton active={tab === 'personal'} onClick={() => setTab('personal')} icon={<User size={14} />}>
                        Персональний
                    </TabButton>
                </div>

                {seasons.length > 1 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-plex text-[10px] uppercase tracking-[0.18em] text-primary/60 mr-1">
                            Рік
                        </span>
                        {seasons.map((s) => (
                            <Link
                                key={s}
                                href={`/profile/erudite?season=${encodeURIComponent(s)}`}
                                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${s === season
                                    ? 'bg-primary text-background'
                                    : 'bg-primary/5 text-primary/78 hover:bg-primary/10 hover:text-primary'
                                    }`}
                            >
                                {s}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {tab === 'teams' ? (
                <>
                    <RatingMatrix standings={standings} games={games} />
                    <PenaltyList penalties={penalties} teamNames={teamNames} games={games} />
                </>
            ) : (
                <PersonalTable rows={people} currentUserId={currentUserId} />
            )}

            <GameHistory games={games} teamNames={teamNames} personNames={personNames} />

            <Rules />
        </div>
    );
}

// ---------------------------------------------------------------------
// Показники
// ---------------------------------------------------------------------

export function StatTiles({ stats }: { stats: EruditeStats }) {
    const leaderText = stats.leaders.length
        ? stats.leaders.map((l) => (l.className ? `${l.name} (${l.className})` : l.name)).join(', ')
        : '—';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Tile icon={<Gamepad2 size={16} />} label="Ігор відбулося" value={String(stats.gamesPlayed)} />
            <Tile icon={<Users size={16} />} label="Учасників клубу" hint="разом із капітанами" value={String(stats.participants)} />
            <Tile icon={<Crown size={16} />} label="Лідер рейтингу" value={leaderText} small={stats.leaders.length > 0} />
        </div>
    );
}

function Tile({
    icon,
    label,
    value,
    hint,
    small,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    hint?: string;
    small?: boolean;
}) {
    return (
        <div className="bg-secondary/[0.08] border border-primary/10 px-5 py-4">
            <p className="flex items-center gap-2 font-plex text-[10px] uppercase tracking-[0.16em] text-primary/65">
                <span className="text-accent">{icon}</span>
                {label}
            </p>
            <p className={`mt-2 font-manrope font-bold text-primary leading-tight ${small ? 'text-lg' : 'text-3xl'}`}>
                {value}
            </p>
            {hint && <p className="text-xs text-primary/60 mt-0.5">{hint}</p>}
        </div>
    );
}

// ---------------------------------------------------------------------
// Таблиця: рядки — ігри, стовпці — команди
// ---------------------------------------------------------------------

function RatingMatrix({ standings, games }: { standings: TeamStanding[]; games: BoardGame[] }) {
    if (standings.length === 0) {
        return <Empty>Команд цього року ще немає. Їх додає президент клубу.</Empty>;
    }

    return (
        <div className="bg-secondary/[0.08] border border-primary/10 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b border-primary/10">
                        <th className="sticky left-0 z-10 bg-[#f7f2e6] px-4 py-3 text-left font-plex text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/65 min-w-[170px]">
                            Гра
                        </th>
                        {standings.map((s) => (
                            <th key={s.team.id} className="px-2 py-3 text-center align-bottom min-w-[76px]">
                                <span className="block font-manrope font-bold text-primary">№{s.number}</span>
                                <span className="block text-[11px] font-normal text-primary/78 leading-tight">{s.team.name}</span>
                                {s.team.class_name && (
                                    <span className="block text-[10px] font-normal text-primary/60">{s.team.class_name}</span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {games.length === 0 && (
                        <tr>
                            <td colSpan={standings.length + 1} className="px-4 py-6 text-center text-primary/65">
                                Зіграних ігор ще немає.
                            </td>
                        </tr>
                    )}

                    {games.map((game, i) => (
                        <tr key={game.id} className="border-b border-primary/[0.06]">
                            <RowHead>
                                <span className="font-semibold text-primary">{i + 1}. {game.title}</span>
                                <span className="block text-[11px] text-primary/60">
                                    {new Date(game.played_on).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                                </span>
                            </RowHead>
                            {standings.map((s) => (
                                <td key={s.team.id} className="px-2 py-2.5 text-center">
                                    <PlaceCell cell={s.cells[game.id]} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>

                <tfoot>
                    <SummaryRow label="Додаткові бали" hint="п. 9.5.1">
                        {standings.map((s) => (
                            <td key={s.team.id} className="px-2 py-2.5 text-center tabular-nums text-primary/85">
                                {s.bonus > 0 ? `+${s.bonus}` : <span className="text-primary/25">0</span>}
                            </td>
                        ))}
                    </SummaryRow>

                    <SummaryRow label="Штрафні бали" hint="пп. 9.5.2 та рішення президента">
                        {standings.map((s) => (
                            <td
                                key={s.team.id}
                                className="px-2 py-2.5 text-center tabular-nums"
                                title={
                                    s.penalty > 0
                                        ? `За неявки: ${s.autoPenalty}, від президента: ${s.manualPenalty}`
                                        : undefined
                                }
                            >
                                {s.penalty > 0 ? <span className="text-red-600 font-semibold">−{s.penalty}</span> : <span className="text-primary/25">0</span>}
                            </td>
                        ))}
                    </SummaryRow>

                    <SummaryRow label="Сума балів" strong>
                        {standings.map((s) => (
                            <td key={s.team.id} className="px-2 py-3 text-center font-manrope font-bold text-lg text-primary tabular-nums">
                                {s.total}
                            </td>
                        ))}
                    </SummaryRow>

                    <SummaryRow label="Місце в рейтингу" strong>
                        {standings.map((s) => (
                            <td key={s.team.id} className="px-2 py-3 text-center">
                                <PlaceBadge place={s.place} />
                            </td>
                        ))}
                    </SummaryRow>
                </tfoot>
            </table>
        </div>
    );
}

function RowHead({ children }: { children: React.ReactNode }) {
    return (
        <th scope="row" className="sticky left-0 z-10 bg-[#f7f2e6] px-4 py-2.5 text-left font-normal align-middle">
            {children}
        </th>
    );
}

function SummaryRow({
    label,
    hint,
    strong,
    children,
}: {
    label: string;
    hint?: string;
    strong?: boolean;
    children: React.ReactNode;
}) {
    return (
        <tr className={`border-t ${strong ? 'border-primary/15 bg-secondary/[0.08]' : 'border-primary/10'}`}>
            <th scope="row" className={`sticky left-0 z-10 px-4 py-2.5 text-left ${strong ? 'bg-[#efe9dc]' : 'bg-[#f7f2e6]'}`}>
                <span className={`${strong ? 'font-bold text-primary' : 'font-semibold text-primary/85'}`}>{label}</span>
                {hint && <span className="block text-[10px] font-normal text-primary/60">{hint}</span>}
            </th>
            {children}
        </tr>
    );
}

function PlaceCell({ cell }: { cell?: { attended: boolean; place: number | null; points: number } }) {
    if (!cell) return <span className="text-primary/20">—</span>;
    if (!cell.attended) {
        return (
            <span className="inline-flex flex-col items-center" title="Неявка">
                <span className="font-plex text-[11px] font-bold text-red-600">Н</span>
            </span>
        );
    }

    return (
        <span className="inline-flex flex-col items-center gap-0.5">
            <PlaceBadge place={cell.place ?? 0} small />
            <span className="text-[10px] text-primary/65 tabular-nums">+{cell.points}</span>
        </span>
    );
}

function PlaceBadge({ place, small }: { place: number; small?: boolean }) {
    const tone =
        place === 1
            ? 'bg-accent text-background'
            : place > 0 && place <= 3
                ? 'bg-accent/15 text-accent'
                : 'bg-primary/5 text-primary/75';
    return (
        <span
            className={`inline-flex items-center justify-center font-manrope font-bold tabular-nums ${small ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'} ${tone}`}
        >
            {place || '—'}
        </span>
    );
}

function PenaltyList({
    penalties,
    teamNames,
    games,
}: {
    penalties: EruditePenalty[];
    teamNames: Record<string, string>;
    games: BoardGame[];
}) {
    if (penalties.length === 0) return null;
    const gameTitle = new Map(games.map((g) => [g.id, g.title]));

    return (
        <div className="bg-secondary/[0.08] border border-primary/10 px-5 py-4">
            <p className="font-plex text-[10px] uppercase tracking-[0.16em] text-primary/65 mb-3">Штрафи від президента клубу</p>
            <ul className="flex flex-col gap-2 text-sm">
                {penalties.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold text-red-600 tabular-nums">−{p.points}</span>
                        <span className="font-semibold text-primary">{teamNames[p.team_id] ?? '—'}</span>
                        <span className="text-primary/78">· {PENALTY_REASONS[p.reason]}</span>
                        {p.game_id && gameTitle.get(p.game_id) && (
                            <span className="text-primary/65">· {gameTitle.get(p.game_id)}</span>
                        )}
                        {p.note && <span className="text-primary/65">— {p.note}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ---------------------------------------------------------------------
// Персональний рейтинг
// ---------------------------------------------------------------------

function PersonalTable({ rows, currentUserId }: { rows: PersonStanding[]; currentUserId: string }) {
    if (rows.length === 0) {
        return <Empty>Персональних результатів ще немає — вони з’являться після першої гри.</Empty>;
    }

    return (
        <div className="bg-secondary/[0.08] border border-primary/10 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
                <thead>
                    <tr className="border-b border-primary/10 text-left">
                        <Th>Місце</Th>
                        <Th>Гравець</Th>
                        <Th right>Ігор</Th>
                        <Th right>1 місць</Th>
                        <Th right>Бали</Th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => {
                        const me = r.person.id === currentUserId;
                        return (
                            <tr
                                key={r.person.id}
                                className={`border-b border-primary/[0.07] last:border-0 ${me ? 'bg-accent/[0.07]' : ''}`}
                            >
                                <td className="px-4 py-3"><PlaceBadge place={r.place} /></td>
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-primary">
                                        {r.person.full_name ?? 'Без імені'}
                                        {me && <span className="ml-2 font-plex text-[10px] uppercase tracking-wider text-accent">це ви</span>}
                                    </p>
                                    <p className="text-xs text-primary/65">
                                        {[r.person.class, r.teams.join(', ')].filter(Boolean).join(' · ')}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums text-primary/85">{r.games}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-primary/85">{r.firsts}</td>
                                <td className="px-4 py-3 text-right font-manrope font-bold text-lg text-primary tabular-nums">
                                    {r.points}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ---------------------------------------------------------------------
// Дрібниці
// ---------------------------------------------------------------------

function TabButton({
    active,
    onClick,
    icon,
    children,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-4 py-2 font-plex text-[11px] uppercase tracking-[0.14em] transition-colors ${active ? 'bg-primary text-background' : 'text-primary/78 hover:text-primary'
                }`}
        >
            {icon}
            {children}
        </button>
    );
}

function Empty({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-secondary/[0.08] border border-primary/10 px-6 py-10 text-center">
            <p className="text-sm text-primary/65">{children}</p>
        </div>
    );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
    return (
        <th
            className={`px-4 py-3 font-plex text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/65 ${right ? 'text-right' : ''}`}
        >
            {children}
        </th>
    );
}

function GameHistory({
    games,
    teamNames,
    personNames,
}: {
    games: BoardGame[];
    teamNames: Record<string, string>;
    personNames: Record<string, string>;
}) {
    const [open, setOpen] = useState<string | null>(null);

    if (games.length === 0) return null;

    return (
        <div>
            <h2 className="flex items-center gap-2 font-manrope font-bold text-primary text-sm mb-3">
                <Trophy size={16} className="text-accent" />
                Результати ігор
            </h2>

            <div className="flex flex-col gap-2">
                {[...games].reverse().map((game) => {
                    const isOpen = open === game.id;
                    const winners = game.rows.filter((r) => r.place === 1);

                    return (
                        <div key={game.id} className="bg-secondary/[0.08] border border-primary/10">
                            <button
                                onClick={() => setOpen(isOpen ? null : game.id)}
                                aria-expanded={isOpen}
                                className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-secondary/[0.1] transition-colors"
                            >
                                <span className="font-plex text-[11px] text-primary/65 tabular-nums w-20 shrink-0">
                                    {new Date(game.played_on).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="block font-semibold text-primary truncate">{game.title}</span>
                                    {winners.length > 0 && (
                                        <span className="block text-xs text-primary/65 truncate">
                                            Перемога: {winners.map((w) => teamNames[w.team_id] ?? '—').join(', ')}
                                        </span>
                                    )}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`shrink-0 text-primary/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isOpen && (
                                <div className="border-t border-primary/10 overflow-x-auto">
                                    <table className="w-full min-w-[520px] text-sm">
                                        <thead>
                                            <tr className="text-left border-b border-primary/[0.07]">
                                                <Th>Місце</Th>
                                                <Th>Команда</Th>
                                                <Th right>Очки</Th>
                                                <Th right>Бали</Th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {game.rows.map((row) => (
                                                <tr key={row.team_id} className="border-b border-primary/[0.05] last:border-0 align-top">
                                                    <td className="px-4 py-2.5 tabular-nums text-primary/85">
                                                        {row.attended ? row.place : '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <p className="font-medium text-primary">{teamNames[row.team_id] ?? '—'}</p>
                                                        {row.attended ? (
                                                            row.players.length > 0 && (
                                                                <p className="text-xs text-primary/65">
                                                                    {row.players.map((id) => personNames[id] ?? '—').join(', ')}
                                                                </p>
                                                            )
                                                        ) : (
                                                            <p className="text-xs text-red-600">Неявка</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right tabular-nums text-primary/85">{row.attended ? row.score : '—'}</td>
                                                    <td className="px-4 py-2.5 text-right tabular-nums font-manrope font-bold text-primary">{row.points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Rules() {
    return (
        <details className="bg-secondary/[0.08] border border-primary/10 px-5 py-4 text-sm text-primary/80">
            <summary className="cursor-pointer font-semibold text-primary">Як рахується рейтинг</summary>
            <ul className="mt-3 flex flex-col gap-2 leading-relaxed list-disc pl-5">
                <li>
                    <b>Загальний</b> — річний рейтинг команд. За місце в кожній грі (п. 9.4.2):{' '}
                    {PLACE_POINTS.map((p, i) => `${i + 1} — ${p}`).join(', ')}, 6 місце й нижче — 0.
                    Місце в грі визначається за ігровими очками; однакові очки — однакове місце (п. 9.4.3).
                </li>
                <li>
                    <b>Додаткові бали</b> (п. 9.5.1) команда отримує за кожну гру, в якій зіграла:
                    7 кл. +5, 8 кл. +4, 9 кл. +3, 10 кл. +1, 11 кл. +0.
                </li>
                <li>
                    <b>Штрафні бали</b>: {FREE_NO_SHOWS} неявки за рік без штрафу, за кожну наступну −1 бал
                    (п. 9.5.2), а також штрафи від президента клубу — за неявку чи неправильно заявлених гравців.
                </li>
                <li>Сума балів = бали за місця + додаткові − штрафні. Нічия — у кого більше перших місць (п. 10.13.4).</li>
                <li>
                    <b>Персональний</b> — гравець отримує бали, які його команда здобула за місце, за кожну гру,
                    в якій він грав. Додаткові й штрафні бали командні й на нього не впливають.
                </li>
                <li>Рейтинг клубу окремий і не впливає на жоден інший рейтинг ліцею.</li>
            </ul>
        </details>
    );
}
