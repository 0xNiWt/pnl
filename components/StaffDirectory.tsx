'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

type StaffMember = {
    name: string;
    position: string;
    photo?: string;
};

type Department = {
    title: string;
    members: StaffMember[];
};

const DEPARTMENTS: Department[] = [
    {
        title: 'Адміністрація',
        members: [
            { name: 'Левтік Микола Миколайович', position: 'Почесний директор ліцею, Заслужений працівник освіти України, вчитель-методист, відмінник освіти, вчитель фізики та практикуму', photo: '/staff/levtik.jpg' },
            { name: 'Гуменюк Ярослав Олександрович', position: "Тимчасово виконуючий обов'язки директора, вчитель фізики, кандидат фізико-математичних наук, випускник ліцею 1990 року", photo: '/staff/gumenyuk.jpg' },
            { name: 'Федорів Любомир Атанасійович', position: 'Заступник директора з навчально-виховної роботи, методист, Заслужений вчитель України, вчитель інформатики', photo: '/staff/fedoriv-lyubomyr.jpg' },
            { name: 'Лятамбур Костянтин Миколайович', position: 'Заступник директора з наукової роботи, Заслужений учитель України, вчитель-методист, учитель вищої категорії, вчитель математики', photo: '/staff/lyatambur.jpg' },
            { name: 'Пономарьова Надія Анатоліївна', position: 'Заступник директора, Заслужений вчитель України', photo: '/staff/ponomarova.jpg' },
            { name: 'Заболотня Олена Федорівна', position: 'Заступник директора з НВР, учитель вищої категорії, учитель-методист, відмінник освіти, учитель української мови та літератури', photo: '/staff/zabolotnya.jpg' },
        ],
    },
    {
        title: 'Кафедра української мови та літератури',
        members: [
            { name: 'Бондаренко Людмила Петрівна', position: 'Учитель вищої категорії, учитель української мови та літератури, старший учитель', photo: '/staff/bondarenko.jpg' },
            { name: 'Медведенко Оксана Анатоліївна', position: 'Учитель вищої категорії, старший учитель, учитель української мови та літератури, поетеса, член Спілки журналістів України', photo: '/staff/medvedenko.jpg' },
            { name: 'Романчикова Любов Іванівна', position: 'Учитель вищої категорії, старший вчитель, вчитель світової літератури, відмінник освіти України' },
            { name: 'Федорів Марія Любомирівна', position: 'Учитель української мови та літератури' },
            { name: 'Риженко Світлана Олександрівна', position: 'Учитель зарубіжної літератури' },
            { name: 'Заболотня Олена Федорівна', position: 'Заступник директора з НВР, учитель вищої категорії, учитель-методист, відмінник освіти, учитель української мови та літератури', photo: '/staff/zabolotnya.jpg' },
        ],
    },
    {
        title: 'Кафедра історії та правознавства',
        members: [
            { name: 'Торчило Олена Петрівна', position: 'Методист, учитель історії України і всесвітньої історії та права', photo: '/staff/torchylo.jpg' },
            { name: 'Фурсова Олена Юріївна', position: 'Учитель історії України та всесвітньої історії', photo: '/staff/fursova.jpg' },
        ],
    },
    {
        title: 'Кафедра математики',
        members: [
            { name: 'Виннишин Ярослав Федорович', position: 'Кандидат фізико-математичних наук, вчитель математики', photo: '/staff/vynnyshyn.jpg' },
            { name: 'Кушнір Юрій Анатолійович', position: 'Старший вчитель, відмінник освіти, учитель вищої категорії, вчитель математики', photo: '/staff/kushnir.jpg' },
            { name: 'Савченко Ігор Олександрович', position: 'Кандидат фізико-математичних наук, учитель вищої категорії, вчитель математики', photo: '/staff/savchenko.jpg' },
            { name: 'Сагайдак Тетяна Василівна', position: 'Старший учитель, учитель вищої категорії, вчитель математики', photo: '/staff/sagaydak.jpg' },
            { name: 'Сидоренко Ірина Володимирівна', position: 'Учитель вищої категорії, вчитель математики, випускниця ліцею 1977 року', photo: '/staff/sydorenko.jpg' },
            { name: 'Бохонова Тетяна Юріївна', position: 'Учитель математики', photo: '/staff/bokhonova.jpg' },
            { name: 'Мороз Микола Петрович', position: 'Доктор філософії (PhD) з математики, вчитель вищої категорії, вчитель математики' },
            { name: 'Єлагін Володимир Олексійович', position: 'Вчитель математики' },
            { name: 'Лятамбур Костянтин Миколайович', position: 'Заступник директора з наукової роботи, Заслужений учитель України, вчитель-методист, учитель вищої категорії, вчитель математики', photo: '/staff/lyatambur.jpg' },
        ],
    },
    {
        title: 'Кафедра фізики',
        members: [
            { name: 'Перга Вікторія Віталіївна', position: 'Методист, нагороджена знаком "Відмінник освіти", знаком "Сухомлинський", учитель фізики' },
            { name: 'Розенвайн Олексій Григорович', position: 'Методист, Заслужений учитель України, вчитель фізики', photo: '/staff/rozenvain.jpg' },
            { name: 'Гудзь Олександр Якович', position: 'Учитель фізики, практикуму, нагороджений знаком "Відмінник освіти"', photo: '/staff/gudz.jpg' },
            { name: 'Зінчук Вадим Миколайович', position: 'Вчитель фізики', photo: '/staff/zinchuk.jpg' },
            { name: 'Янковська Марія Миколаївна', position: 'Учителька фізики і астрономії, методист, вища категорія' },
            { name: 'Яковенко Ігор Сергійович', position: 'Учитель фізики' },
            { name: 'Лєньков Станіслав Сергійович', position: 'Учитель фізики' },
            { name: 'Левтік Микола Миколайович', position: 'Почесний директор ліцею, Заслужений працівник освіти України, вчитель-методист, відмінник освіти, вчитель фізики та практикуму', photo: '/staff/levtik.jpg' },
            { name: 'Гуменюк Ярослав Олександрович', position: "Тимчасово виконуючий обов'язки директора, вчитель фізики, кандидат фізико-математичних наук, випускник ліцею 1990 року", photo: '/staff/gumenyuk.jpg' },
        ],
    },
    {
        title: 'Кафедра інформатики',
        members: [
            { name: "Лук'янчикова Тетяна Володимирівна", position: 'Учитель інформатики', photo: '/staff/lukyanchykova.jpg' },
            { name: 'Скляр Ірина Вільївна', position: 'Методист, Заслужений вчитель України, вчитель інформатики', photo: '/staff/sklyar.jpg' },
            { name: 'Федорів Любомир Атанасійович', position: 'Заступник директора з навчально-виховної роботи, методист, Заслужений вчитель України, вчитель інформатики', photo: '/staff/fedoriv-lyubomyr.jpg' },
        ],
    },
    {
        title: 'Кафедра англійської мови',
        members: [
            { name: 'Муринська Вікторія Вікторівна', position: 'Учитель англійської мови', photo: '/staff/murynska.jpg' },
            { name: 'Махрова Ольга Василівна', position: 'Учитель англійської мови' },
        ],
    },
    {
        title: 'Кафедра природничих наук',
        members: [
            { name: 'Рустамова Віра Петрівна', position: 'Учитель-методист, учитель географії', photo: '/staff/rustamova.jpg' },
            { name: 'Ковальчук Оксана Петрівна', position: 'Учитель вищої категорії, вчитель біології' },
            { name: 'Ястребцова Наталія Іванівна', position: 'Заслужений учитель України, учитель-методист, учитель біології', photo: '/staff/yastrebtsova.jpg' },
            { name: 'Махоткіна Наталія Станіславівна', position: 'Заслужений учитель України, учитель-методист, учитель хімії' },
            { name: 'Зубченко Володимир Петрович', position: 'Вчитель економіки' },
            { name: 'Бодюл Наталія Сергіївна', position: 'Кандидат хімічних наук, учитель вищої категорії, старший вчитель, вчитель хімії', photo: '/staff/bodyul.jpg' },
            { name: 'Євдокименко Олексій Михайлович', position: 'Учитель біології' },
        ],
    },
    {
        title: 'Кафедра захисту України',
        members: [],
    },
    {
        title: 'Кафедра фізичної культури',
        members: [],
    },
    {
        title: 'Психологічна служба',
        members: [
            { name: 'Ільїнський Анісім Андрійович', position: 'Практичний психолог, соціальний педагог', photo: '/staff/ilyinskyy.jpg' },
        ],
    },
];

function initials(fullName: string) {
    const parts = fullName.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function StaffDirectory() {
    const [deptIndex, setDeptIndex] = useState(0);
    const [memberIndex, setMemberIndex] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [direction, setDirection] = useState(0);

    const dept = DEPARTMENTS[deptIndex];
    const member = dept.members[memberIndex];
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    const selectDept = (i: number) => {
        setDeptIndex(i);
        setMemberIndex(0);
        setDirection(0);
        setMenuOpen(false);
    };

    const goTo = (dir: 1 | -1) => {
        if (dept.members.length === 0) return;
        setDirection(dir);
        setMemberIndex((prev) => (prev + dir + dept.members.length) % dept.members.length);
    };

    return (
        <section className="max-w-4xl mx-auto px-5 md:px-6 py-10 md:py-16" id="staff">
            <div className="flex items-center gap-2 mb-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                <span className="w-6 h-px bg-secondary" />
                Педагогічний колектив
            </div>

            {/* Department selector */}
            <div className="relative mb-8 md:mb-10">
                <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="w-full flex items-center justify-between gap-3 bg-white border border-primary/15 rounded-xl px-5 py-4 h-[60px] md:h-[64px] text-left hover:border-primary/30 transition-colors"
                >
                    <span className="font-grotesk font-bold text-primary text-lg md:text-xl tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                        {dept.title}
                    </span>
                    {menuOpen ? (
                        <X size={20} className="text-primary/60 shrink-0" />
                    ) : (
                        <Menu size={20} className="text-primary/60 shrink-0" />
                    )}
                </button>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: smoothOut }}
                            className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-primary/15 rounded-xl shadow-lg overflow-hidden max-h-[360px] overflow-y-auto"
                        >
                            {DEPARTMENTS.map((d, i) => (
                                <button
                                    key={d.title}
                                    type="button"
                                    onClick={() => selectDept(i)}
                                    className={`w-full text-left px-5 py-3.5 text-sm border-b border-primary/5 last:border-b-0 transition-colors ${
                                        i === deptIndex
                                            ? 'bg-primary/5 text-primary font-semibold'
                                            : 'text-primary/70 hover:bg-primary/[0.03]'
                                    }`}
                                >
                                    {d.title}
                                    {d.members.length === 0 && (
                                        <span className="ml-2 text-xs text-primary/35">незабаром</span>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Single-focus carousel */}
            {dept.members.length === 0 ? (
                <div className="text-center py-16 text-primary/40 text-sm">
                    Інформація про кафедру з&apos;явиться найближчим часом.
                </div>
            ) : (
                <div className="flex items-center justify-center gap-3 md:gap-6">
                    <button
                        type="button"
                        onClick={() => goTo(-1)}
                        aria-label="Попередній педагог"
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-primary/15 flex items-center justify-center text-primary/60 hover:text-primary hover:border-primary/40 transition-colors shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="relative w-full max-w-sm overflow-hidden">
                        <AnimatePresence mode="wait" custom={direction} initial={false}>
                            <motion.div
                                key={`${deptIndex}-${memberIndex}`}
                                custom={direction}
                                initial={{ opacity: 0, x: direction >= 0 ? 60 : -60 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction >= 0 ? -60 : 60 }}
                                transition={{ duration: 0.35, ease: smoothOut }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.6}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x < -60) goTo(1);
                                    else if (info.offset.x > 60) goTo(-1);
                                }}
                                className="flex flex-col items-center text-center bg-white border border-primary/10 rounded-2xl px-6 py-10 cursor-grab active:cursor-grabbing"
                            >
                                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden bg-primary/5 mb-6 ring-1 ring-primary/10">
                                    {member.photo ? (
                                        <Image
                                            src={member.photo}
                                            alt={member.name}
                                            fill
                                            sizes="192px"
                                            className="object-cover"
                                            draggable={false}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-grotesk font-bold text-3xl text-primary/30">
                                            {initials(member.name)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-grotesk font-bold text-primary text-lg leading-snug">
                                    {member.name}
                                </h3>
                                <p className="mt-2 text-sm text-primary/60 leading-snug max-w-[280px]">
                                    {member.position}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button
                        type="button"
                        onClick={() => goTo(1)}
                        aria-label="Наступний педагог"
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-primary/15 flex items-center justify-center text-primary/60 hover:text-primary hover:border-primary/40 transition-colors shrink-0"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {dept.members.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-6">
                    {dept.members.map((m, i) => (
                        <button
                            key={m.name}
                            type="button"
                            onClick={() => {
                                setDirection(i > memberIndex ? 1 : -1);
                                setMemberIndex(i);
                            }}
                            aria-label={`Педагог ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all ${
                                i === memberIndex ? 'w-6 bg-primary' : 'w-1.5 bg-primary/20'
                            }`}
                        />
                    ))}
                </div>
            )}

            {dept.members.length > 0 && (
                <p className="text-center text-xs text-primary/40 mt-3">
                    {memberIndex + 1} / {dept.members.length}
                </p>
            )}
        </section>
    );
}
