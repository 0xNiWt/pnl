import { NextRequest, NextResponse } from 'next/server';
import { POLOZHENNIA_VERSION } from '@/lib/consent';
import { RATING_CONSENT_ENFORCED } from '@/lib/appSettings';
import { canManageRatingVisibility, getCurrentUserWithRoles } from '@/lib/roles';

// POST — учень дає згоду на участь у рейтингах (п. 10.1.2 Положення).
// Потрібно тим, хто зареєструвався до появи галочки у формі реєстрації.
//
// Відкликання згоди тут немає навмисно: за п. 10.1.4 воно можливе виключно
// письмовою заявою на ім'я директора.
export async function POST() {
  const { supabase, user } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('give_rating_consent', {
    p_version: POLOZHENNIA_VERSION,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, consentedAt: data });
}

// PATCH — строгий режим: чи виключати з рейтингів тих, хто згоди не дав.
// Вмикає адміністрація або модератор, коли більшість учнів уже погодилася.
export async function PATCH(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageRatingVisibility(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const body = await request.json();
  const { enforced } = body as { enforced?: boolean };

  if (typeof enforced !== 'boolean') {
    return NextResponse.json({ error: 'Не вказано, вмикати чи вимикати' }, { status: 400 });
  }

  const { error } = await supabase.rpc('set_app_setting', {
    p_key: RATING_CONSENT_ENFORCED,
    p_value: enforced,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, enforced });
}
