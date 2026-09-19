import Image from "next/image";
import building from "@/public/about/building.jpg";

// Профільні предмети — ті самі, що описані нижче на сторінці.
const SUBJECTS = ["Фізика", "Математика", "Хімія", "Інформатика"];

// Обкладинка сторінки: знімок будівлі, поверх нього чорнильна заливка,
// що згори прозора, а внизу суцільна — на ній і стоїть текст.
export default function BuildingHero() {
    return (
        <section
            className="relative isolate h-[72vh] min-h-[460px] w-full overflow-hidden bg-primary md:h-[78vh] md:max-h-[820px]"
            id="building"
        >
            <Image
                src={building}
                alt="Будівля природничо-наукового ліцею №145 навесні: учні виходять із центрального входу"
                fill
                sizes="100vw"
                placeholder="blur"
                priority
                className="object-cover object-[center_62%]"
            />

            {/* Заливка суцільна лише внизу, під текстом; вгорі знімок лишається чистим. */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary from-6% via-primary/55 via-45% to-transparent to-82%" />
            {/* Блакитний відсвіт герба зліва — обкладинка світліша й «наша». */}
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/35 via-transparent to-transparent mix-blend-screen" />

            <div className="absolute inset-x-0 bottom-0">
                <div className="mx-auto w-full max-w-7xl px-5 pb-8 md:px-10 md:pb-12">
                    <span className="flex items-center gap-3 font-plex text-[12px] uppercase tracking-[0.22em] text-background/70">
                        <span className="h-px w-6 bg-secondary" />
                        Київ · засновано 1962
                    </span>

                    {/* Обидва рядки однакового розміру: розмір підібрано так, щоб
                        «Природничо-науковий» уміщався в один рядок і на телефоні. */}
                    <h1 className="mt-5 font-cormorant font-bold leading-[0.92] tracking-[-0.02em] text-background text-[clamp(2.15rem,1rem+5.2vw,6.2rem)]">
                        <span className="block">Природничо-науковий</span>
                        <span className="block">
                            ліцей <span className="text-accent">№&nbsp;145</span>
                        </span>
                    </h1>

                    <p className="mt-5 max-w-[520px] font-inter text-[15px] leading-[1.75] text-background/75">
                        Поглиблені фізика, математика, хімія
                        та інформатика, лабораторні практикуми й наукова робота учнів.
                    </p>

                    {/* Технічний рядок унизу обкладинки — як вихідні дані видання. */}
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-background/20 pt-4 font-plex text-[12px] uppercase tracking-[0.18em] text-background/55">
                        {SUBJECTS.map((subject, i) => (
                            <span key={subject} className="flex items-center gap-6">
                                <span className="text-secondary">{String(i + 1).padStart(2, "0")}</span>
                                {subject}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
