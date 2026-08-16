'use client';

export default function Hero() {
    const lessons = [
        { num: 1, time: "08:30–09:15" },
        { num: 2, time: "09:25–10:10" },
        { num: 3, time: "10:20–11:05" },
        { num: 4, time: "11:25–12:10" },
        { num: 5, time: "12:30–13:15" },
        { num: 6, time: "13:25–14:10" },
        { num: 7, time: "14:20–15:05" },
        { num: 8, time: "15:15–16:00" },
    ];

    const stats = [
        { value: "64", label: "роки історії ліцею" },
        { value: "53", label: "переможці міжнародних олімпіад" },
        { value: "40", label: "педагогів" },
        { value: "85%", label: "Кількість вступників у топові виші" },
    ];

    return (
        <section className="max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-24" id="hero">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] items-start md:items-center gap-8 md:gap-12 py-10 md:py-24">
                <div className="text-center md:text-left">
                    <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                        <span className="w-6 h-px bg-secondary" />
                        Природничий науковий ліцей · Київ
                    </span>

                    <h1 className="font-manrope font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2.4vw,4.2rem)]">
                        Навчання, що<br />починається з <span className="text-accent">«чому»</span>
                    </h1>

                    <p className="mt-5 text-base text-primary/70 max-w-[480px] mx-auto md:mx-0">
                        Профільна фізико-математична та природнича підготовка, лабораторні
                        практикуми та вчителі, які пам&apos;ятають ваше ім&apos;я. Ліцей №145 готує
                        до вступу в провідні університети з 1962 року.
                    </p>
                </div>

                <div className="relative w-full max-w-[380px] md:max-w-[400px] mx-auto md:mx-0 md:justify-self-end overflow-hidden rounded-[20px] bg-primary p-7 text-background">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/35 blur-[60px]" />

                    <div className="mb-3.5 font-manrope font-bold text-xs uppercase tracking-[0.15em] text-cream/80">
                        Розклад дзвінків · Сьогодні
                    </div>

                    <div className="relative flex flex-col">
                        {lessons.map((lesson) => (
                            <div
                                key={lesson.num}
                                className="flex items-baseline gap-3 border-b border-background/10 py-2.5 text-sm last:border-none"
                            >
                                <span className="w-6 font-bebas text-xl text-accent">{lesson.num}</span>
                                <span>Урок</span>
                                <span className="ml-auto tabular-nums text-background/65">{lesson.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 rounded-2xl border border-primary/10 bg-primary/[0.03] overflow-hidden divide-primary/10">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className={`flex flex-col items-center justify-center text-center gap-1 px-4 py-8 border-primary/10
                            ${i % 2 === 0 ? "border-r" : ""}
                            ${i < 2 ? "border-b md:border-b-0" : ""}
                            ${i > 0 ? "md:border-l" : ""}
                            ${i === 2 ? "md:border-r-0" : ""}
                        `}
                    >
                        <h4 className="font-manrope font-bold text-primary text-3xl md:text-4xl">{stat.value}</h4>
                        <p className="font-inter text-primary/60 text-sm max-w-[140px] leading-snug">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}