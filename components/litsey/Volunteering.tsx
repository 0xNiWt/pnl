'use client';

import Image from "next/image";
import { motion } from "motion/react";
import { HeartHandshake, Hospital, Store } from "lucide-react";
import fair from "@/public/about/volunteer/fair.jpg";
import hospital2025 from "@/public/about/volunteer/hospital-2025.jpg";
import hospital2026 from "@/public/about/volunteer/hospital-2026.jpg";
import hospitalVisit from "@/public/about/volunteer/hospital-visit.jpg";
import frontParcels from "@/public/about/volunteer/front-parcels.jpg";
import stNicholas from "@/public/about/volunteer/st-nicholas.jpg";
import PhotoCarousel, { type Slide } from "./PhotoCarousel";

// Факти — з новин ліцею (kpnl145.kyiv.ua) про благодійні ярмарки 2022–2025
// та допомогу Головному військовому клінічному госпіталю.
const FAIR_RESULTS = [
    { year: "2025", value: "≈100 000 грн", text: "Підрозділу, де служить випускник ліцею, на Куп’янському напрямку, та морським піхотинцям з Одеси." },
    { year: "2023", value: "60 000 грн", text: "Рекордна на той час сума — 4-му батальйону 4-ї бригади Гвардії наступу «Рубіж» («Сила Свободи»)." },
    { year: "2022", value: "50+", text: "Майстер-класів, лекцій, тренінгів і воркшопів на підтримку Збройних Сил України." },
];

const HOSPITAL_SLIDES: Slide[] = [
    { src: hospital2026, alt: "Медики Військового госпіталю з коробками допомоги від ліцею", caption: "Передача допомоги госпіталю" },
    { src: hospital2025, alt: "Ліцеїсти передають допомогу й відвідують поранених у госпіталі", caption: "Ліцеїсти в госпіталі" },
    { src: hospitalVisit, alt: "Зустріч ліцеїстів із захисниками та благодійна акція", caption: "Тепло долонь і серця — захисникам" },
];

const MORE = [
    { src: frontParcels, alt: "Військові з посилками від ліцеїстів", title: "Посилки на фронт", text: "Зібране ліцеїстами їде просто до підрозділів." },
    { src: stNicholas, alt: "Подарунки від Миколая для вимушено переселених дітей", title: "Подарунки від Миколая", text: "Подарунки для вимушено переселених дітей." },
];

export default function Volunteering() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-primary/15 px-5 md:px-6 py-10 md:py-24"
            id="volunteering"
        >
            <span className="inline-flex items-center gap-2 font-plex text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary-deep mb-4">
                <span className="w-6 h-px bg-secondary" />
                Допомога захисникам
            </span>

            <h2 className="font-cormorant font-bold text-primary text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] leading-[1.02] tracking-[-0.02em] mb-4 max-w-2xl">
                Волонтерство: разом до перемоги
            </h2>

            <p className="text-base text-primary/70 max-w-2xl mb-10 leading-relaxed">
                З перших днів повномасштабної війни ліцей допомагає тим, хто нас захищає.
                Учні, батьки й учителі щороку організовують благодійний ярмарок для ЗСУ
                та окремо збирають кошти й допомогу для лікування поранених у Військовому госпіталі.
            </p>

            {/* Ярмарок */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
                <figure className="relative overflow-hidden bg-primary min-h-[280px]">
                    <Image
                        src={fair}
                        alt="Благодійний ярмарок у ліцеї: столи з виробами, смаколиками й майстер-класами"
                        fill
                        sizes="(max-width: 1024px) 100vw, 640px"
                        className="object-cover"
                        placeholder="blur"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/85 to-transparent" />
                    <figcaption className="absolute bottom-0 left-0 right-0 p-5 font-plex text-xs font-semibold uppercase tracking-[0.14em] text-background">
                        Благодійний осінній ярмарок
                    </figcaption>
                </figure>

                <div className="border border-secondary/30 bg-secondary/[0.07] p-6 md:p-8 flex flex-col">
                    <p className="flex items-center gap-2 font-plex text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-deep">
                        <Store size={16} />
                        Щороку восени
                    </p>
                    <h3 className="mt-2 font-cormorant font-bold text-primary text-3xl leading-tight">
                        Благодійний ярмарок для ЗСУ
                    </h3>
                    <p className="mt-3 text-sm text-primary/70 leading-relaxed">
                        Кожен клас готує свою локацію: випічку й бургери, bubble tea, вироби
                        власноруч, майстер-класи. Додають шахові сеанси одночасної гри,
                        благодійні тенісні матчі та виступ вокального гурту «Співочі ліцеїсти».
                        Усі гроші — на потреби наших захисників.
                    </p>

                    <ul className="mt-6 flex flex-col divide-y divide-secondary/20 border-t border-secondary/20">
                        {FAIR_RESULTS.map((r) => (
                            <li key={r.year} className="flex gap-4 py-3.5">
                                <span className="font-plex text-xs font-bold text-secondary-deep pt-1 w-10 shrink-0">{r.year}</span>
                                <span>
                                    <span className="block font-cormorant font-bold text-2xl text-primary leading-none">{r.value}</span>
                                    <span className="block mt-1 text-sm text-primary/65 leading-snug">{r.text}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Госпіталь */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-stretch">
                <div className="border border-primary/10 bg-primary/[0.03] p-6 md:p-8 flex flex-col order-2 lg:order-1">
                    <p className="flex items-center gap-2 font-plex text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-deep">
                        <Hospital size={16} />
                        Окремий щорічний збір
                    </p>
                    <h3 className="mt-2 font-cormorant font-bold text-primary text-3xl leading-tight">
                        Лікування поранених у Військовому госпіталі
                    </h3>
                    <p className="mt-3 text-sm text-primary/70 leading-relaxed">
                        Крім ярмарку, ліцей щороку окремо збирає кошти на волонтерські збори
                        для лікування захисників у Головному військовому клінічному госпіталі.
                        Волонтерський загін ліцею передає медикам коробки з необхідним і
                        навідується до поранених — як у грудні 2022 року під час акції
                        «Тепло долонь і серця — захисникам України».
                    </p>
                    <p className="mt-auto pt-6 flex items-start gap-2 text-sm font-semibold text-primary">
                        <HeartHandshake size={18} className="text-secondary shrink-0 mt-0.5" />
                        Разом до перемоги — так підписана кожна коробка від ліцею.
                    </p>
                </div>

                <PhotoCarousel
                    slides={HOSPITAL_SLIDES}
                    className="aspect-[4/3] w-full order-1 lg:order-2"
                />
            </div>

            {/* Ще добрі справи */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {MORE.map((item) => (
                    <figure key={item.title} className="group relative overflow-hidden bg-primary aspect-[16/10]">
                        <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 620px"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            placeholder="blur"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
                        <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                            <span className="block font-cormorant font-bold text-2xl text-background">{item.title}</span>
                            <span className="block mt-1 text-sm text-background/85">{item.text}</span>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </motion.section>
    );
}
