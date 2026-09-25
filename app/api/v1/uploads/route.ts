import { NextRequest, NextResponse } from 'next/server';
import {
  canManageManWorks,
  canManageMemoryBook,
  canManageNews,
  canManageShop,
  canManageStaff,
  getCurrentUserWithRoles,
  type Role,
} from '@/lib/roles';

// Куди складаємо файли всередині бакета. Нові теки додавати сюди ж.
const FOLDERS = ['man', 'staff', 'memory', 'news', 'shop'] as const;
type Folder = (typeof FOLDERS)[number];

// Хто має право класти файли в кожну теку — ті самі ролі, що ведуть
// відповідний розділ сайту.
const MAY_UPLOAD: Record<Folder, (roles: Role[]) => boolean> = {
  man: canManageManWorks,
  staff: canManageStaff,
  memory: canManageMemoryBook,
  news: canManageNews,
  shop: canManageShop,
};

const MAX_BYTES = 15 * 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/msword',
];

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf',

  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/msword': 'doc',
};

/**
 * POST — завантажити файл із компʼютера в сховище сайту.
 * Приймає форму з полями `file`, `folder` («man» або «staff») і
 * необовʼязковим `kind` («image» — тоді документи не приймаємо).
 * Повертає { url } — посилання, яке можна одразу вписати в запис.
 */
export async function POST(request: NextRequest) {
  const { supabase, user, roles } = await getCurrentUserWithRoles();

  if (!user) {
    return NextResponse.json({ error: 'Потрібно увійти в акаунт' }, { status: 401 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!form || !(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не надіслано' }, { status: 400 });
  }

  const folderValue = String(form.get('folder') ?? 'man');
  const folder: Folder = (FOLDERS as readonly string[]).includes(folderValue)
    ? (folderValue as Folder)
    : 'man';
  const onlyImages = String(form.get('kind') ?? '') === 'image';

  if (!MAY_UPLOAD[folder](roles)) {
    return NextResponse.json({ error: 'Недостатньо прав' }, { status: 403 });
  }

  const allowed = onlyImages ? IMAGE_TYPES : [...IMAGE_TYPES, ...DOC_TYPES];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: onlyImages ? 'Оберіть зображення (JPG, PNG або WEBP)' : 'Такий тип файлу не підтримується' },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Файл завеликий — максимум 15 МБ' }, { status: 400 });
  }

  // Імʼя файлу власне не використовуємо: кирилиця й пробіли в посиланнях
  // ламаються, тож даємо своє коротке й унікальне.
  const ext = EXT[file.type] ?? 'bin';
  const path = `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('uploads')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    const missingBucket = /bucket/i.test(error.message);
    return NextResponse.json(
      {
        error: missingBucket
          ? 'Сховище не налаштоване: застосуйте міграцію sql/0026_uploads_bucket.sql'
          : `Не вдалося завантажити: ${error.message}`,
      },
      { status: 400 }
    );
  }

  const { data } = supabase.storage.from('uploads').getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
