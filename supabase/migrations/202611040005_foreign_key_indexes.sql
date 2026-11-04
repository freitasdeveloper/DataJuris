-- Add indexes for foreign-key columns identified by Supabase Performance Advisor.
-- These indexes improve joins and parent-row update/delete checks.
create index if not exists articles_author_id_idx on public.articles(author_id);
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists document_events_user_id_idx on public.document_events(user_id);
create index if not exists document_files_document_id_idx on public.document_files(document_id);
create index if not exists document_tags_tag_id_idx on public.document_tags(tag_id);
create index if not exists documents_reviewed_by_idx on public.documents(reviewed_by);
create index if not exists documents_type_id_idx on public.documents(type_id);
create index if not exists favorites_document_id_idx on public.favorites(document_id);
create index if not exists forum_posts_user_id_idx on public.forum_posts(user_id);
create index if not exists forum_reports_post_id_idx on public.forum_reports(post_id);
create index if not exists forum_reports_reporter_id_idx on public.forum_reports(reporter_id);
create index if not exists forum_reports_topic_id_idx on public.forum_reports(topic_id);
create index if not exists forum_topics_area_id_idx on public.forum_topics(area_id);
create index if not exists forum_topics_user_id_idx on public.forum_topics(user_id);
create index if not exists submissions_moderator_id_idx on public.submissions(moderator_id);
