'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CalendarPlus, Check, ClipboardCheck, Loader2, Pencil, Plus, Trash2, TriangleAlert, X,
} from 'lucide-react';
import { compareClasses } from '@/lib/positions';
import {
    PENALTY_REASONS,
    ROSTER_STATUS_LABELS,
    TEAM_SIZE,
    ageBonus,
    sortTeams,
    type EruditeGame,
    type EruditePenalty,
    type EruditePerson,
    type EruditeResult,
    type EruditeRoster,
    type EruditeTeam,
    type PenaltyReason,
} from '@/lib/erudite';

type TeamDraft = {
    id: string | null;
    name: string;
    className: string;
    captainId: string;
    members: string[];
};

type ResultDraft = { attended: boolean; score: string; players: string[] };

type GameDraft = {
    id: string | null;
    title: string;
    playedOn: string;
    results: Record<string, ResultDraft>;
};

type PlanDraft = { title: string; playedOn: string };

type PenaltyDraft = { teamId: string; points: string; reason: PenaltyReason; gameId: string; note: string };

const inputClass =
    'w-full px-3.5 py-2.5 border border-primary/15 bg-white/70 text-sm focus:outline-none focus:border-accent';

function today() {
    return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
}

export default function EruditeManager({
    season,
    teams: rawTeams,
    games,
    results,
    rosters,
    penalties,
    people,
}: {
    season: string;
    teams: EruditeTeam[];
    games: EruditeGame[];
    results: EruditeResult[];
    rosters: EruditeRoster[];
    penalties: EruditePenalty[];
    people: EruditePerson[];
}) {
    const router = useRouter();
    const teams = useMemo(() => sortTeams(rawTeams), [rawTeams]);

    const [teamDraft, setTeamDraft] = useState<TeamDraft | null>(null);
    const [gameDraft, setGameDraft] = useState<GameDraft | null>(null);
    const [planDraft, setPlanDraft] = useState<PlanDraft | null>(null);
    const [penaltyDraft, setPenaltyDraft] = useState<PenaltyDraft | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const personName = useMemo(
        () => new Map(people.map((p) => [p.id, p.full_name ?? 'Без імені'])),
        [people]
    );
    const teamName = useMemo(() => new Map(teams.map((t) => [t.id, t.name])), [teams]);

    const classes = useMemo(
        () => [...new Set(people.map((p) => p.class).filter((c): c is string => Boolean(c)))].sort(compareClasses),
        [people]
    );

    const planned = games.filter((g) => g.status === 'planned');
    const played = games.filter((g) => g.status === 'played');

    function closeForms() {
        setTeamDraft(null);
        setGameDraft(null);
        setPlanDraft(null);
        setPenaltyDraft(null);
    }

    async function send(url: string, method: string, body?: unknown): Promise<boolean> {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(url, {
                method,
                headers: body ? { 'Content-Type': 'application/json' } : undefined,
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error ?? 'Не вдалося зберегти');
                return false;
            }
            router.refresh();
            return true;
        } catch {
            setError('Помилка мережі, спробуйте ще раз');
            return false;
        } finally {
            setBusy(false);
        }
    }

    const classPeople = (className: string) =>
        people
            .filter((p) => !className || p.class === className)
            .sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? '', 'uk'));

    // ---------------- Команди ----------------

    function editTeam(team: EruditeTeam | null) {
        closeForms();
        setTeamDraft(
            team
                ? { id: team.id, name: team.name, className: team.class_name ?? '', captainId: team.captain_id ?? '', members: team.members }
                : { id: null, name: '', className: '', captainId: '', members: [] }
        );
    }

    async function saveTeam() {
        if (!teamDraft) return;
        const body = {
            season,
            name: teamDraft.name,
            className: teamDraft.className,
            captainId: teamDraft.captainId,
            members: teamDraft.members,
        };
        const ok = teamDraft.id
            ? await send(`/api/v1/erudite/teams/${teamDraft.id}`, 'PATCH', body)
            : await send('/api/v1/erudite/teams', 'POST', body);
        if (ok) setTeamDraft(null);
    }

    async function removeTeam(team: EruditeTeam) {
        if (!confirm(`Видалити команду «${team.name}» разом з її результатами в усіх іграх?`)) return;
        await send(`/api/v1/erudite/teams/${team.id}`, 'DELETE');
    }

    // ---------------- Планування ----------------

    async function savePlan() {
        if (!planDraft) return;
        const ok = await send('/api/v1/erudite/games/plan', 'POST', { season, ...planDraft });
        if (ok) setPlanDraft(null);
    }

    async function review(roster: EruditeRoster, approve: boolean) {
        let note = '';
        if (!approve) {
            const answer = prompt('Чому заявку відхилено? Капітан побачить цей коментар.');
            if (answer === null) return;
            note = answer;
        }
        await send('/api/v1/erudite/rosters', 'PATCH', {
            gameId: roster.game_id,
            teamId: roster.team_id,
            approve,
            note,
        });
    }

    // ---------------- Результати ----------------

    function editGame(game: EruditeGame | null) {
        closeForms();
        const draft: GameDraft = game
            ? { id: game.id, title: game.title, playedOn: game.played_on, results: {} }
            : { id: null, title: '', playedOn: today(), results: {} };

        for (const team of teams) {
            const existing = game ? results.find((r) => r.game_id === game.id && r.team_id === team.id) : null;
            const roster = game ? rosters.find((r) => r.game_id === game.id && r.team_id === team.id) : null;

            if (existing) {
                draft.results[team.id] = { attended: existing.attended, score: String(existing.score), players: existing.players };
            } else if (roster) {
                // Склад із заявки капітана; команда без заявки — ймовірна неявка.
                draft.results[team.id] = { attended: true, score: '', players: roster.players };
            } else {
                draft.results[team.id] = { attended: !game || game.status === 'played', score: '', players: team.members.slice(0, TEAM_SIZE) };
            }
        }
        setGameDraft(draft);
    }

    function updateResult(teamId: string, changes: Partial<ResultDraft>) {
        setGameDraft((d) => (d ? { ...d, results: { ...d.results, [teamId]: { ...d.results[teamId], ...changes } } } : d));
    }

    async function saveGame() {
        if (!gameDraft) return;
        const body = {
            season,
            title: gameDraft.title,
            playedOn: gameDraft.playedOn,
            results: teams.map((team) => {
                const r = gameDraft.results[team.id];
                return {
                    team_id: team.id,
                    attended: r.attended,
                    score: r.attended ? Number(r.score.replace(',', '.')) || 0 : 0,
                    players: r.attended ? r.players : [],
                };
            }),
        };
        const ok = gameDraft.id
            ? await send(`/api/v1/erudite/games/${gameDraft.id}`, 'PUT', body)
            : await send('/api/v1/erudite/games', 'POST', body);
        if (ok) setGameDraft(null);
    }

    async function removeGame(game: EruditeGame) {
        if (!confirm(`Видалити гру «${game.title}» разом із результатами й заявками?`)) return;
        await send(`/api/v1/erudite/games/${game.id}`, 'DELETE');
    }

    // ---------------- Штрафи ----------------

    async function savePenalty() {
        if (!penaltyDraft) return;
        const ok = await send('/api/v1/erudite/penalties', 'POST', {
            season,
            teamId: penaltyDraft.teamId,
            points: Number(penaltyDraft.points),
            reason: penaltyDraft.reason,
            gameId: penaltyDraft.gameId,
            note: penaltyDraft.note,
        });
        if (ok) setPenaltyDraft(null);
    }

    async function removePenalty(p: EruditePenalty) {
        if (!confirm('Скасувати цей штраф?')) return;
        await send(`/api/v1/erudite/penalties/${p.id}`, 'DELETE');
    }

    const gameForm = gameDraft && (
        <div className="bg-white/40 border border-primary/10 p-5 flex flex-col gap-4">
            <div className="grid sm:grid-cols-[1fr_180px] gap-4">
                <Field label="Назва гри">
                    <input
                        value={gameDraft.title}
                        onChange={(e) => setGameDraft({ ...gameDraft, title: e.target.value })}
                        placeholder="Наприклад: Гра №3 · Історія науки"
                        className={inputClass}
                    />
                </Field>
                <Field label="Дата">
                    <input
                        type="date"
                        value={gameDraft.playedOn}
                        onChange={(e) => setGameDraft({ ...gameDraft, playedOn: e.target.value })}
                        className={inputClass}
                    />
                </Field>
            </div>

            <p className="text-xs text-primary/70">
                Вносьте ігрові очки — місця й бали за місця рахуються самі. Склад підставлено із
                заявки капітана; якщо грали інші люди, виправте, а за неправильну заявку можна
                нарахувати штраф нижче.
            </p>

            <div className="flex flex-col gap-3">
                {teams.map((team, i) => {
                    const r = gameDraft.results[team.id];
                    const roster = gameDraft.id ? rosters.find((x) => x.game_id === gameDraft.id && x.team_id === team.id) : undefined;
                    return (
                        <div key={team.id} className="border border-primary/10 bg-white/50 p-4 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <p className="font-semibold text-primary flex-1 min-w-[180px]">
                                    №{i + 1} · {team.name}
                                    {roster && (
                                        <span className="ml-2 text-xs font-normal text-primary/65">
                                            заявка: {ROSTER_STATUS_LABELS[roster.status].toLowerCase()}
                                        </span>
                                    )}
                                </p>
                                <label className="inline-flex items-center gap-2 text-sm text-primary/85">
                                    <input
                                        type="checkbox"
                                        checked={!r.attended}
                                        onChange={(e) => updateResult(team.id, { attended: !e.target.checked })}
                                    />
                                    Неявка
                                </label>
                                {r.attended && (
                                    <input
                                        value={r.score}
                                        onChange={(e) => updateResult(team.id, { score: e.target.value })}
                                        inputMode="decimal"
                                        placeholder="Очки"
                                        className="w-24 px-3 py-2 border border-primary/15 bg-white/70 text-sm text-center tabular-nums focus:outline-none focus:border-accent"
                                    />
                                )}
                            </div>

                            {r.attended && (
                                <div>
                                    <p className="font-plex text-[12px] uppercase tracking-[0.14em] text-primary/60 mb-2">
                                        Хто грав · {r.players.length}
                                    </p>
                                    <PeoplePicker
                                        people={classPeople(team.class_name ?? '')}
                                        selected={r.players}
                                        onChange={(players) => updateResult(team.id, { players })}
                                        compact
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <FormActions busy={busy} onSave={saveGame} onCancel={() => setGameDraft(null)} label="Зберегти результати" />
        </div>
    );

    return (
        <div className="flex flex-col gap-12">
            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                    <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto shrink-0" aria-label="Закрити">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ---------------- Заплановані ігри та заявки ---------------- */}
            <section className="flex flex-col gap-4">
                <SectionHeader title={`Заплановані ігри · ${planned.length}`}>
                    {!planDraft && teams.length > 0 && (
                        <PrimaryButton onClick={() => { closeForms(); setPlanDraft({ title: '', playedOn: today() }); }} icon={<CalendarPlus size={15} />}>
                            Запланувати гру
                        </PrimaryButton>
                    )}
                </SectionHeader>

                <p className="text-sm text-primary/75 -mt-2">
                    Після того як гру заплановано, капітани подають заявки — до {TEAM_SIZE} гравців зі складу
                    класу. Ви підтверджуєте або відхиляєте їх, а після гри вносите результати. Підтверджені гравці автоматично додаються до складу команди й отримують посаду «Учасник клубу «Ерудит»».
                </p>

                {planDraft && (
                    <div className="bg-white/40 border border-primary/10 p-5 flex flex-col gap-4">
                        <div className="grid sm:grid-cols-[1fr_180px] gap-4">
                            <Field label="Назва гри">
                                <input
                                    value={planDraft.title}
                                    onChange={(e) => setPlanDraft({ ...planDraft, title: e.target.value })}
                                    placeholder="Наприклад: Гра №4 · Географія"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Дата">
                                <input
                                    type="date"
                                    value={planDraft.playedOn}
                                    onChange={(e) => setPlanDraft({ ...planDraft, playedOn: e.target.value })}
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                        <FormActions busy={busy} onSave={savePlan} onCancel={() => setPlanDraft(null)} label="Запланувати" />
                    </div>
                )}

                {gameDraft?.id && planned.some((g) => g.id === gameDraft.id) && gameForm}

                {planned.length === 0 && !planDraft && (
                    <p className="text-sm text-primary/65">Запланованих ігор немає.</p>
                )}

                {planned.map((game) => (
                    <div key={game.id} className="bg-secondary/[0.3] border border-primary/10">
                        <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-primary/10">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-primary truncate">{game.title}</p>
                                <p className="text-xs text-primary/70">{formatDate(game.played_on)}</p>
                            </div>
                            <button
                                onClick={() => editGame(game)}
                                className="inline-flex items-center gap-2 border border-primary/20 px-3.5 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background transition-colors"
                            >
                                <ClipboardCheck size={15} />
                                Внести результати
                            </button>
                            <RowButtons onDelete={() => removeGame(game)} busy={busy} />
                        </div>

                        <div className="divide-y divide-primary/[0.07]">
                            {teams.map((team) => {
                                const roster = rosters.find((r) => r.game_id === game.id && r.team_id === team.id);
                                return (
                                    <div key={team.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                                        <div className="min-w-[160px] flex-1">
                                            <p className="text-sm font-semibold text-primary">{team.name}</p>
                                            <p className="text-xs text-primary/70">
                                                {roster
                                                    ? roster.players.map((id) => personName.get(id) ?? '—').join(', ')
                                                    : 'Заявку ще не подано'}
                                            </p>
                                            {roster?.status === 'rejected' && roster.note && (
                                                <p className="text-xs text-red-600 mt-0.5">Коментар: {roster.note}</p>
                                            )}
                                        </div>

                                        {roster && <RosterBadge status={roster.status} />}

                                        {roster && roster.status !== 'approved' && (
                                            <button
                                                onClick={() => review(roster, true)}
                                                disabled={busy}
                                                className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                            >
                                                <Check size={13} />
                                                Підтвердити
                                            </button>
                                        )}
                                        {roster && roster.status !== 'rejected' && (
                                            <button
                                                onClick={() => review(roster, false)}
                                                disabled={busy}
                                                className="inline-flex items-center gap-1.5 border border-red-200 text-red-600 px-3 py-1.5 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                                            >
                                                <X size={13} />
                                                Відхилити
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </section>

            {/* ---------------- Зіграні ігри ---------------- */}
            <section className="flex flex-col gap-4">
                <SectionHeader title={`Зіграні ігри · ${played.length}`}>
                    {!gameDraft && teams.length > 0 && (
                        <button
                            onClick={() => editGame(null)}
                            className="inline-flex items-center gap-2 border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background transition-colors"
                        >
                            <Plus size={15} />
                            Гра без планування
                        </button>
                    )}
                </SectionHeader>

                {gameDraft && !planned.some((g) => g.id === gameDraft.id) && gameForm}

                {played.length === 0 && <p className="text-sm text-primary/65">Зіграних ігор ще немає.</p>}

                <div className="flex flex-col gap-2">
                    {[...played].reverse().map((game) => (
                        <div key={game.id} className="bg-secondary/[0.3] border border-primary/10 px-5 py-3.5 flex items-center gap-4">
                            <span className="font-plex text-[13px] text-primary/65 tabular-nums w-24 shrink-0">
                                {new Date(game.played_on).toLocaleDateString('uk-UA')}
                            </span>
                            <p className="font-semibold text-primary flex-1 min-w-0 truncate">{game.title}</p>
                            <RowButtons onEdit={() => editGame(game)} onDelete={() => removeGame(game)} busy={busy} />
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Штрафи ---------------- */}
            <section className="flex flex-col gap-4">
                <SectionHeader title={`Штрафні бали · ${penalties.length}`}>
                    {!penaltyDraft && teams.length > 0 && (
                        <PrimaryButton
                            onClick={() => {
                                closeForms();
                                setPenaltyDraft({ teamId: teams[0].id, points: '1', reason: 'roster', gameId: '', note: '' });
                            }}
                            icon={<Plus size={15} />}
                        >
                            Нарахувати штраф
                        </PrimaryButton>
                    )}
                </SectionHeader>

                <p className="text-sm text-primary/75 -mt-2">
                    Штраф за неявки понад дві на рік (п. 9.5.2) рахується автоматично. Тут — додаткові
                    штрафи: за неявку чи за неправильно заявлених гравців.
                </p>

                {penaltyDraft && (
                    <div className="bg-white/40 border border-primary/10 p-5 flex flex-col gap-4">
                        <div className="grid sm:grid-cols-[1fr_120px] gap-4">
                            <Field label="Команда">
                                <select
                                    value={penaltyDraft.teamId}
                                    onChange={(e) => setPenaltyDraft({ ...penaltyDraft, teamId: e.target.value })}
                                    className={inputClass}
                                >
                                    {teams.map((t, i) => (
                                        <option key={t.id} value={t.id}>№{i + 1} · {t.name}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Бали">
                                <input
                                    value={penaltyDraft.points}
                                    onChange={(e) => setPenaltyDraft({ ...penaltyDraft, points: e.target.value })}
                                    inputMode="numeric"
                                    className={`${inputClass} text-center tabular-nums`}
                                />
                            </Field>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Причина">
                                <select
                                    value={penaltyDraft.reason}
                                    onChange={(e) => setPenaltyDraft({ ...penaltyDraft, reason: e.target.value as PenaltyReason })}
                                    className={inputClass}
                                >
                                    {(Object.keys(PENALTY_REASONS) as PenaltyReason[]).map((r) => (
                                        <option key={r} value={r}>{PENALTY_REASONS[r]}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Гра (необов’язково)">
                                <select
                                    value={penaltyDraft.gameId}
                                    onChange={(e) => setPenaltyDraft({ ...penaltyDraft, gameId: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">— без прив’язки до гри —</option>
                                    {games.map((g) => (
                                        <option key={g.id} value={g.id}>{g.title}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <Field label="Коментар">
                            <input
                                value={penaltyDraft.note}
                                onChange={(e) => setPenaltyDraft({ ...penaltyDraft, note: e.target.value })}
                                placeholder="Наприклад: грав учень, якого не було в заявці"
                                className={inputClass}
                            />
                        </Field>
                        <FormActions busy={busy} onSave={savePenalty} onCancel={() => setPenaltyDraft(null)} label="Нарахувати" />
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {penalties.map((p) => (
                        <div key={p.id} className="bg-secondary/[0.3] border border-primary/10 px-5 py-3 flex items-center gap-4">
                            <span className="font-manrope font-bold text-red-600 tabular-nums w-10 shrink-0">−{p.points}</span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-primary">
                                    {teamName.get(p.team_id) ?? '—'} · {PENALTY_REASONS[p.reason]}
                                </p>
                                {(p.note || p.game_id) && (
                                    <p className="text-xs text-primary/70">
                                        {[games.find((g) => g.id === p.game_id)?.title, p.note].filter(Boolean).join(' — ')}
                                    </p>
                                )}
                            </div>
                            <RowButtons onDelete={() => removePenalty(p)} busy={busy} />
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Команди ---------------- */}
            <section className="flex flex-col gap-4">
                <SectionHeader title={`Команди · ${teams.length}`}>
                    {!teamDraft && (
                        <PrimaryButton onClick={() => editTeam(null)} icon={<Plus size={15} />}>
                            Додати команду
                        </PrimaryButton>
                    )}
                </SectionHeader>

                {teamDraft && (
                    <div className="bg-white/40 border border-primary/10 p-5 flex flex-col gap-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Назва команди">
                                <input
                                    value={teamDraft.name}
                                    onChange={(e) => setTeamDraft({ ...teamDraft, name: e.target.value })}
                                    placeholder="Наприклад: 10-А «Сократи»"
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Клас">
                                <select
                                    value={teamDraft.className}
                                    onChange={(e) => setTeamDraft({ ...teamDraft, className: e.target.value, captainId: '', members: [] })}
                                    className={inputClass}
                                >
                                    <option value="">— оберіть клас —</option>
                                    {classes.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {teamDraft.className && (
                                    <p className="text-xs text-primary/65 mt-1.5">
                                        Додаткові бали команди: +{ageBonus(teamDraft.className)} за кожну зіграну гру.
                                    </p>
                                )}
                            </Field>
                        </div>

                        {teamDraft.className && (
                            <>
                                <Field label="Капітан">
                                    <select
                                        value={teamDraft.captainId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setTeamDraft({
                                                ...teamDraft,
                                                captainId: id,
                                                members: id && !teamDraft.members.includes(id) ? [id, ...teamDraft.members] : teamDraft.members,
                                            });
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="">— без капітана —</option>
                                        {classPeople(teamDraft.className).map((p) => (
                                            <option key={p.id} value={p.id}>{p.full_name ?? 'Без імені'}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label={`Склад команди · ${teamDraft.members.length} (на гру — до ${TEAM_SIZE}, п. 9.3.1)`}>
                                    <PeoplePicker
                                        people={classPeople(teamDraft.className)}
                                        selected={teamDraft.members}
                                        onChange={(members) => setTeamDraft({ ...teamDraft, members })}
                                        locked={teamDraft.captainId}
                                    />
                                </Field>
                            </>
                        )}

                        <FormActions busy={busy} onSave={saveTeam} onCancel={() => setTeamDraft(null)} />
                    </div>
                )}

                {teams.length === 0 && !teamDraft ? (
                    <p className="text-sm text-primary/65">Команд цього року ще немає.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {teams.map((team, i) => (
                            <div key={team.id} className="bg-secondary/[0.3] border border-primary/10 px-5 py-3.5 flex items-start gap-4">
                                <span className="font-manrope font-bold text-primary/60 w-8 shrink-0">№{i + 1}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-primary">
                                        {team.name}
                                        {team.class_name && <span className="ml-2 text-xs font-normal text-primary/65">{team.class_name}</span>}
                                    </p>
                                    <p className="text-xs text-primary/70 mt-0.5">
                                        Капітан: {team.captain_id ? personName.get(team.captain_id) ?? '—' : 'не призначено'}
                                        {' · '}склад: {team.members.length}
                                    </p>
                                </div>
                                <RowButtons onEdit={() => editTeam(team)} onDelete={() => removeTeam(team)} busy={busy} />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function RosterBadge({ status }: { status: EruditeRoster['status'] }) {
    const tone =
        status === 'approved'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : status === 'rejected'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-accent/10 text-accent border-accent/30';
    return (
        <span className={`border px-2.5 py-1 font-plex text-[12px] uppercase tracking-wider ${tone}`}>
            {ROSTER_STATUS_LABELS[status]}
        </span>
    );
}

function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-manrope font-bold text-primary text-lg">{title}</h2>
            {children}
        </div>
    );
}

function PrimaryButton({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm px-4 py-2 hover:bg-primary/90 transition-colors"
        >
            {icon}
            {children}
        </button>
    );
}

function PeoplePicker({
    people,
    selected,
    onChange,
    locked,
    compact,
}: {
    people: EruditePerson[];
    selected: string[];
    onChange: (ids: string[]) => void;
    locked?: string;
    compact?: boolean;
}) {
    if (people.length === 0) {
        return <p className="text-xs text-primary/65">У цьому класі немає зареєстрованих учнів.</p>;
    }

    return (
        <div className={`grid gap-1.5 ${compact ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            {people.map((p) => {
                const checked = selected.includes(p.id);
                const isLocked = locked === p.id;
                return (
                    <label
                        key={p.id}
                        className={`flex items-center gap-2 px-3 py-2 text-sm border transition-colors ${checked ? 'border-accent/50 bg-accent/[0.07] text-primary' : 'border-primary/10 text-primary/80'
                            } ${isLocked ? 'opacity-80' : 'cursor-pointer'}`}
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            disabled={isLocked}
                            onChange={() => onChange(checked ? selected.filter((id) => id !== p.id) : [...selected, p.id])}
                        />
                        <span className="truncate">{p.full_name ?? 'Без імені'}</span>
                        {isLocked && <span className="ml-auto font-plex text-[11px] uppercase tracking-wider text-accent">капітан</span>}
                    </label>
                );
            })}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block font-plex text-[12px] font-semibold uppercase tracking-[0.14em] text-primary/75 mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}

function FormActions({
    busy,
    onSave,
    onCancel,
    label = 'Зберегти',
}: {
    busy: boolean;
    onSave: () => void;
    onCancel: () => void;
    label?: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onSave}
                disabled={busy}
                className="inline-flex items-center gap-2 bg-primary text-background font-manrope font-semibold text-sm px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {label}
            </button>
            <button onClick={onCancel} className="text-sm font-semibold text-primary/70 hover:text-primary transition-colors">
                Скасувати
            </button>
        </div>
    );
}

function RowButtons({ onEdit, onDelete, busy }: { onEdit?: () => void; onDelete: () => void; busy: boolean }) {
    return (
        <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
                <button
                    onClick={onEdit}
                    aria-label="Редагувати"
                    className="w-8 h-8 flex items-center justify-center text-primary/60 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                    <Pencil size={15} />
                </button>
            )}
            <button
                onClick={onDelete}
                disabled={busy}
                aria-label="Видалити"
                className="w-8 h-8 flex items-center justify-center text-primary/30 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
            >
                <Trash2 size={15} />
            </button>
        </div>
    );
}
