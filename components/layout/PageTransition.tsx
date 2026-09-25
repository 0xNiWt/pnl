'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gerb from "@/public/gerb.png";

// Скільки заставка тримається щонайменше — щоб не блимала, але й не
// затримувала того, хто просто перейшов на сусідню сторінку.
const MIN_MS = 300;
// Страховка: якщо сторінка чомусь не відповідає, заставка все одно зникне.
const MAX_MS = 5000;

/**
 * Коротка заставка з гербом під час переходу між сторінками.
 * Зʼявляється на клік по внутрішньому посиланню й ховається, коли нова
 * сторінка готова (але не раніше, ніж за MIN_MS).
 */
export default function PageTransition() {
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const shownAt = useRef(0);
    const timers = useRef<number[]>([]);

    const clearTimers = () => {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
    };

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

            const url = new URL(link.href, window.location.href);
            // Заставка лише для переходів між сторінками сайту: якоря й
            // зовнішні посилання її не викликають.
            if (url.origin !== window.location.origin) return;
            if (url.pathname === window.location.pathname) return;

            clearTimers();
            shownAt.current = Date.now();
            setVisible(true);
            timers.current.push(window.setTimeout(() => setVisible(false), MAX_MS));
        };

        document.addEventListener("click", onClick, true);
        return () => {
            document.removeEventListener("click", onClick, true);
            clearTimers();
        };
    }, []);

    // Нова сторінка вже намальована — ховаємо заставку, витримавши мінімум.
    useEffect(() => {
        if (!visible) return;
        const left = Math.max(0, MIN_MS - (Date.now() - shownAt.current));
        const timer = window.setTimeout(() => setVisible(false), left);
        timers.current.push(timer);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- реагуємо саме на зміну адреси
    }, [pathname]);

    return (
        <div
            aria-hidden={!visible}
            className={`fixed inset-0 z-[60] flex items-center justify-center bg-background transition-opacity duration-200 ${visible ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
        >
            <Image
                src={gerb}
                alt=""
                priority
                sizes="96px"
                className="h-20 w-auto md:h-24 animate-pulse"
            />
        </div>
    );
}
