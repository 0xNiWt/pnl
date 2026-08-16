import { createClient } from '@/lib/server';
import Contact from './Contact';

export default async function ContactWithData() {
    const supabase = await createClient();
    const { data: vacancies } = await supabase
        .from('vacancies')
        .select('id, title, url')
        .order('sort_order', { ascending: true });

    return <Contact vacancies={vacancies ?? []} />;
}
