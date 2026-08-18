import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  // next приходить із листа, тому довіряти йому не можна: пускаємо лише
  // внутрішні шляхи, інакше посиланням можна було б відправити людину
  // на чужий сайт уже після входу.
  const requestedNext = searchParams.get('next');
  const next =
    requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/auth/login';

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_link`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=expired_link`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
