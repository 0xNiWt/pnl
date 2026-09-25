'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';

/**
 * Кнопка «Завантажити файл»: відкриває вибір файлу на компʼютері,
 * кладе його у сховище сайту й повертає готове посилання — шлях
 * вписувати вручну не треба.
 */
export default function UploadButton({
    folder,
    kind = 'image',
    label = 'Завантажити з компʼютера',
    onUploaded,
    onError,
}: {
    folder: 'man' | 'staff' | 'memory' | 'news' | 'shop';
    kind?: 'image' | 'any';
    label?: string;
    onUploaded: (url: string) => void;
    onError?: (message: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);

    const accept = kind === 'image'
        ? 'image/jpeg,image/png,image/webp,image/avif'
        : 'image/jpeg,image/png,image/webp,application/pdf,.pptx,.ppt,.docx,.doc';

    async function upload(file: File) {
        setBusy(true);
        try {
            const body = new FormData();
            body.append('file', file);
            body.append('folder', folder);
            body.append('kind', kind);

            const res = await fetch('/api/v1/uploads', { method: 'POST', body });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                onError?.(data.error ?? 'Не вдалося завантажити файл');
                return;
            }
            onUploaded(data.url as string);
        } catch {
            onError?.('Немає зʼєднання — спробуйте ще раз');
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="inline-flex items-center gap-2 self-start border border-primary/25 px-4 py-2 font-manrope text-sm font-semibold text-primary hover:bg-primary hover:text-background transition-colors disabled:opacity-60"
            >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {busy ? 'Завантаження…' : label}
            </button>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(file);
                }}
            />
        </>
    );
}
