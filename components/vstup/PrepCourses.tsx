'use client';

import { motion } from "motion/react";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { PREP_COURSES } from "./topicsData";

export default function PrepCourses() {
    const smoothOut = [0.16, 1, 0.3, 1] as const;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: smoothOut }}
            className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-20 scroll-mt-24"
            id="courses"
        >
            <span className="inline-flex items-center gap-2 font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
                <span className="w-6 h-px bg-secondary" />
                Підготовка
            </span>

            <h2 className="font-manrope font-bold text-primary text-3xl md:text-4xl tracking-tight mb-4 max-w-2xl">
                Підготовчі курси ліцею
            </h2>

            <p className="text-base text-primary/65 max-w-2xl mb-8 leading-relaxed">
                Заняття ведуть учителі ліцею. Курси не дають переваг на конкурсі, але
                показують рівень задач, яких варто очікувати.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {PREP_COURSES.map((course) => (
                    <div
                        key={course.id}
                        className="rounded-2xl border border-primary/10 bg-primary/[0.02] p-6 md:p-7 flex flex-col"
                    >
                        <span className="inline-flex self-start items-center font-manrope text-[11px] font-bold uppercase tracking-[0.14em] text-secondary bg-secondary/10 rounded-full px-3 py-1 mb-4">
                            {course.audience}
                        </span>

                        <h3 className="font-manrope font-bold text-primary text-xl tracking-tight">
                            {course.title}
                        </h3>

                        <p className="mt-2 text-sm text-primary/60 leading-relaxed">
                            {course.lead}
                        </p>

                        <dl className="mt-5 flex flex-col">
                            {course.details.map((detail) => (
                                <div
                                    key={detail.label}
                                    className="flex flex-col sm:flex-row sm:gap-4 py-2.5 border-b border-primary/[0.07]"
                                >
                                    <dt className="font-manrope text-[11px] font-semibold uppercase tracking-wider text-primary/40 sm:w-28 shrink-0 pt-0.5">
                                        {detail.label}
                                    </dt>
                                    <dd className="text-sm text-primary/75 leading-relaxed">
                                        {detail.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-5">
                            <p className="font-manrope text-[11px] font-semibold uppercase tracking-wider text-primary/40 mb-2">
                                Викладачі
                            </p>
                            <ul className="flex flex-col gap-1.5">
                                {course.teachers.map((teacher) => (
                                    <li key={teacher.subject} className="text-sm text-primary/75">
                                        <span className="text-primary/45">{teacher.subject}: </span>
                                        {teacher.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {course.contacts && (
                            <div className="mt-5 flex flex-col gap-2">
                                {course.contacts.phone && (
                                    <a
                                        href={`tel:${course.contacts.phone}`}
                                        className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors"
                                    >
                                        <Phone size={14} className="text-primary/40" />
                                        {course.contacts.phone}
                                        {course.contacts.phoneNote && (
                                            <span className="text-primary/40">
                                                · {course.contacts.phoneNote}
                                            </span>
                                        )}
                                    </a>
                                )}

                                {course.contacts.email && (
                                    <a
                                        href={`mailto:${course.contacts.email}`}
                                        className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary transition-colors"
                                    >
                                        <Mail size={14} className="text-primary/40" />
                                        {course.contacts.email}
                                    </a>
                                )}
                            </div>
                        )}

                        <a
                            href={course.registerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-manrope text-sm font-semibold text-background hover:bg-primary/90 transition-colors"
                        >
                            {course.registerLabel}
                            <ArrowUpRight
                                size={15}
                                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </a>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
