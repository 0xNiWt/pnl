// Ліцейська пошта (п. 1.3 Статуту: «Ліцейська пошта — корпоративний
// електронний акаунт учня, закріплений за ліцеєм»).
//
// Домен один на всіх, тому користувачу достатньо ввести саме ім'я акаунта —
// решту дописуємо самі. Файл чистий: без бази й без браузера, тож ним
// користуються і форми, і серверні маршрути.

export const LYCEUM_EMAIL_DOMAIN = 'kpnl145.kyiv.ua';
export const LYCEUM_EMAIL_SUFFIX = `@${LYCEUM_EMAIL_DOMAIN}`;

/**
 * Дописує домен ліцею до того, що ввів користувач.
 *
 *   petrenko                → petrenko@kpnl145.kyiv.ua
 *   petrenko@               → petrenko@kpnl145.kyiv.ua
 *   petrenko@kpnl           → petrenko@kpnl145.kyiv.ua   (незакінчений домен)
 *   petrenko@gmail.com      → без змін, це чужий домен
 */
export function normalizeLyceumEmail(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (!value) return '';

  const at = value.indexOf('@');
  if (at === -1) return `${value}${LYCEUM_EMAIL_SUFFIX}`;

  const local = value.slice(0, at);
  const domain = value.slice(at + 1);

  // Без імені акаунта дописувати нічого — лишаємо як є, хай спрацює валідація.
  if (!local) return value;

  // Порожній або незакінчений домен ліцею дописуємо до повного.
  if (!domain || LYCEUM_EMAIL_DOMAIN.startsWith(domain)) {
    return `${local}${LYCEUM_EMAIL_SUFFIX}`;
  }

  return value;
}

export function isLyceumEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(LYCEUM_EMAIL_SUFFIX);
}
