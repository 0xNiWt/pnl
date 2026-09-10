import { cache } from 'react';
import { createClient } from './server';

// Загальні перемикачі сайту. Лежать у таблиці app_settings, пишуться лише
// через SQL-функцію set_app_setting, яка сама перевіряє ролі
// (міграція sql/0016_rating_consent.sql).

export const RATING_CONSENT_ENFORCED = 'rating_consent_enforced';

export const getAppSetting = cache(async function getAppSetting(
    key: string
): Promise<unknown> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

    // Міграція ще не запущена — вважаємо, що налаштування немає.
    if (error || !data) return null;
    return data.value;
});

/**
 * Чи виключати з рейтингів тих, хто не дав згоди за п. 10.1.2 Положення.
 * Поки вимкнено, наявні акаунти лишаються в рейтингах — щоб таблиці не
 * спорожніли того ж дня, коли з'явилася вимога згоди.
 */
export async function isRatingConsentEnforced(): Promise<boolean> {
    return (await getAppSetting(RATING_CONSENT_ENFORCED)) === true;
}
