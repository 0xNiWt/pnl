import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/server'
import { translateAuthError } from '@/lib/authErrors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body as {
      email?: string
      password?: string
      fullName?: string
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email та пароль обов'язкові" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль має містити щонайменше 6 символів' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName ?? null,
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: translateAuthError(error.message) },
        { status: error.status ?? 400 }
      )
    }

    const needsEmailConfirmation = !data.session

    return NextResponse.json(
      {
        user: data.user,
        session: data.session,
        needsEmailConfirmation,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json(
        { error: 'Внутрішня помилка сервера' },
        { status: 500 }
    )
  }
}
