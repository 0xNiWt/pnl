import { createClient } from '@/lib/server';
import Contact from './Contact';

// Обгортка навколо Contact, яка сама підвантажує актуальні вакансії
// з бази даних. Використовується на всіх сторінках замість прямого
// імпорту Contact, щоб не дублювати запит до бази в кожному файлі.
export default async function ContactWithData() {
    const supabase = await createClient();
    const { data: vacancies } = await supabase
        .from('vacancies')
        .select('id, title, url')
        .order('sort_order', { ascending: true });

    return <Contact vacancies={vacancies ?? []} />;
}
