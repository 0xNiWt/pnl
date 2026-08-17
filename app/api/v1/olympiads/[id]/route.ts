import { NextRequest, NextResponse } from 'next/server';
import { canManageOlympiadStats, getCurrentUserWithRoles } from '@/lib/roles';
import { isOlympiadTableId } from '@/lib/olympiads';

// PUT — переписати таблицю перемог цілком: роки + усі рядки.
// Права перевіряються двічі: тут і всередині SQL-функції save_olympiad_table.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  if (!canManageOlympiadStats(roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }
  if (!isOlympiadTableId(id)) {
    return NextResponse.json({ error: 'Невідома таблиця' }, { status: 400 });
  }

  const body = await request.json();
  const { years, rows } = body as {
    years?: unknown;
    rows?: unknown;
  };

  if (!Array.isArray(years) || years.some((y) => typeof y !== 'string')) {
    return NextResponse.json({ error: 'Роки треба передати списком' }, { status: 400 });
  }
  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: 'Рядки треба передати списком' }, { status: 400 });
  }

  const cleanYears = (years as string[]).map((y) => y.trim()).filter(Boolean);
  if (new Set(cleanYears).size !== cleanYears.length) {
    return NextResponse.json({ error: 'Роки повторюються' }, { status: 400 });
  }

  // Лишаємо тільки клітинки наявних років і тільки додатні числа: так у базу
  // не потрапить сміття від видалених колонок.
  const cleanRows = (rows as Array<Record<string, unknown>>)
    .map((row) => {
      const subject = String(row.subject ?? '').trim();
      const rawCounts = (row.counts ?? {}) as Record<string, unknown>;
      const counts: Record<string, number> = {};

      for (const year of cleanYears) {
        const value = Number(rawCounts[year]);
        if (Number.isFinite(value) && value > 0) {
          counts[year] = Math.round(value);
        }
      }

      const rawTotal = Number(row.total);
      const total = Number.isFinite(rawTotal) && rawTotal >= 0 ? Math.round(rawTotal) : null;

      return { subject, total, counts };
    })
    .filter((row) => row.subject !== '');

  const { error } = await supabase.rpc('save_olympiad_table', {
    p_table_id: id,
    p_years: cleanYears,
    p_rows: cleanRows,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
