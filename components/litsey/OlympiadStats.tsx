'use client';

import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import {
    formatShare,
    rowShare,
    rowTotal,
    tableTotal,
    yearTotal,
    type OlympiadTable,
} from "@/lib/olympiads";

const smoothOut = [0.16, 1, 0.3, 1] as const;

export default function OlympiadStats({ tables }: { tables: OlympiadTable[] }) {
    if (tables.length === 0) {
        return (
            <section className="w-full max-w-7xl mx-auto px-5 md:px-6 py-16">
                <p className="text-center text-sm text-primary/40">
                    Таблиці ще не заповнені.
                </p>
            </section>
        );
    }

    return (
        <>
            {tables.map((table) => (
                <motion.section
                    key={table.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.85, ease: smoothOut }}
                    className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-16 scroll-mt-28"
                    id={table.id}
                >
                    <TableCard table={table} />
                </motion.section>
            ))}
        </>
    );
}

function TableCard({ table }: { table: OlympiadTable }) {
    const total = tableTotal(table.rows);
    const hasRows = table.rows.length > 0;

    return (
        <div className="rounded-2xl border border-primary/10 bg-primary/[0.02] overflow-hidden">
            <div className="px-5 md:px-6 py-5 border-b border-primary/10 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 font-manrope font-bold text-primary text-xl md:text-2xl tracking-tight">
                        <Trophy size={18} className="text-accent" />
                        {table.title}
                    </h2>
                    {table.subtitle && (
                        <p className="mt-1.5 text-sm text-primary/55 max-w-2xl">{table.subtitle}</p>
                    )}
                </div>

                {total > 0 && (
                    <p className="font-bebas text-4xl text-accent leading-none">
                        {total}
                        <span className="ml-2 font-inter text-xs uppercase tracking-[0.14em] text-primary/40">
                            перемог
                        </span>
                    </p>
                )}
            </div>

            {hasRows ? (
                // Таблиця широка (до 26 колонок років), тому скролиться всередині
                // картки — сторінка по горизонталі не їде.
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-primary/[0.04]">
                                <th className="sticky left-0 z-10 bg-[#F6F1E4] text-left font-manrope text-xs font-semibold uppercase tracking-wider text-primary/60 px-4 py-3 min-w-[200px] border-b border-primary/10">
                                    Предмет
                                </th>
                                <th className="font-manrope text-xs font-semibold uppercase tracking-wider text-primary/60 px-3 py-3 border-b border-primary/10">
                                    Всього
                                </th>
                                <th className="font-manrope text-xs font-semibold uppercase tracking-wider text-primary/60 px-3 py-3 border-b border-primary/10 whitespace-nowrap">
                                    % від усіх
                                </th>
                                {table.years.map((year) => (
                                    <th
                                        key={year}
                                        className="px-2.5 py-3 border-b border-primary/10 font-inter text-[11px] font-medium text-primary/45 whitespace-nowrap"
                                    >
                                        {year}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {table.rows.map((row) => (
                                <tr key={row.subject} className="hover:bg-primary/[0.03] transition-colors">
                                    <th className="sticky left-0 z-10 bg-[#FBF6E9] text-left font-inter font-medium text-primary px-4 py-2.5 border-b border-primary/[0.07]">
                                        {row.subject}
                                    </th>
                                    <td className="text-center font-manrope font-bold text-primary px-3 py-2.5 border-b border-primary/[0.07] tabular-nums">
                                        {rowTotal(row)}
                                    </td>
                                    <td className="text-center text-primary/45 px-3 py-2.5 border-b border-primary/[0.07] tabular-nums whitespace-nowrap">
                                        {formatShare(rowShare(row, total))}
                                    </td>
                                    {table.years.map((year) => {
                                        const value = row.counts[year];

                                        return (
                                            <td
                                                key={year}
                                                className="text-center px-2.5 py-2.5 border-b border-primary/[0.07] tabular-nums text-primary/75"
                                            >
                                                {value ? value : <span className="text-primary/15">·</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr className="bg-primary/[0.05]">
                                <th className="sticky left-0 z-10 bg-[#F4EEDF] text-left font-manrope font-bold text-primary px-4 py-3">
                                    Загалом
                                </th>
                                <td className="text-center font-manrope font-bold text-primary px-3 py-3 tabular-nums">
                                    {total}
                                </td>
                                <td className="px-3 py-3" />
                                {table.years.map((year) => {
                                    const value = yearTotal(table.rows, year);

                                    return (
                                        <td
                                            key={year}
                                            className="text-center font-manrope font-semibold text-primary/70 px-2.5 py-3 tabular-nums"
                                        >
                                            {value ? value : <span className="text-primary/20">0</span>}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
                <p className="px-5 md:px-6 py-10 text-center text-sm text-primary/40">
                    Дані ще не внесені.
                </p>
            )}

            {table.note && (
                <p className="px-5 md:px-6 py-4 border-t border-primary/10 text-xs text-primary/45 leading-relaxed">
                    {table.note}
                </p>
            )}
        </div>
    );
}
