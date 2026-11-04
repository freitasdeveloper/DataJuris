create extension if not exists pgtap with schema extensions;

begin;

select plan(13);

select ok(
  (select count(*) = 16
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'),
  'the expected 16 public application tables exist'
);

select ok(
  (select count(*) = 16 and bool_and(c.relrowsecurity)
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'),
  'RLS is enabled on every public application table'
);

select ok(
  (select count(distinct trigger_name) = 5
   from information_schema.triggers
   where trigger_schema = 'public'
     and trigger_name like 'datajuris_%'),
  'all five content-integrity triggers exist'
);

select ok(
  to_regprocedure('private.enforce_content_integrity()') is not null,
  'the private content-integrity trigger function exists'
);

select ok(
  not has_function_privilege('anon', 'private.enforce_content_integrity()', 'EXECUTE')
  and not has_function_privilege('authenticated', 'private.enforce_content_integrity()', 'EXECUTE'),
  'client roles cannot execute the privileged trigger function directly'
);

select ok(
  (select count(*) = 2 and bool_and(not p.prosecdef)
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in ('has_role', 'is_staff')),
  'public role-check wrappers are SECURITY INVOKER'
);

select ok(
  (select count(*) = 1 and bool_and(public = false)
   from storage.buckets
   where id = 'legal-documents'),
  'the legal-documents bucket exists and is private'
);

select ok(
  (select file_size_limit = 20971520
   from storage.buckets
   where id = 'legal-documents'),
  'the legal-documents bucket enforces the 20 MB limit'
);

select ok(
  (select count(*) = 3
   from pg_policies
   where schemaname = 'storage'
     and tablename = 'objects'
     and policyname like 'DataJuris%'),
  'the three owner/staff Storage policies exist'
);

select ok(
  not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname like 'DataJuris%'
      and cmd = 'DELETE'
  ),
  'there is no client-side Storage DELETE policy'
);

select ok(
  (select count(*) = 15
   from pg_indexes
   where schemaname = 'public'
     and indexname = any (array[
       'articles_author_id_idx',
       'audit_logs_actor_id_idx',
       'document_events_user_id_idx',
       'document_files_document_id_idx',
       'document_tags_tag_id_idx',
       'documents_reviewed_by_idx',
       'documents_type_id_idx',
       'favorites_document_id_idx',
       'forum_posts_user_id_idx',
       'forum_reports_post_id_idx',
       'forum_reports_reporter_id_idx',
       'forum_reports_topic_id_idx',
       'forum_topics_area_id_idx',
       'forum_topics_user_id_idx',
       'submissions_moderator_id_idx'
     ])),
  'all 15 foreign-key performance indexes exist'
);

select ok(
  (select count(*) = 12 from public.legal_areas),
  'the 12 initial legal areas are seeded'
);

select ok(
  (select count(*) = 8 from public.document_types),
  'the eight initial document types are seeded'
);

select * from finish();

rollback;
