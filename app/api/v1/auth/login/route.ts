import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/server'
import { translateAuthError } from '@/lib/authErrors'
import { normalizeLyceumEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email та пароль обов'язкові" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      // Дописуємо домен ліцею, якщо ввели лише ім'я акаунта.
      email: normalizeLyceumEmail(email),
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: translateAuthError(error.message) },
        { status: error.status ?? 400 }
      )
    }

    return NextResponse.json(
      { user: data.user, session: data.session },
      { status: 200 }
    )
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
}
