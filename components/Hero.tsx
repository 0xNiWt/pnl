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

    return (
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] items-start md:items-center gap-8 md:gap-12 px-5 md:px-6 py-10 md:py-24 border-b border-gray-800/20" id="hero">
            <div className="text-center md:text-left">
                <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                    <span className="w-6 h-px bg-secondary" />
                    Природничий науковий ліцей · Київ
                </span>

                <h1 className="font-grotesk font-bold text-primary leading-[1.05] tracking-tight text-[clamp(2rem,1.6rem+2.4vw,4.2rem)]">
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

                <div className="mb-3.5 font-grotesk text-xs uppercase tracking-[0.15em] text-cream/80">
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
        </section>
    );
}