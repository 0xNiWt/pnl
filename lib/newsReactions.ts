// Реакції на новини. Файл без серверних залежностей — його імпортують
// і API, і клієнтський компонент.

export const REACTIONS = [
    { id: 'smile', emoji: '😃', label: 'Радісно' },
    { id: 'heart', emoji: '❤️', label: 'Подобається' },
    { id: 'cry', emoji: '😢', label: 'Сумно' },
    { id: 'like', emoji: '👍', label: 'Клас' },
    { id: 'party', emoji: '🎉', label: 'Вітаю' },
] as const;

export type ReactionId = (typeof REACTIONS)[number]['id'];

export type ReactionsState = {
    counts: Record<ReactionId, number>;
    mine: ReactionId | null;
    isLoggedIn: boolean;
};

export function isReactionId(value: unknown): value is ReactionId {
    return REACTIONS.some((r) => r.id === value);
}

export function emptyCounts(): Record<ReactionId, number> {
    return { smile: 0, heart: 0, cry: 0, like: 0, party: 0 };
}
