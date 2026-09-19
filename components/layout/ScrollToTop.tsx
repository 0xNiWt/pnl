'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Натискання на пункт меню завжди веде на самий верх сторінки:
 * - якщо це та сама сторінка (наприклад, «Ліцей», коли ви вже на головній
 *   і прогорнули донизу або перейшли до #якоря) — плавно прокручуємо вгору;
 * - якщо інша сторінка — після переходу стаємо на самий верх, а не під шапку.
 * Кнопки «Назад/Вперед» браузера не чіпаємо: там доречно повернути позицію.
 */
export default function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!link || link.target === "_blank") return;

            const url = new URL(link.href, window.location.href);
            if (url.origin !== window.location.origin || url.hash) return;

            if (url.pathname === window.location.pathname) {
                if (window.location.hash) {
                    history.replaceState(history.state, "", url.pathname + url.search);
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                try { sessionStorage.setItem("pnl:scroll-top", url.pathname); } catch { /* ignore */ }
            }
        };

        // Фаза перехоплення: Link із Next.js сам викликає preventDefault,
        // тож слухаємо клік раніше за нього.
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, []);

    useEffect(() => {
        try {
            if (sessionStorage.getItem("pnl:scroll-top") === pathname) {
                sessionStorage.removeItem("pnl:scroll-top");
                window.scrollTo({ top: 0 });
            }
        } catch {
            // sessionStorage може бути недоступним — тоді покладаємось на Next.js.
        }
    }, [pathname]);

    return null;
}
