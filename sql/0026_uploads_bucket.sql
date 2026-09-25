-- 0026_uploads_bucket.sql
--
-- Сховище для файлів, які адміністрація завантажує прямо з кабінету:
-- фото педагогів, фото й тексти робіт МАН тощо. Бакет публічний на
-- читання (файли показуються на сайті), а завантажувати, замінювати
-- й видаляти можуть лише адміністрація та модератори.
--
-- Міграція безпечна для повторного запуску.

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

-- Читати може будь-хто: посилання на файли стоять на публічних сторінках.
drop policy if exists uploads_read on storage.objects;
create policy uploads_read
  on storage.objects for select
  using (bucket_id = 'uploads');

-- Завантажувати, замінювати й видаляти — лише адміністрація та модератори.
drop policy if exists uploads_insert on storage.objects;
create policy uploads_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'uploads'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['owner', 'moderator']
    )
  );

drop policy if exists uploads_update on storage.objects;
create policy uploads_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'uploads'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['owner', 'moderator']
    )
  );

drop policy if exists uploads_delete on storage.objects;
create policy uploads_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'uploads'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.roles::text[] && array['owner', 'moderator']
    )
  );
