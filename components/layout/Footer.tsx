import { ArrowUpRight } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full max-w-7xl mx-auto border-t border-primary/10 px-5 md:px-6">
            <div className="flex flex-col gap-6 py-7 md:flex-row md:items-end md:justify-between md:py-10">
                <div>
                    <p className="font-manrope text-sm font-bold text-primary">
                        Природничо-науковий ліцей №145
                    </p>

                    <p className="mt-1 font-inter text-xs text-primary/40">
                        © {new Date().getFullYear()} · Всі права захищені
                    </p>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end md:gap-1">
                    <span className="font-inter text-[10px] uppercase tracking-[0.14em] text-primary/35">
                        Сайт розроблено
                    </span>

                    <a
                        href="https://ghoststudio.online"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 font-manrope text-sm font-semibold text-primary/60 transition-colors hover:text-primary"
                    >
                        GhostStudio

                        <ArrowUpRight
                            size={14}
                            strokeWidth={2}
                            className="text-primary/35 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                        />
                    </a>
                </div>
            </div>
        </footer>
    );
}