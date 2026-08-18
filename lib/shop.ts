// Магазин мерчу ліцею.
//
// Товар продається за бали, за гроші або двома способами одразу — вирішує
// сам товар тим, які ціни в нього заповнені:
//   price_points — ціна в балах, списуються з балансу кабінету;
//   price_uah + form_url — ціна в гривнях; оплату сайт не проводить,
//                          кнопка відкриває Google-форму.
//
// Файл чистий: без бази й без браузера, тож годиться і сторінці, і API.

export type ShopProduct = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price_points: number | null;
  price_uah: number | null;
  form_url: string | null;
  stock: number | null;
  active: boolean;
  sort_order: number;
};

export type OrderStatus = 'new' | 'issued' | 'cancelled';

export type ShopOrder = {
  id: string;
  product_id: string | null;
  student_id: string;
  product_title: string;
  points_spent: number;
  status: OrderStatus;
  created_at: string;
  handled_at: string | null;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Чекає видачі',
  issued: 'Видано',
  cancelled: 'Скасовано',
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return value === 'new' || value === 'issued' || value === 'cancelled';
}

/** Товар закінчився? null у складі означає, що облік не ведеться. */
export function isSoldOut(product: Pick<ShopProduct, 'stock'>): boolean {
  return product.stock !== null && product.stock <= 0;
}

/** Чи можна купити за бали просто зараз. */
export function canBuyForPoints(product: ShopProduct): boolean {
  return product.active && product.price_points !== null && !isSoldOut(product);
}

/**
 * Чи можна купити за гроші. Без посилання на форму кнопка нікуди б не вела,
 * тому одна ціна без форми покупку не відкриває.
 */
export function canBuyForMoney(product: ShopProduct): boolean {
  return (
    product.active &&
    product.price_uah !== null &&
    Boolean(product.form_url) &&
    !isSoldOut(product)
  );
}

/** «350 ₴», «349,50 ₴» — копійки показуємо лише коли вони є. */
export function formatUah(value: number): string {
  const hasKopiyky = Math.round(value * 100) % 100 !== 0;
  return `${value.toLocaleString('uk-UA', {
    minimumFractionDigits: hasKopiyky ? 2 : 0,
    maximumFractionDigits: 2,
  })} ₴`;
}

/** «1 бал», «2 бали», «5 балів» — українська множина. */
export function pointsWord(count: number): string {
  const n = Math.abs(count) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return 'балів';
  if (last === 1) return 'бал';
  if (last >= 2 && last <= 4) return 'бали';
  return 'балів';
}

export function formatPoints(value: number): string {
  return `${value} ${pointsWord(value)}`;
}

/**
 * Посилання на форму приймаємо лише http(s): інакше в картку товару можна
 * було б підсунути javascript: і перетворити кнопку покупки на пастку.
 */
export function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------
// Перевірка картки товару
// ---------------------------------------------------------------------
// Живе тут, а не в роуті: у route.ts можна експортувати лише обробники
// методів, та й обидва роути (створення й редагування) перевіряють однаково.

export type ProductBody = {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  pricePoints?: number | string | null;
  priceUah?: number | string | null;
  formUrl?: string | null;
  stock?: number | string | null;
  active?: boolean;
};

export type ProductRow = {
  title: string;
  description: string | null;
  image_url: string | null;
  price_points: number | null;
  price_uah: number | null;
  form_url: string | null;
  stock: number | null;
  active: boolean;
};

// Порожнє поле — це «не вказано» (null), а не нуль. NaN означає «написали
// не число» і перетворюється на зрозумілу помилку нижче.
function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Чистка й перевірка полів картки товару: або готовий рядок для бази,
 * або текст помилки для людини.
 */
export function cleanProduct(body: ProductBody): { error: string } | { row: ProductRow } {
  const title = (body.title ?? '').trim();
  if (!title) return { error: 'Вкажіть назву товару' };

  const pricePoints = optionalNumber(body.pricePoints);
  const priceUah = optionalNumber(body.priceUah);
  const stock = optionalNumber(body.stock);

  if (Number.isNaN(pricePoints) || (pricePoints !== null && pricePoints <= 0)) {
    return { error: 'Ціна в балах має бути числом більшим за нуль' };
  }
  if (Number.isNaN(priceUah) || (priceUah !== null && priceUah <= 0)) {
    return { error: 'Ціна в гривнях має бути числом більшим за нуль' };
  }
  if (Number.isNaN(stock) || (stock !== null && stock < 0)) {
    return { error: 'Залишок не може бути відʼємним' };
  }

  const formUrl = String(body.formUrl ?? '').trim() || null;
  if (formUrl && !isSafeUrl(formUrl)) {
    return { error: 'Посилання на форму має починатися з http:// або https://' };
  }

  const imageUrl = String(body.imageUrl ?? '').trim() || null;
  if (imageUrl && !isSafeUrl(imageUrl)) {
    return { error: 'Посилання на фото має починатися з http:// або https://' };
  }

  // Ціна в гривнях без форми нікуди не веде: кнопку не буде на що повісити.
  if (priceUah !== null && !formUrl) {
    return { error: 'Для продажу за гроші потрібне посилання на Google-форму' };
  }

  return {
    row: {
      title,
      description: String(body.description ?? '').trim() || null,
      image_url: imageUrl,
      price_points: pricePoints === null ? null : Math.round(pricePoints),
      price_uah: priceUah,
      form_url: formUrl,
      stock: stock === null ? null : Math.round(stock),
      active: body.active ?? true,
    },
  };
}

// Поля товару, які потрібні сторінкам. Один рядок замість повторення
// довгого select у кожному запиті.
export const PRODUCT_COLUMNS =
  'id, title, description, image_url, price_points, price_uah, form_url, stock, active, sort_order';
