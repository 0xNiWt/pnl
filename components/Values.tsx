'use client';

import { motion } from "motion/react";
import { FlaskConical, BookOpen, Users, Trophy } from "lucide-react";

const VALUES = [
    {
        icon: FlaskConical,
        title: "Лабораторна практика",
        text: "Регулярні досліди з фізики, хімії та біології в оснащених кабінетах.",
    },
    {
        icon: BookOpen,
        title: "Профільне навчання",
        text: "Поглиблені програми з фізики, математики та природничих наук.",
    },
    {
        icon: Users,
        title: "Викладацький склад",
        text: "Педагоги з багаторічним досвідом підготовки переможців олімпіад.",
    },
    {
        icon: Trophy,
        title: "Досягнення учнів",
        text: "Десятки перемог на всеукраїнських та міжнародних олімпіадах.",
    },
];

export default function Values() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-24"
            id="values"
        >
            <span className="inline-flex items-center gap-2 font-grotesk text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                <span className="w-6 h-px bg-secondary" />
                Чому обирають нас
            </span>

            <h2 className="font-grotesk font-bold text-primary text-3xl md:text-4xl tracking-tight mb-10 max-w-xl">
                Освіта, побудована на практиці й дослідженні
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {VALUES.map(({ icon: Icon, title, text }) => (
                    <div
                        key={title}
                        className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-6 flex flex-col gap-4"
                    >
                        <span className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center">
                            <Icon size={20} className="text-primary" />
                        </span>
                        <div>
                            <h3 className="font-grotesk font-bold text-primary text-base mb-1.5">{title}</h3>
                            <p className="text-sm text-primary/60 leading-relaxed">{text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
