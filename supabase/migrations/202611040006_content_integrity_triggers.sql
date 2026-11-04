-- Enforce moderation-owned fields even when a row-level policy allows content edits.
-- The trigger function runs with a fixed empty search_path and qualified objects.
create or replace function private.enforce_content_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'forum_topics' and tg_op = 'UPDATE' then
    if not public.is_staff()
      and (
        new.is_hidden is distinct from old.is_hidden
        or new.is_locked is distinct from old.is_locked
      ) then
      raise exception 'Somente a moderação pode ocultar ou bloquear tópicos.'
        using errcode = '42501';
    end if;
  elsif tg_table_name = 'forum_posts' and tg_op = 'UPDATE' then
    if not public.is_staff()
      and new.is_hidden is distinct from old.is_hidden then
      raise exception 'Somente a moderação pode ocultar publicações.'
        using errcode = '42501';
    end if;
  elsif tg_table_name = 'forum_reports' and tg_op = 'INSERT' then
    if not public.is_staff() and new.status <> 'open' then
      raise exception 'Denúncias novas devem iniciar com status open.'
        using errcode = '42501';
    end if;
  elsif tg_table_name = 'submissions' and tg_op = 'INSERT' then
    if not public.is_staff()
      and (
        new.status <> 'submitted'
        or new.moderator_id is not null
        or new.moderator_note is not null
      ) then
      raise exception 'O usuário não pode definir dados de moderação na submissão.'
        using errcode = '42501';
    end if;
  elsif tg_table_name = 'documents' then
    if not public.is_staff() then
      if tg_op = 'INSERT' then
        if new.reviewed_at is not null
          or new.reviewed_by is not null
          or new.published_at is not null then
          raise exception 'O autor não pode definir metadados de revisão ou publicação.'
            using errcode = '42501';
        end if;
      elsif tg_op = 'UPDATE' and (
        new.reviewed_at is distinct from old.reviewed_at
        or new.reviewed_by is distinct from old.reviewed_by
        or new.published_at is distinct from old.published_at
      ) then
        raise exception 'Somente a equipe pode alterar metadados de revisão ou publicação.'
          using errcode = '42501';
      end if;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_content_integrity() from public, anon, authenticated;

create trigger datajuris_protect_topic_moderation_fields
before update on public.forum_topics
for each row execute function private.enforce_content_integrity();

create trigger datajuris_protect_post_moderation_fields
before update on public.forum_posts
for each row execute function private.enforce_content_integrity();

create trigger datajuris_protect_report_status
before insert on public.forum_reports
for each row execute function private.enforce_content_integrity();

create trigger datajuris_protect_submission_moderation_fields
before insert on public.submissions
for each row execute function private.enforce_content_integrity();

create trigger datajuris_protect_document_review_fields
before insert or update on public.documents
for each row execute function private.enforce_content_integrity();
