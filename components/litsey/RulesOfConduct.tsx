import { RULES_BLOCKS, type RulesBlock } from "./rulesData";

// Сторінка суто текстова й не змінюється, тому це серверний компонент:
// жодного JS у браузер, текст одразу є в HTML і доступний пошуку.
export default function RulesOfConduct() {
    return (
        <article className="w-full max-w-3xl mx-auto px-5 md:px-6 pb-14 md:pb-20">
            {RULES_BLOCKS.map((block, i) => (
                <Block key={i} block={block} />
            ))}
        </article>
    );
}

function Block({ block }: { block: RulesBlock }) {
    switch (block.kind) {
        case "lead":
            return (
                <p className="font-manrope font-bold text-primary text-sm md:text-base leading-relaxed tracking-wide mt-5 first:mt-0">
                    {block.text}
                </p>
            );

        case "heading":
            return (
                <h2 className="font-manrope font-bold text-primary text-xl md:text-2xl tracking-tight mt-10 first:mt-0">
                    {block.text}
                </h2>
            );

        case "paragraph":
            return (
                <p className="text-base text-primary/70 leading-relaxed mt-5 first:mt-0">
                    {block.text}
                </p>
            );

        case "list":
            return (
                <ul className="mt-4 space-y-2.5">
                    {block.items.map((item, i) => (
                        <li key={i} className={BULLET}>
                            {item.text}
                            {item.items && (
                                <ul className="mt-2.5 space-y-2">
                                    {item.items.map((sub, j) => (
                                        <li key={j} className={`${BULLET} text-primary/60`}>
                                            {sub}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            );
    }
}

// Маркер малюємо псевдоелементом: так довгий пункт переноситься рівно під
// текстом, а не під крапкою, як це робить звичайний list-style.
const BULLET =
    "relative pl-5 text-base text-primary/70 leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-secondary";
