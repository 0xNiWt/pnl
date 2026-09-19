'use client';

import { useEffect, useState } from "react";

/**
 * Перемикач мови UA / EN.
 * Англійську версію робить Google Translate: вибір запам'ятовується в cookie
 * `googtrans`, і скрипт перекладача підвантажується лише тоді, коли обрано EN —
 * українська версія сайту не вантажить нічого зайвого.
 */

type Lang = "uk" | "en";

const COOKIE = "googtrans";

function readLang(): Lang {
    if (typeof document === "undefined") return "uk";
    return /(?:^|;\s*)googtrans=\/uk\/en/.test(document.cookie) ? "en" : "uk";
}

function writeCookie(value: string | null) {
    const host = window.location.hostname;
    // Google ставить cookie і на хост, і на батьківський домен — чистимо обидва.
    const domains = ["", host, host.split(".").slice(-2).join(".")];
    for (const d of domains) {
        const domain = d && d !== "localhost" ? `; domain=.${d}` : "";
        document.cookie = value
            ? `${COOKIE}=${value}; path=/${domain}`
            : `${COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domain}`;
    }
}

declare global {
    interface Window {
        google?: { translate?: { TranslateElement: new (opts: object, id: string) => unknown } };
        googleTranslateElementInit?: () => void;
        __pnlTranslatePatched?: boolean;
    }
}

// Google Translate підміняє текстові вузли, а React потім намагається
// прибрати «свої» — і падає. Відомий обхід: не кидати помилку, якщо вузол
// уже має іншого батька.
function patchDomForTranslate() {
    if (window.__pnlTranslatePatched) return;
    window.__pnlTranslatePatched = true;

    const removeChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
        if (child.parentNode !== this) return child;
        return removeChild.call(this, child) as T;
    };

    const insertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
        if (ref && ref.parentNode !== this) return node;
        return insertBefore.call(this, node, ref) as T;
    };
}

function loadTranslator() {
    if (document.getElementById("google-translate-script")) return;
    patchDomForTranslate();

    let holder = document.getElementById("google_translate_element");
    if (!holder) {
        holder = document.createElement("div");
        holder.id = "google_translate_element";
        holder.style.display = "none";
        document.body.appendChild(holder);
    }

    window.googleTranslateElementInit = () => {
        const TE = window.google?.translate?.TranslateElement;
        if (TE) new TE({ pageLanguage: "uk", includedLanguages: "en", autoDisplay: false }, "google_translate_element");
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
}

export default function LanguageSwitch({ className = "" }: { className?: string }) {
    const [lang, setLang] = useState<Lang>("uk");

    useEffect(() => {
        const current = readLang();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- мова відома лише в браузері (cookie)
        setLang(current);
        if (current === "en") {
            document.documentElement.lang = "en";
            loadTranslator();
        }
    }, []);

    const choose = (next: Lang) => {
        if (next === lang) return;
        writeCookie(next === "en" ? "/uk/en" : null);
        window.location.reload();
    };

    const btn = (value: Lang, label: string, title: string) => (
        <button
            type="button"
            onClick={() => choose(value)}
            aria-pressed={lang === value}
            title={title}
            className={`px-2.5 py-1.5 font-plex text-[11px] font-bold tracking-[0.14em] transition-colors ${
                lang === value
                    ? "bg-primary text-background"
                    : "text-primary hover:bg-primary/10"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div
            role="group"
            aria-label="Мова сайту / Site language"
            className={`notranslate inline-flex items-center border border-primary bg-background ${className}`}
            translate="no"
        >
            {btn("uk", "UA", "Українською")}
            {btn("en", "EN", "English")}
        </div>
    );
}
