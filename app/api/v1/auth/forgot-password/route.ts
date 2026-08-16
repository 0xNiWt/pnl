import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { normalizeLyceumEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Дописуємо домен ліцею, якщо ввели лише ім'я акаунта.
    const email = normalizeLyceumEmail(String(body.email ?? ''));

    if (!email) {
      return NextResponse.json({ error: "Введіть email" }, { status: 400 });
    }

    const supabase = await createClient();

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { error: 'Сталася помилка. Спробуйте пізніше' },
      { status: 500 }
    );
  }
}
