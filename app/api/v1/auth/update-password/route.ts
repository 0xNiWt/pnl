import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { translateAuthError } from '@/lib/authErrors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = String(body.password ?? '');

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль має містити щонайменше 6 символів' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Посилання застаріло. Запросіть нове відновлення пароля' },
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json(
        { error: translateAuthError(error.message) },
        { status: error.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update password error:', err);
    return NextResponse.json(
      { error: 'Сталася помилка. Спробуйте пізніше' },
      { status: 500 }
    );
  }
}
