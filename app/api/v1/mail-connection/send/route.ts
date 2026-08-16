import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Заповніть усі обов'язкові поля" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Некоректний email" },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: "Сайт <noreply@thedragons.site>",
      to: process.env.CONTACT_EMAIL!,
      replyTo: email,
      subject: `Нове повідомлення від ${name}`,
      text: `
Ім'я: ${name}
Email: ${email}

Повідомлення:
${message}
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return NextResponse.json(
        { error: "Не вдалося відправити повідомлення" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}