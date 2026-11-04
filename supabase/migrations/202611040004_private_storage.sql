-- DataJuris private Storage bucket and owner-scoped access policies.
-- The bucket is private. Client roles cannot read files belonging to other users.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'legal-documents',
  'legal-documents',
  false,
  20971520,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'text/plain',
    'application/rtf'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'DataJuris users upload own legal files'
  ) then
    create policy "DataJuris users upload own legal files"
    on storage.objects for insert to authenticated
    with check (
      bucket_id = 'legal-documents'
      and (storage.foldername(name))[1] = (select auth.uid())::text
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'DataJuris owners and staff read legal files'
  ) then
    create policy "DataJuris owners and staff read legal files"
    on storage.objects for select to authenticated
    using (
      bucket_id = 'legal-documents'
      and (
        (storage.foldername(name))[1] = (select auth.uid())::text
        or public.is_staff()
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'DataJuris owners and staff update legal files'
  ) then
    create policy "DataJuris owners and staff update legal files"
    on storage.objects for update to authenticated
    using (
      bucket_id = 'legal-documents'
      and (
        (storage.foldername(name))[1] = (select auth.uid())::text
        or public.is_staff()
      )
    )
    with check (
      bucket_id = 'legal-documents'
      and (
        (storage.foldername(name))[1] = (select auth.uid())::text
        or public.is_staff()
      )
    );
  end if;
end $$;

-- No client-side DELETE policy is intentionally provided. File deletion must
-- be performed by a trusted server-side workflow after validating ownership.
