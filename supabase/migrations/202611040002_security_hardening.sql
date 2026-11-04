-- DataJuris security hardening.
-- Apply after 202611040001_initial_schema.sql.
-- This migration narrows client-side writes and preserves server-only audit integrity.

-- Client-side event logging must be authenticated and tied to a published document.
drop policy if exists "events insert" on public.document_events;
create policy "authenticated events for published documents"
on public.document_events
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.documents d
    where d.id = document_id
      and d.status = 'published'
  )
);

-- Audit entries must be written by trusted server-side code only.
-- RLS remains enabled and there is intentionally no INSERT policy for client roles.
drop policy if exists "staff insert audit logs" on public.audit_logs;

-- Submitted files must be stored under a per-user folder in the private bucket.
drop policy if exists "users submit licensed materials" on public.submissions;
create policy "users submit licensed materials"
on public.submissions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'submitted'
  and license_declaration = true
  and length(btrim(storage_path)) > 0
  and storage_path like auth.uid()::text || '/%'
);

-- Users cannot create pre-hidden or pre-locked discussion topics.
drop policy if exists "members create topics" on public.forum_topics;
create policy "members create topics"
on public.forum_topics
for insert
to authenticated
with check (
  user_id = auth.uid()
  and is_hidden = false
  and is_locked = false
);

-- Users cannot create hidden posts to bypass ordinary moderation visibility.
drop policy if exists "members create posts on open topics" on public.forum_posts;
create policy "members create posts on open topics"
on public.forum_posts
for insert
to authenticated
with check (
  user_id = auth.uid()
  and is_hidden = false
  and exists (
    select 1
    from public.forum_topics t
    where t.id = topic_id
      and not t.is_locked
      and not t.is_hidden
  )
);

-- Bound report text to reduce abuse and keep moderation manageable.
alter table public.forum_reports
  add constraint forum_reports_reason_length
  check (char_length(btrim(reason)) between 10 and 1000) not valid;

-- Indexes for common owner/moderation queries.
create index if not exists submissions_user_created_idx
  on public.submissions(user_id, created_at desc);
create index if not exists favorites_user_created_idx
  on public.favorites(user_id, created_at desc);
create index if not exists forum_posts_topic_created_idx
  on public.forum_posts(topic_id, created_at asc);
create index if not exists forum_reports_status_created_idx
  on public.forum_reports(status, created_at desc);
create index if not exists documents_author_created_idx
  on public.documents(author_id, created_at desc);
