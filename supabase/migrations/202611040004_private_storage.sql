-- Private legal document storage for DataJuris.
-- Files are stored under a first-level folder equal to the authenticated user's UUID.
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
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Users can upload only into their own UUID folder.
drop policy if exists "DataJuris users upload own legal files" on storage.objects;
create policy "DataJuris users upload own legal files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'legal-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Only the owner or staff may read private files.
drop policy if exists "DataJuris owners and staff read legal files" on storage.objects;
create policy "DataJuris owners and staff read legal files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'legal-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_staff()
  )
);

-- Owners can replace or remove their own files; staff can moderate files.
drop policy if exists "DataJuris owners and staff update legal files" on storage.objects;
create policy "DataJuris owners and staff update legal files"
on storage.objects
for update
to authenticated
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

drop policy if exists "DataJuris owners and staff delete legal files" on storage.objects;
create policy "DataJuris owners and staff delete legal files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'legal-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_staff()
  )
);
