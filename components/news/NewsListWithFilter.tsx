'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import NewsCard from './NewsCard';

type NewsItem = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_url: string | null;
    published_at: string | null;
};

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function NewsListWithFilter({ initialNews }: { initialNews: NewsItem[] }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Date | null>(null);
    const [viewDate, setViewDate] = useState(() => new Date());

    const newsDates = useMemo(
        () => initialNews.filter((n) => n.published_at).map((n) => new Date(n.published_at as string)),
        [initialNews]
    );

    const filtered = selected
        ? initialNews.filter((n) => n.published_at && sameDay(new Date(n.published_at), selected))
        : initialNews;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [
        ...Array(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];

    const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-8">
                <p className="text-sm text-primary/50">
                    {selected
                        ? `Новини за ${selected.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : `Усього новин: ${initialNews.length}`}
                </p>

                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                            selected
                                ? 'border-secondary bg-secondary/10 text-primary'
                                : 'border-primary/10 bg-primary/[0.02] text-primary/70 hover:border-primary/20'
                        }`}
                    >
                        <CalendarDays size={16} />
                        {selected
                            ? selected.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
                            : 'Обрати дату'}
                    </button>

                    {open && (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-primary/10 bg-background p-4 shadow-xl">
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={goPrevMonth}
                                    className="w-7 h-7 rounded-lg hover:bg-primary/5 flex items-center justify-center text-primary/60"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="font-manrope font-bold text-sm text-primary">
                                    {MONTHS[month]} {year}
                                </span>
                                <button
                                    type="button"
                                    onClick={goNextMonth}
                                    className="w-7 h-7 rounded-lg hover:bg-primary/5 flex items-center justify-center text-primary/60"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {WEEKDAYS.map((d) => (
                                    <span key={d} className="text-center text-[10px] font-semibold uppercase text-primary/40 py-1">
                                        {d}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {cells.map((date, i) => {
                                    if (!date) return <span key={i} />;
                                    const hasNews = newsDates.some((d) => sameDay(d, date));
                                    const isSelected = selected !== null && sameDay(date, selected);

                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setSelected(isSelected ? null : date);
                                                setOpen(false);
                                            }}
                                            className={`relative aspect-square rounded-lg text-xs flex items-center justify-center transition-colors ${
                                                isSelected
                                                    ? 'bg-primary text-background font-bold'
                                                    : hasNews
                                                        ? 'text-primary font-semibold hover:bg-primary/10'
                                                        : 'text-primary/30 hover:bg-primary/5'
                                            }`}
                                        >
                                            {date.getDate()}
                                            {hasNews && !isSelected && (
                                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {selected && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelected(null);
                                        setOpen(false);
                                    }}
                                    className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 py-2 text-xs font-semibold text-primary/60 transition-colors"
                                >
                                    <X size={13} />
                                    Скинути фільтр
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((item) => (
                        <NewsCard
                            key={item.id}
                            slug={item.slug}
                            title={item.title}
                            excerpt={item.excerpt}
                            coverUrl={item.cover_url}
                            publishedAt={item.published_at}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-primary/50 py-16">
                    {selected ? 'На цю дату новин немає.' : 'Поки що немає опублікованих новин. Зазирніть пізніше.'}
                </p>
            )}
        </div>
    );
}
