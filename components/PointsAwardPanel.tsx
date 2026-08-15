'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, X, Info } from 'lucide-react';
import {
    COEFFICIENT_LEVELS,
    distributeByCoefficients,
    type CoefficientLevel,
} from '@/lib/coefficients';

// 'student' — однакові бали одному чи кільком учням.
// 'event'   — бюджет заходу ділиться між учасниками за коефіцієнтами (п. 12.2.3 Статуту).
type Mode = 'student' | 'event';

type Situation = {
    id: string;
    title: string;
    category: string;
    target: Mode | 'class';
    points: number | null;
    explanation_template: string;
    statute_ref: string | null;
};

type StudentOption = { student_id: string; full_name: string; class: string | null };

type Participant = { student: StudentOption; coefficient: CoefficientLevel };

const CATEGORY_LABELS: Record<string, string> = {
    sport: 'Спортивна',
    creative: 'Творча',
    organizational: 'Організаційна',
    intellectual: 'Інтелектуальна',
    volunteer: 'Волонтерська',
};

export default function PointsAwardPanel() {
    const [mode, setMode] = useState<Mode>('student');
    const [situations, setSituations] = useState<Situation[]>([]);
    const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);

    // Пошук учнів — спільний для обох вкладок.
    const [studentQuery, setStudentQuery] = useState('');
    const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);

    // Вкладка «Учням»
    const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
    const [points, setPoints] = useState<number>(0);

    // Вкладка «За коефіцієнтами»
    const [eventTitle, setEventTitle] = useState('');
    const [eventBudget, setEventBudget] = useState<number>(0);
    const [participants, setParticipants] = useState<Participant[]>([]);

    // Спільні поля форми
    const [category, setCategory] = useState('organizational');
    const [explanation, setExplanation] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

    // Довідник ситуацій — завантажуємо один раз
    useEffect(() => {
        fetch('/api/v1/points')
            .then((r) => r.json())
            .then((j) => setSituations(j.data ?? []));
    }, []);

    // Пошук учнів
    useEffect(() => {
        const t = setTimeout(() => {
            fetch(`/api/v1/rating?type=student&search=${encodeURIComponent(studentQuery)}`)
                .then((r) => r.json())
                .then((j) => setStudentOptions(j.data ?? []));
        }, 250);
        return () => clearTimeout(t);
    }, [studentQuery]);

    const filteredSituations = useMemo(
        () => situations.filter((s) => s.target === mode),
        [situations, mode]
    );

    // Живий підрахунок: рівно та сама функція, що працює на сервері.
    const distribution = useMemo(
        () =>
            distributeByCoefficients(
                eventBudget,
                participants.map((p) => ({
                    studentId: p.student.student_id,
                    coefficient: p.coefficient,
                }))
            ),
        [eventBudget, participants]
    );

    const pointsByStudent = useMemo(
        () => new Map(distribution.shares.map((s) => [s.studentId, s.points])),
        [distribution]
    );

    // Учні, яких ще не додано — щоб не пропонувати їх у підказках повторно.
    const availableOptions = useMemo(() => {
        const taken = new Set(
            mode === 'student'
                ? selectedStudents.map((s) => s.student_id)
                : participants.map((p) => p.student.student_id)
        );
        return studentOptions.filter((s) => !taken.has(s.student_id));
    }, [studentOptions, selectedStudents, participants, mode]);

    function switchMode(next: Mode) {
        if (next === mode) return;
        setMode(next);
        setMessage(null);
        // Списки чистимо навмисно: щоб випадково не нарахувати бали учням,
        // яких обрали ще на іншій вкладці.
        clearAfterSubmit();
    }

    function resetForm() {
        setSelectedSituation(null);
        setCategory('organizational');
        setPoints(0);
        setExplanation('');
        setEventTitle('');
        setEventBudget(0);
        setStudentQuery('');
    }

    function clearAfterSubmit() {
        resetForm();
        setSelectedStudents([]);
        setParticipants([]);
    }

    function pickSituation(s: Situation) {
        setSelectedSituation(s);
        setCategory(s.category);
        setExplanation(s.explanation_template);
        if (mode === 'student') {
            setPoints(s.points ?? 0);
        } else {
            setEventTitle(s.title);
            setEventBudget(s.points ?? 0);
        }
    }

    function addStudent(s: StudentOption) {
        if (mode === 'student') {
            if (selectedStudents.some((x) => x.student_id === s.student_id)) return;
            setSelectedStudents([...selectedStudents, s]);
        } else {
            if (participants.some((p) => p.student.student_id === s.student_id)) return;
            setParticipants([...participants, { student: s, coefficient: 1 }]);
        }
        setStudentQuery('');
    }

    function removeStudent(id: string) {
        setSelectedStudents(selectedStudents.filter((s) => s.student_id !== id));
    }

    function removeParticipant(id: string) {
        setParticipants(participants.filter((p) => p.student.student_id !== id));
    }

    function setCoefficient(id: string, coefficient: CoefficientLevel) {
        setParticipants(
            participants.map((p) =>
                p.student.student_id === id ? { ...p, coefficient } : p
            )
        );
    }

    async function handleSubmit() {
        setMessage(null);

        if (!explanation.trim()) {
            setMessage({ type: 'error', text: 'Додай пояснення' });
            return;
        }

        let payload: Record<string, unknown>;

        if (mode === 'student') {
            if (selectedStudents.length === 0) {
                setMessage({ type: 'error', text: 'Обери хоча б одного учня' });
                return;
            }
            payload = {
                target: 'student',
                studentIds: selectedStudents.map((s) => s.student_id),
                category,
                points,
                explanation,
                situationId: selectedSituation?.id ?? null,
            };
        } else {
            if (!eventTitle.trim()) {
                setMessage({ type: 'error', text: 'Вкажи назву заходу' });
                return;
            }
            if (!eventBudget) {
                setMessage({ type: 'error', text: 'Вкажи бюджет заходу в балах' });
                return;
            }
            if (participants.length === 0) {
                setMessage({ type: 'error', text: 'Додай хоча б одного учасника' });
                return;
            }
            payload = {
                target: 'event',
                eventTitle,
                eventBudget,
                participants: participants.map((p) => ({
                    studentId: p.student.student_id,
                    coefficient: p.coefficient,
                })),
                category,
                explanation,
                situationId: selectedSituation?.id ?? null,
            };
        }

        setSubmitting(true);
        const res = await fetch('/api/v1/points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        setSubmitting(false);

        if (!res.ok) {
            const j = await res.json();
            setMessage({ type: 'error', text: j.error ?? 'Помилка' });
            return;
        }

        setMessage({
            type: 'ok',
            text:
                mode === 'student'
                    ? `Нараховано ${points} балів — ${selectedStudents.length > 1
                        ? `${selectedStudents.length} учням`
                        : selectedStudents[0]?.full_name ?? 'учню'
                    }`
                    : `Бюджет заходу «${eventTitle}» (${eventBudget} балів) розподілено між ${participants.length} учнями`,
        });
        clearAfterSubmit();
    }

    return (
        <div className="space-y-8">
            {/* Вибір режиму нарахування */}
            <div className="inline-flex rounded-full border border-primary/15 p-1">
                <button
                    onClick={() => switchMode('student')}
                    className={`px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold uppercase tracking-wide transition-colors ${mode === 'student' ? 'bg-primary text-background' : 'text-primary/60'
                        }`}
                >
                    Учням
                </button>
                <button
                    onClick={() => switchMode('event')}
                    className={`px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold uppercase tracking-wide transition-colors ${mode === 'event' ? 'bg-primary text-background' : 'text-primary/60'
                        }`}
                >
                    Учням за коефіцієнтами
                </button>
            </div>

            {mode === 'event' && (
                <div className="flex gap-3 rounded-2xl border border-secondary/25 bg-secondary/[0.07] p-4">
                    <Info size={16} className="shrink-0 mt-0.5 text-secondary" />
                    <p className="text-xs leading-relaxed text-primary/70">
                        Бюджет заходу ділиться на загальну суму коефіцієнтів усіх учасників — так
                        визначається базова ставка. Далі ставка множиться на особистий коефіцієнт
                        кожного учня (п. 12.2.5 Статуту). Залишок від округлення роздається по
                        одному балу, тому сума нарахувань завжди точно дорівнює бюджету.
                    </p>
                </div>
            )}

            {/* Ситуації зі Статуту */}
            <div>
                <h2 className="font-grotesk font-semibold text-sm text-primary/70 uppercase tracking-wide mb-3">
                    {mode === 'student' ? 'Ситуація зі Статуту' : 'Захід'}
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                    {filteredSituations.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => pickSituation(s)}
                            className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${selectedSituation?.id === s.id
                                ? 'border-secondary bg-secondary/10'
                                : 'border-primary/10 bg-white/40 hover:bg-primary/5'
                                }`}
                        >
                            <div className="font-medium text-primary">{s.title}</div>
                            <div className="text-xs text-primary/50 mt-0.5">
                                {CATEGORY_LABELS[s.category]}
                                {s.points !== null
                                    ? ` · ${s.points > 0 ? '+' : ''}${s.points} балів`
                                    : ' · довільна сума'}
                                {s.statute_ref ? ` · ${s.statute_ref}` : ''}
                            </div>
                        </button>
                    ))}
                </div>
                <button onClick={resetForm} className="mt-2 text-xs text-primary/50 underline">
                    {mode === 'student'
                        ? 'Або ввести довільне нарахування вручну'
                        : 'Або ввести свій захід вручну'}
                </button>
            </div>

            {/* Захід: назва та бюджет */}
            {mode === 'event' && (
                <div className="grid sm:grid-cols-[1fr_180px] gap-4">
                    <div>
                        <label className="block text-xs font-grotesk font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                            Назва заходу
                        </label>
                        <input
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="Наприклад: Перший дзвоник"
                            className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-grotesk font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                            Бюджет, балів
                        </label>
                        <input
                            type="number"
                            value={eventBudget}
                            onChange={(e) => setEventBudget(Number(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                        />
                    </div>
                </div>
            )}

            {/* Пошук учнів */}
            <div>
                <label className="block text-xs font-grotesk font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                    {mode === 'student' ? 'Кому нараховуємо' : 'Учасники заходу'}
                </label>

                {mode === 'student' && selectedStudents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedStudents.map((s) => (
                            <span
                                key={s.student_id}
                                className="inline-flex items-center gap-1.5 bg-secondary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full"
                            >
                                {s.full_name}
                                <button
                                    onClick={() => removeStudent(s.student_id)}
                                    className="hover:text-accent"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="relative">
                    <input
                        value={studentQuery}
                        onChange={(e) => setStudentQuery(e.target.value)}
                        placeholder={
                            mode === 'student'
                                ? "Почни вводити ім'я учня... (можна додати кількох)"
                                : "Почни вводити ім'я учня, щоб додати його до списку..."
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                    />
                    {studentQuery && availableOptions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-primary/10 rounded-xl shadow-lg overflow-hidden">
                            {availableOptions.map((s) => (
                                <button
                                    key={s.student_id}
                                    onClick={() => addStudent(s)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 flex justify-between"
                                >
                                    <span>{s.full_name}</span>
                                    <span className="text-primary/40">{s.class}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {mode === 'student' && selectedStudents.length > 1 && (
                    <p className="text-xs text-primary/50 mt-1.5">
                        Усім {selectedStudents.length} учням буде нараховано однакову кількість
                        балів з однаковим поясненням.
                    </p>
                )}
            </div>

            {/* Таблиця учасників із коефіцієнтами */}
            {mode === 'event' && (
                <div className="border border-primary/10 rounded-2xl overflow-hidden bg-white/40">
                    <div className="hidden sm:grid grid-cols-[1fr_240px_90px_36px] gap-3 px-4 py-2.5 bg-primary/[0.04] text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50">
                        <span>Учень</span>
                        <span>Рівень залученості</span>
                        <span className="text-right">Бали</span>
                        <span />
                    </div>

                    {participants.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-primary/40 text-center">
                            Список учасників порожній. Знайди учнів у полі пошуку вище.
                        </p>
                    ) : (
                        participants.map((p) => (
                            <div
                                key={p.student.student_id}
                                className="grid sm:grid-cols-[1fr_240px_90px_36px] gap-3 px-4 py-3 border-t border-primary/10 items-center"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-primary truncate">
                                        {p.student.full_name}
                                    </p>
                                    <p className="text-xs text-primary/40">{p.student.class ?? '—'}</p>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {COEFFICIENT_LEVELS.map((level) => (
                                        <button
                                            key={level.value}
                                            title={`${level.title}: ${level.hint}`}
                                            onClick={() => setCoefficient(p.student.student_id, level.value)}
                                            className={`w-9 h-9 rounded-lg text-sm font-grotesk font-bold transition-colors ${p.coefficient === level.value
                                                ? 'bg-primary text-background'
                                                : 'bg-primary/5 text-primary/50 hover:bg-primary/10'
                                                }`}
                                        >
                                            {level.value}
                                        </button>
                                    ))}
                                    <span className="text-xs text-primary/40 ml-1 truncate">
                                        {COEFFICIENT_LEVELS.find((l) => l.value === p.coefficient)?.title}
                                    </span>
                                </div>

                                <div className="sm:text-right font-grotesk font-bold text-primary">
                                    {pointsByStudent.get(p.student.student_id) ?? 0}
                                </div>

                                <button
                                    onClick={() => removeParticipant(p.student.student_id)}
                                    className="justify-self-start sm:justify-self-center text-primary/30 hover:text-accent"
                                    aria-label="Прибрати учня зі списку"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))
                    )}

                    {participants.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-3 border-t border-primary/10 bg-primary/[0.03]">
                            <Summary label="Учасників" value={String(participants.length)} />
                            <Summary label="Сума коефіцієнтів" value={String(distribution.totalCoefficient)} />
                            <Summary
                                label="Базова ставка"
                                value={
                                    distribution.baseRate
                                        ? distribution.baseRate.toFixed(2).replace('.', ',')
                                        : '0'
                                }
                            />
                            <Summary
                                label="Роздано"
                                value={`${distribution.distributed} / ${Math.round(eventBudget) || 0}`}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Форма */}
            <div className="border border-primary/10 rounded-2xl p-5 bg-white/40 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-grotesk font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                            Категорія
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm"
                        >
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {mode === 'student' && (
                        <div>
                            <label className="block text-xs font-grotesk font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                                Бали (можна від&apos;ємні — штраф)
                            </label>
                            <input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(Number(e.target.value))}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-grotesk font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                        Пояснення (видно редактору та учню-отримувачу)
                    </label>
                    <textarea
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm resize-none"
                    />
                    {mode === 'event' && (
                        <p className="text-xs text-primary/50 mt-1.5">
                            До пояснення кожного учня автоматично додасться назва заходу, його
                            коефіцієнт і загальний бюджет.
                        </p>
                    )}
                </div>

                {message && (
                    <div className={`text-sm ${message.type === 'ok' ? 'text-secondary' : 'text-accent'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-primary text-background font-grotesk font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    {mode === 'student' ? 'Нарахувати' : 'Розподілити бали'}
                </button>
            </div>
        </div>
    );
}

function Summary({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[11px] font-grotesk font-semibold uppercase tracking-wider text-primary/50">
                {label}
            </p>
            <p className="text-sm font-grotesk font-bold text-primary mt-0.5">{value}</p>
        </div>
    );
}
