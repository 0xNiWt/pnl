'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
            { name: 'Заболотня Олена Федорівна', position: 'Директор ліцею, учитель вищої категорії, учитель-методист, відмінник освіти, учитель української мови та літератури', photo: '/staff/zabolotnya.jpg' },
            { name: 'Федорів Любомир Атанасійович', position: 'Заступник директора з навчально-виховної роботи, методист, Заслужений вчитель України, вчитель інформатики', photo: '/staff/fedoriv-lyubomyr.jpg' },
            { name: 'Пономарьова Надія Анатоліївна', position: 'Заступник директора, Заслужений вчитель України', photo: '/staff/ponomarova.jpg' },
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
            { name: 'Заболотня Олена Федорівна', position: 'Директор ліцею, учитель вищої категорії, учитель-методист, відмінник освіти, учитель української мови та літератури', photo: '/staff/zabolotnya.jpg' },
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
        ],
    },
    {
        title: 'Кафедра фізики',
        members: [
            { name: 'Перга Вікторія Віталіївна', position: 'Методист, нагороджена знаком "Відмінник освіти", знаком "Сухомлинський", учитель фізики' },
            { name: 'Розенвайн Олексій Григорович', position: 'Методист, Заслужений учитель України, вчитель фізики', photo: '/staff/rozenvain.jpg' },
            { name: 'Гудзь Олександр Якович', position: 'Учитель фізики, практикуму, нагороджений знаком "Відмінник освіти"', photo: '/staff/gudz.jpg' },
            { name: 'Янковська Марія Миколаївна', position: 'Учителька фізики і астрономії, методист, вища категорія' },
            { name: 'Яковенко Ігор Сергійович', position: 'Учитель фізики' },
            { name: 'Лєньков Станіслав Сергійович', position: 'Учитель фізики' },
            { name: 'Левтік Микола Миколайович', position: 'Почесний директор ліцею, Заслужений працівник освіти України, вчитель-методист, відмінник освіти, вчитель фізики та практикуму', photo: '/staff/levtik.jpg' },
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
        members: [
            { name: 'Атаманенко Олексій Павлович', position: 'Учитель фізичної культури' },
            { name: 'Ржанська Тетяна Петрівна', position: 'Учитель фізичної культури' },
        ],
    },
    {
        title: 'Психологічна служба',
        members: [
            { name: 'Ільїнський Анісім Андрійович', position: 'Практичний психолог, соціальний педагог', photo: '/staff/ilyinskyy.jpg' },
        ],
    },
];

const smoothOut = [0.16, 1, 0.3, 1] as const;

function initials(fullName: string) {
    const parts = fullName.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

// Рядок педагога як на старому сайті ліцею: фото ліворуч, ім'я та посада праворуч.
function MemberRow({ member }: { member: StaffMember }) {
    return (
        <article className="flex flex-col sm:flex-row gap-5 sm:gap-7 py-7 border-b border-primary/10 last:border-b-0">
            <div className="relative w-36 h-48 sm:w-40 sm:h-52 shrink-0 overflow-hidden bg-secondary/10 ring-1 ring-secondary/25 mx-auto sm:mx-0">
                {member.photo ? (
                    <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-manrope font-bold text-3xl text-secondary-deep/40">
                        {initials(member.name)}
                    </div>
                )}
            </div>
            <div className="min-w-0 text-center sm:text-left sm:pt-2">
                <h3 className="font-cormorant font-bold text-primary text-2xl md:text-[1.7rem] leading-tight">
                    {member.name}
                </h3>
                <span className="block w-10 h-0.5 bg-secondary my-3 mx-auto sm:mx-0" />
                <p className="text-[15px] text-primary/85 leading-relaxed max-w-2xl">
                    {member.position}
                </p>
            </div>
        </article>
    );
}

export default function StaffDirectory() {
    const [deptIndex, setDeptIndex] = useState(0);
    const dept = DEPARTMENTS[deptIndex];

    return (
        <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-16" id="staff">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
                {/* Кафедри — бічне меню, як на старому сайті */}
                <nav aria-label="Кафедри" className="lg:sticky lg:top-28" data-no-reveal>
                    <p className="flex items-center gap-2 mb-3 font-plex text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary-deep">
                        <span className="w-6 h-px bg-secondary" />
                        Кафедри
                    </p>

                    {/* На телефоні — випадний список */}
                    <select
                        value={deptIndex}
                        onChange={(e) => setDeptIndex(Number(e.target.value))}
                        className="lg:hidden w-full bg-white border border-secondary/40 rounded-none px-4 py-3 font-manrope font-semibold text-primary"
                        aria-label="Оберіть кафедру"
                    >
                        {DEPARTMENTS.map((d, i) => (
                            <option key={d.title} value={i}>{d.title}</option>
                        ))}
                    </select>

                    <ul className="hidden lg:flex flex-col border border-secondary/30 bg-white">
                        {DEPARTMENTS.map((d, i) => {
                            const active = i === deptIndex;
                            return (
                                <li key={d.title} className="border-b border-secondary/15 last:border-b-0">
                                    <button
                                        type="button"
                                        onClick={() => setDeptIndex(i)}
                                        aria-current={active}
                                        className={`w-full text-left px-4 py-3 text-sm font-semibold border-l-4 transition-colors ${
                                            active
                                                ? 'border-l-secondary bg-secondary/15 text-primary'
                                                : 'border-l-transparent text-primary/85 hover:bg-secondary/[0.07] hover:text-primary'
                                        }`}
                                    >
                                        {d.title}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="bg-white/70 border border-primary/10 px-5 md:px-8 py-2" data-no-reveal>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={dept.title}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.35, ease: smoothOut }}
                        >
                            <h2 className="pt-6 pb-4 border-b-2 border-secondary font-cormorant font-bold text-primary text-3xl leading-tight">
                                {dept.title}
                            </h2>

                            {dept.members.length === 0 ? (
                                <p className="py-14 text-center text-primary/65 text-sm">
                                    Інформація про кафедру з&apos;явиться найближчим часом.
                                </p>
                            ) : (
                                dept.members.map((m) => <MemberRow key={m.name} member={m} />)
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
