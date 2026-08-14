'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

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
        title: 'Кафедра мови та літератури',
        members: [
            { name: 'Бондаренко Людмила Петрівна', position: 'Учитель вищої категорії, учитель української мови та літератури, старший учитель', photo: '/staff/bondarenko.jpg' },
            { name: 'Медведенко Оксана Анатоліївна', position: 'Учитель вищої категорії, старший учитель, учитель української мови та літератури, поетеса, член Спілки журналістів України', photo: '/staff/medvedenko.jpg' },
            { name: 'Романчикова Любов Іванівна', position: 'Учитель вищої категорії, старший вчитель, вчитель світової літератури, відмінник освіти України' },
            { name: 'Федорів Марія Любомирівна', position: 'Учитель української мови та літератури' },
            { name: 'Риженко Світлана Олександрівна', position: 'Учитель зарубіжної літератури' },
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
            { name: 'Мороз Микола Петрович', position: 'Доктор філософії (PhD) з математики, вчитель вищої категорії, вчитель математики', photo: '/staff/moroz.jpg' },
            { name: 'Єлагін Володимир Олексійович', position: 'Вчитель математики', photo: '/staff/yelagin.jpg' },
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
        ],
    },
    {
        title: 'Кафедра інформатики',
        members: [
            { name: "Лук'янчикова Тетяна Володимирівна", position: 'Учитель інформатики', photo: '/staff/lukyanchykova.jpg' },
            { name: 'Скляр Ірина Вільївна', position: 'Методист, Заслужений вчитель України, вчитель інформатики', photo: '/staff/sklyar.jpg' },
        ],
    },
    {
        title: 'Кафедра англійської мови',
        members: [
            { name: 'Муринська Вікторія Вікторівна', position: 'Учитель англійської мови', photo: '/staff/murynska.jpg' },
            { name: 'Махрова Ольга Василівна', position: 'Учитель англійської мови', photo: '/staff/makhrova.jpg' },
        ],
    },
    {
        title: 'Кафедра природничих наук',
        members: [
            { name: 'Рустамова Віра Петрівна', position: 'Учитель-методист, учитель географії', photo: '/staff/rustamova.jpg' },
            { name: 'Ковальчук Оксана Петрівна', position: 'Учитель вищої категорії, вчитель біології' },
            { name: 'Ястребцова Наталія Іванівна', position: 'Заслужений учитель України, учитель-методист, учитель біології', photo: '/staff/yastrebtsova.jpg' },
            { name: 'Махоткіна Наталія Станіславівна', position: 'Заслужений учитель України, учитель-методист, учитель хімії' },
            { name: 'Зубченко Володимир Петрович', position: 'Вчитель економіки', photo: '/staff/zubchenko.jpg' },
            { name: 'Бодюл Наталія Сергіївна', position: 'Кандидат хімічних наук, учитель вищої категорії, старший вчитель, вчитель хімії', photo: '/staff/bodyul.jpg' },
            { name: 'Євдокименко Олексій Михайлович', position: 'Учитель біології' },
        ],
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
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <section className="max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-20" id="staff">
            {DEPARTMENTS.map((dept) => (
                <div key={dept.title} className="mb-14 md:mb-20 last:mb-0">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: smoothOut }}
                        className="mb-8 md:mb-10"
                    >
                        <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-3">
                            <span className="w-6 h-px bg-secondary" />
                            Педагогічний колектив
                        </span>
                        <h2 className="font-grotesk font-bold text-primary text-2xl md:text-3xl tracking-tight">
                            {dept.title}
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {dept.members.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: (i % 6) * 0.05, ease: smoothOut }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-primary/5 mb-4 ring-1 ring-primary/10">
                                    {member.photo ? (
                                        <Image
                                            src={member.photo}
                                            alt={member.name}
                                            fill
                                            sizes="144px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-grotesk font-bold text-2xl text-primary/30">
                                            {initials(member.name)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-grotesk font-bold text-primary text-[15px] leading-snug">
                                    {member.name}
                                </h3>
                                <p className="mt-1.5 text-sm text-primary/60 leading-snug max-w-[280px]">
                                    {member.position}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
