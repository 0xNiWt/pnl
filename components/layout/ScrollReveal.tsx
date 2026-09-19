'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Що саме «випливає» під час прокрутки. Правило одне на весь сайт, тож
// окремі сторінки нічого не мусять підключати: картки в сітках, фото,
// заголовки розділів і все, що позначено data-reveal.
const TARGETS = [
    'main .grid > *',
    'main article',
    'main figure',
    'main section h1',
    'main section h2',
    'main [data-reveal]',
].join(',');

// Скільки блоків з однієї порції отримують затримку — далі всі разом,
// щоб довгий список не «вливався» по одному кілька секунд.
const MAX_STAGGER = 5;
const STAGGER_MS = 80;
// Лінія, яку блок має перетнути, щоб випливти (частка висоти екрана).
const TRIGGER_LINE = 0.92;

// Блоки, що підвантажились окремо (Suspense), якийсь час лежать у DOM ще не
// «оживленими» React. Якщо позначити їх раніше, React побачить чужі класи й
// атрибути та поскаржиться на невідповідність — тож чекаємо на гідратацію.
const isHydrated = (el: HTMLElement) =>
    Object.keys(el).some((key) => key.startsWith('__reactFiber$'));

export default function ScrollReveal() {
    const pathname = usePathname();

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const pending = new Set<HTMLElement>();
        const timers = new Set<number>();

        const finish = (el: HTMLElement) => {
            el.classList.remove('reveal', 'reveal-in');
            el.style.removeProperty('--reveal-delay');
        };

        const reveal = (el: HTMLElement, order: number) => {
            if (!pending.delete(el)) return;
            observer?.unobserve(el);

            const delay = Math.min(order, MAX_STAGGER) * STAGGER_MS;
            el.style.setProperty('--reveal-delay', `${delay}ms`);
            el.classList.add('reveal-in');

            // Після анімації прибираємо класи, щоб не заважати власним
            // transform і transition блоку (hover, sticky тощо).
            const onEnd = (event: TransitionEvent) => {
                if (event.target !== el || event.propertyName !== 'transform') return;
                el.removeEventListener('transitionend', onEnd);
                finish(el);
            };
            el.addEventListener('transitionend', onEnd);

            // Страховка: навіть якщо transitionend не прийде, блок не лишиться
            // з класами назавжди.
            const timer = window.setTimeout(() => {
                timers.delete(timer);
                finish(el);
            }, 900 + delay + 300);
            timers.add(timer);
        };

        const revealBatch = (els: HTMLElement[]) => {
            // Блоки, що з'явились одночасно (рядок карток), виходять драбинкою.
            els
                .sort((a, b) => {
                    const ra = a.getBoundingClientRect();
                    const rb = b.getBoundingClientRect();
                    return ra.top - rb.top || ra.left - rb.left;
                })
                .forEach((el, i) => reveal(el, i));
        };

        const observer = 'IntersectionObserver' in window
            ? new IntersectionObserver(
                (entries) => {
                    revealBatch(
                        entries
                            .filter((entry) => entry.isIntersecting)
                            .map((entry) => entry.target as HTMLElement)
                    );
                },
                { rootMargin: `0px 0px -${Math.round((1 - TRIGGER_LINE) * 100)}% 0px`, threshold: 0.08 }
            )
            : null;

        // Запасна перевірка, яка не залежить від IntersectionObserver: якщо
        // браузер не надіслав подію, блок однаково випливе, а те, що вже
        // прокрутили повз, просто стане видимим. Схованим не лишається нічого.
        const sweep = () => {
            if (pending.size === 0) return;
            const line = window.innerHeight * TRIGGER_LINE;
            const due: HTMLElement[] = [];

            pending.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.bottom < 0) {
                    pending.delete(el);
                    observer?.unobserve(el);
                    finish(el);
                } else if (rect.top < line) {
                    due.push(el);
                }
            });

            if (due.length) revealBatch(due);
        };

        const prepare = () => {
            const line = window.innerHeight * TRIGGER_LINE;

            document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
                if (el.dataset.revealSeen) return;
                if (!isHydrated(el)) return;
                el.dataset.revealSeen = '1';

                if (el.closest('[data-no-reveal]')) return;
                // Вкладені блоки не анімуємо двічі: хай пливе зовнішній.
                if (el.parentElement?.closest('.reveal')) return;
                // Те, що вже на екрані або вище, не ховаємо — інакше вміст
                // блимне одразу після завантаження сторінки.
                if (el.getBoundingClientRect().top < line) return;

                el.classList.add('reveal');
                pending.add(el);
                observer?.observe(el);
            });
        };

        prepare();

        let lastScrollSweep = 0;
        const onScroll = () => {
            const now = Date.now();
            if (now - lastScrollSweep < 120) return;
            lastScrollSweep = now;
            sweep();
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        const interval = window.setInterval(() => {
            prepare();
            sweep();
        }, 600);

        // Нові блоки («Показати ще», перемикання вкладок, перехід між сторінками).
        let mutationTimer = 0;
        const mutations = new MutationObserver(() => {
            window.clearTimeout(mutationTimer);
            mutationTimer = window.setTimeout(prepare, 60);
        });
        mutations.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.clearTimeout(mutationTimer);
            window.clearInterval(interval);
            timers.forEach((t) => window.clearTimeout(t));
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            mutations.disconnect();
            observer?.disconnect();
            // Нічого не лишаємо схованим, якщо компонент зникає посеред анімації.
            document.querySelectorAll<HTMLElement>('.reveal').forEach(finish);
            document.querySelectorAll<HTMLElement>('[data-reveal-seen]').forEach((el) => {
                delete el.dataset.revealSeen;
            });
        };
    }, [pathname]);

    return null;
}
