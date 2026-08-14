import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/server'
import { translateAuthError } from '@/lib/authErrors'

const ALLOWED_CLASSES = [
  '7-А', '7-Б', '7-В',
  '8-А', '8-Б', '8-В',
  '9-А', '9-Б', '9-В',
  '10-А', '10-Б', '10-В',
  '11-А', '11-Б', '11-В',
  '12-А', '12-Б', '12-В',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, studentClass } = body as {
      email?: string
      password?: string
      fullName?: string
      studentClass?: string
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

    if (!studentClass || !ALLOWED_CLASSES.includes(studentClass)) {
      return NextResponse.json(
        { error: 'Оберіть клас зі списку' },
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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`
      },
    })

    if (error) {
      return NextResponse.json(
        { error: translateAuthError(error.message) },
        { status: error.status ?? 400 }
      )
    }

    // Профіль створюється автоматично тригером бази даних одразу після
    // реєстрації в auth.users, тож тут його вже можна оновити класом.
    if (data.user) {
      const { error: classError } = await supabase
        .from('profiles')
        .update({ class: studentClass })
        .eq('id', data.user.id)

      if (classError) {
        console.error('Failed to set class on profile:', classError)
      }
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
