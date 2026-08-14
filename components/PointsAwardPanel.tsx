'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';

type Target = 'student' | 'class';

type Situation = {
    id: string;
    title: string;
    category: string;
    target: Target;
    points: number | null;
    explanation_template: string;
    statute_ref: string | null;
};

type StudentOption = { student_id: string; full_name: string; class: string | null };

const CATEGORY_LABELS: Record<string, string> = {
    sport: 'Спортивна',
    creative: 'Творча',
    organizational: 'Організаційна',
    intellectual: 'Інтелектуальна',
    volunteer: 'Волонтерська',
};

export default function PointsAwardPanel() {
    const [target, setTarget] = useState<Target>('student');
    const [situations, setSituations] = useState<Situation[]>([]);

    // Кому нараховуємо — для учнів тепер можна обрати кількох одразу.
    const [studentQuery, setStudentQuery] = useState('');
    const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
    const [classOptions, setClassOptions] = useState<string[]>([]);
    const [selectedClass, setSelectedClass] = useState('');

    // Форма нарахування
    const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
    const [category, setCategory] = useState('organizational');
    const [points, setPoints] = useState<number>(0);
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
        if (target !== 'student') return;
        const t = setTimeout(() => {
            fetch(`/api/v1/rating?type=student&search=${encodeURIComponent(studentQuery)}`)
                .then((r) => r.json())
                .then((j) => setStudentOptions(j.data ?? []));
        }, 250);
        return () => clearTimeout(t);
    }, [studentQuery, target]);

    // Список класів
    useEffect(() => {
        if (target !== 'class') return;
        fetch('/api/v1/rating?type=class')
            .then((r) => r.json())
            .then((j) => setClassOptions((j.data ?? []).map((r: { class_name: string }) => r.class_name)));
    }, [target]);

    const filteredSituations = useMemo(
        () => situations.filter((s) => s.target === target),
        [situations, target]
    );

    function pickSituation(s: Situation) {
        setSelectedSituation(s);
        setCategory(s.category);
        setPoints(s.points ?? 0);
        setExplanation(s.explanation_template);
    }

    function resetForm() {
        setSelectedSituation(null);
        setCategory('organizational');
        setPoints(0);
        setExplanation('');
    }

    function addStudent(s: StudentOption) {
        if (selectedStudents.some((x) => x.student_id === s.student_id)) return;
        setSelectedStudents([...selectedStudents, s]);
        setStudentQuery('');
    }

    function removeStudent(id: string) {
        setSelectedStudents(selectedStudents.filter((s) => s.student_id !== id));
    }

    async function handleSubmit() {
        setMessage(null);

        if (target === 'student' && selectedStudents.length === 0) {
            setMessage({ type: 'error', text: 'Обери хоча б одного учня' });
            return;
        }
        if (target === 'class' && !selectedClass) {
            setMessage({ type: 'error', text: 'Обери клас' });
            return;
        }
        if (!explanation.trim()) {
            setMessage({ type: 'error', text: 'Додай пояснення' });
            return;
        }

        setSubmitting(true);
        const res = await fetch('/api/v1/points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target,
                studentIds: target === 'student' ? selectedStudents.map((s) => s.student_id) : undefined,
                className: target === 'class' ? selectedClass : undefined,
                category,
                points,
                explanation,
                situationId: selectedSituation?.id ?? null,
            }),
        });
        setSubmitting(false);

        if (!res.ok) {
            const j = await res.json();
            setMessage({ type: 'error', text: j.error ?? 'Помилка' });
            return;
        }

        const who =
            target === 'student'
                ? selectedStudents.length > 1
                    ? `${selectedStudents.length} учням`
                    : selectedStudents[0]?.full_name ?? 'учню'
                : selectedClass;
        setMessage({ type: 'ok', text: `Нараховано ${points} балів — ${who}` });
        resetForm();
        setSelectedStudents([]);
        setSelectedClass('');
        setStudentQuery('');
    }

    return (
        <div className="space-y-8">
            {/* Кому */}
            <div>
                <div className="inline-flex rounded-full border border-primary/15 p-1 mb-4">
                    <button
                        onClick={() => { setTarget('student'); resetForm(); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold uppercase tracking-wide transition-colors ${target === 'student' ? 'bg-primary text-background' : 'text-primary/60'}`}
                    >
                        Учню(ям)
                    </button>
                    <button
                        onClick={() => { setTarget('class'); resetForm(); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold uppercase tracking-wide transition-colors ${target === 'class' ? 'bg-primary text-background' : 'text-primary/60'}`}
                    >
                        Класу
                    </button>
                </div>

                {target === 'student' ? (
                    <div>
                        {selectedStudents.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedStudents.map((s) => (
                                    <span
                                        key={s.student_id}
                                        className="inline-flex items-center gap-1.5 bg-secondary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full"
                                    >
                                        {s.full_name}
                                        <button onClick={() => removeStudent(s.student_id)} className="hover:text-accent">
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
                                placeholder="Почни вводити ім'я учня... (можна додати кількох)"
                                className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                            />
                            {studentQuery && studentOptions.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-primary/10 rounded-xl shadow-lg overflow-hidden">
                                    {studentOptions
                                        .filter((s) => !selectedStudents.some((x) => x.student_id === s.student_id))
                                        .map((s) => (
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
                        {selectedStudents.length > 1 && (
                            <p className="text-xs text-primary/50 mt-1.5">
                                Усім {selectedStudents.length} учням буде нараховано однакову кількість балів з однаковим поясненням.
                            </p>
                        )}
                    </div>
                ) : (
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-primary/15 bg-white/60 text-sm focus:outline-none focus:border-secondary"
                    >
                        <option value="">Обери клас...</option>
                        {classOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Ситуації зі Статуту */}
            <div>
                <h2 className="font-grotesk font-semibold text-sm text-primary/70 uppercase tracking-wide mb-3">
                    Ситуація зі Статуту
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
                                {s.points !== null ? ` · ${s.points > 0 ? '+' : ''}${s.points} балів` : ' · довільна сума'}
                                {s.statute_ref ? ` · ${s.statute_ref}` : ''}
                            </div>
                        </button>
                    ))}
                </div>
                <button
                    onClick={resetForm}
                    className="mt-2 text-xs text-primary/50 underline"
                >
                    Або ввести довільне нарахування вручну
                </button>
            </div>

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
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
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
                </div>

                <div>
                    <label className="block text-xs font-grotesk font-semibold uppercase tracking-wide text-primary/60 mb-1.5">
                        Пояснення (видно editor-у, учню/класу-отримувачу)
                    </label>
                    <textarea
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary/15 bg-white text-sm resize-none"
                    />
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
                    Нарахувати
                </button>
            </div>
        </div>
    );
}
