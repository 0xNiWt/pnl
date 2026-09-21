'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StaffDepartment, StaffRow } from '@/lib/staff';

const smoothOut = [0.16, 1, 0.3, 1] as const;

function initials(fullName: string) {
    const parts = fullName.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

// Рядок педагога як на старому сайті ліцею: фото ліворуч, ім'я та посада праворуч.
function MemberRow({ member }: { member: StaffRow }) {
    return (
        <article className="flex flex-col sm:flex-row gap-5 sm:gap-7 py-7 border-b border-primary/10 last:border-b-0">
            <div className="relative w-36 h-48 sm:w-40 sm:h-52 shrink-0 overflow-hidden bg-secondary/10 ring-1 ring-secondary/25 mx-auto sm:mx-0">
                {member.photo_url ? (
                    <Image
                        src={member.photo_url}
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

export default function StaffDirectory({ departments }: { departments: StaffDepartment[] }) {
    const [deptIndex, setDeptIndex] = useState(0);
    const dept = departments[deptIndex] ?? { title: "", members: [] };

    return (
        <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-10 md:py-16" id="staff">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
                {/* Кафедри — бічне меню, як на старому сайті */}
                <nav aria-label="Кафедри" className="lg:sticky lg:top-28" data-no-reveal>
                    <p className="flex items-center gap-2 mb-3 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep">
                        <span className="w-10 h-0.5 bg-secondary" />
                        Кафедри
                    </p>

                    {/* На телефоні — випадний список */}
                    <select
                        value={deptIndex}
                        onChange={(e) => setDeptIndex(Number(e.target.value))}
                        className="lg:hidden w-full bg-white border border-secondary/40 rounded-none px-4 py-3 font-manrope font-semibold text-primary"
                        aria-label="Оберіть кафедру"
                    >
                        {departments.map((d, i) => (
                            <option key={d.title} value={i}>{d.title}</option>
                        ))}
                    </select>

                    <ul className="hidden lg:flex flex-col border border-secondary/70 bg-white">
                        {departments.map((d, i) => {
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
                                                : 'border-l-transparent text-primary/85 hover:bg-secondary/[0.3] hover:text-primary'
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
                    <AnimatePresence mode="wait" initial={false}>
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
