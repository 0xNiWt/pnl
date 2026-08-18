'use client';

import { motion } from "motion/react";
import {
    Download,
    ExternalLink,
    FileImage,
    FileSpreadsheet,
    FileText,
    Music,
} from "lucide-react";
import { DOC_GROUPS, type DocItem, type DocKind } from "./documentsData";

const smoothOut = [0.16, 1, 0.3, 1] as const;

const KIND_META: Record<DocKind, { icon: typeof FileText; label: string }> = {
    pdf: { icon: FileText, label: "PDF" },
    doc: { icon: FileText, label: "DOCX" },
    xls: { icon: FileSpreadsheet, label: "XLS" },
    image: { icon: FileImage, label: "Скан" },
    audio: { icon: Music, label: "Аудіо" },
};

export default function DocumentsList() {
    return (
        <>
            {DOC_GROUPS.map((group) => (
                <motion.section
                    key={group.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.85, ease: smoothOut }}
                    className="w-full max-w-7xl mx-auto border-b border-gray-800/20 px-5 md:px-6 py-10 md:py-16"
                    id={group.id}
                >
                    <h2 className="font-manrope font-bold text-primary text-2xl md:text-3xl tracking-tight">
                        {group.title}
                    </h2>
                    <p className="mt-2 mb-8 text-base text-primary/60 max-w-2xl leading-relaxed">
                        {group.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.items.map((item) => (
                            <DocumentCard key={item.id} item={item} />
                        ))}
                    </div>
                </motion.section>
            ))}
        </>
    );
}

function DocumentCard({ item }: { item: DocItem }) {
    const { icon: Icon, label } = KIND_META[item.kind];
    const multiple = item.files.length > 1;

    return (
        <article className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-5 flex flex-col">
            <div className="flex items-start gap-3.5">
                <span className="w-11 h-11 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center">
                    <Icon size={19} className="text-primary" />
                </span>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-manrope text-[10px] font-bold uppercase tracking-[0.14em] text-primary/40">
                            {label}
                        </span>
                        {item.year && (
                            <span className="font-manrope text-[10px] font-bold uppercase tracking-[0.14em] text-secondary bg-secondary/10 rounded-full px-2 py-0.5">
                                {item.year}
                            </span>
                        )}
                    </div>

                    <h3 className="font-manrope font-bold text-primary text-base leading-snug">
                        {item.title}
                    </h3>

                    {item.note && (
                        <p className="mt-1.5 text-xs text-primary/50 leading-relaxed">{item.note}</p>
                    )}
                </div>
            </div>

            {/* mt-auto притискає блок кнопок до низу — у сусідніх картках рядка
                вони опиняються на одному рівні, хоч би якою довгою була назва. */}
            <div className="mt-auto pt-5 border-t border-primary/10 flex flex-col gap-2.5">
                {item.files.map((file) => {
                    // Word браузер не покаже: «Відкрити» веде на сторінку сайту
                    // з текстом документа, якщо вона є. Немає — лишається лише
                    // завантаження.
                    const viewHref = file.preview ?? (item.kind === "doc" ? null : file.href);

                    return (
                        <div key={file.href} className="flex flex-wrap items-center gap-2">
                            {multiple && (
                                <span className="text-xs text-primary/45 mr-auto">{file.label}</span>
                            )}

                            {viewHref && (
                                <a
                                    href={viewHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1.5 rounded-full border border-primary/15 px-3.5 py-1.5 font-manrope text-xs font-semibold text-primary/75 hover:bg-primary hover:text-background hover:border-primary transition-colors ${multiple ? "" : "flex-1 justify-center"
                                        }`}
                                >
                                    <ExternalLink size={13} />
                                    Відкрити
                                </a>
                            )}

                            <a
                                href={file.href}
                                download
                                className={`inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 font-manrope text-xs font-semibold text-background hover:bg-primary/90 transition-colors ${multiple ? "" : "flex-1 justify-center"
                                    }`}
                            >
                                <Download size={13} />
                                Завантажити
                            </a>
                        </div>
                    );
                })}
            </div>
        </article>
    );
}
