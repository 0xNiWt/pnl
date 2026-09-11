import { POLOZHENNIA_NODES, POLOZHENNIA_SECTIONS, type PolozhenniaNode } from "./polozhenniaData";

// Документ великий і незмінний, тому це серверний компонент: у браузер не їде
// жодного рядка JS, увесь текст одразу є в HTML — його бачить і пошук Google,
// і звичайний Ctrl+F.
export default function PolozhenniaText() {
    return (
        <article className="w-full max-w-3xl mx-auto px-5 md:px-6 pb-14 md:pb-20">
            <nav
                aria-label="Зміст документа"
                className="rounded-none border border-primary/10 bg-primary/[0.03] p-5 md:p-6 mb-10"
            >
                <h2 className="font-plex font-bold text-primary text-sm uppercase tracking-[0.14em] mb-4">
                    Зміст
                </h2>
                <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {POLOZHENNIA_SECTIONS.map((section) => (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                className="text-sm text-primary/70 hover:text-primary transition-colors leading-snug"
                            >
                                {section.text}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>

            {POLOZHENNIA_NODES.map((node, i) => (
                <Node key={i} node={node} />
            ))}
        </article>
    );
}

function Node({ node }: { node: PolozhenniaNode }) {
    switch (node.kind) {
        case "h2":
            return (
                // scroll-mt — щоб під липкою шапкою заголовок не ховався,
                // коли на нього переходять зі змісту.
                <h2
                    id={node.id}
                    className="font-cormorant font-semibold text-primary text-[clamp(1.35rem,1.1rem+1.1vw,2rem)] leading-[1.1] tracking-[-0.01em] mt-12 first:mt-0 scroll-mt-28"
                >
                    {node.text}
                </h2>
            );

        case "h3":
            return (
                <h3
                    id={node.id}
                    className="font-cormorant font-semibold text-primary text-lg md:text-xl leading-[1.2] mt-8 scroll-mt-28"
                >
                    {node.text}
                </h3>
            );

        case "li":
            return (
                <p className="relative mt-2.5 pl-5 text-base text-primary/70 leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[0.7em] before:w-1.5 before:h-1.5 before:rounded-none before:bg-accent">
                    {node.text}
                </p>
            );

        case "p":
            return (
                <p className="mt-4 text-base text-primary/70 leading-relaxed">
                    {node.text}
                </p>
            );
    }
}
