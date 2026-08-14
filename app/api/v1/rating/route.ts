import { NextRequest, NextResponse } from 'next/server';
import { getStudentRating, getClassRating } from '@/lib/points';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') === 'class' ? 'class' : 'student';
  const search = searchParams.get('search') ?? undefined;

  const data =
    type === 'class' ? await getClassRating(search) : await getStudentRating(search);

  return NextResponse.json({ type, data });
}
