-- DataJuris initial schema for Supabase/PostgreSQL.
-- Apply with: supabase db push
create extension if not exists pgcrypto;

create type public.app_role as enum ('student','lawyer','contributor','moderator','admin');
create type public.document_status as enum ('draft','submitted','in_review','approved','rejected','published','archived');
create type public.submission_status as enum ('submitted','in_review','approved','rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  profession text,
  oab_state char(2),
  oab_number text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.legal_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.document_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  content text,
  area_id uuid references public.legal_areas(id) on delete set null,
  type_id uuid references public.document_types(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  source_name text,
  source_url text,
  license text,
  version integer not null default 1 check (version > 0),
  status public.document_status not null default 'draft',
  published_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_files (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
  checksum_sha256 text,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);
create table public.document_tags (
  document_id uuid not null references public.documents(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key(document_id, tag_id)
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, document_id)
);
create table public.document_events (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check(event_type in ('view','download')),
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  source_name text,
  license_declaration boolean not null default false,
  storage_path text not null,
  status public.submission_status not null default 'submitted',
  moderator_id uuid references auth.users(id) on delete set null,
  moderator_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (license_declaration = true)
);

create table public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check(length(title) between 8 and 180),
  body text not null check(length(body) between 20 and 12000),
  area_id uuid references public.legal_areas(id) on delete set null,
  is_locked boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check(length(body) between 2 and 12000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.forum_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.forum_topics(id) on delete cascade,
  post_id uuid references public.forum_posts(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check(status in ('open','reviewed','dismissed')),
  created_at timestamptz not null default now(),
  check ((topic_id is not null)::int + (post_id is not null)::int = 1)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  author_id uuid references auth.users(id) on delete set null,
  status public.document_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index documents_status_published_idx on public.documents(status,published_at desc);
create index documents_area_idx on public.documents(area_id);
create index documents_title_search_idx on public.documents using gin(to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(summary,'')));
create index forum_topics_created_idx on public.forum_topics(created_at desc);
create index articles_published_idx on public.articles(status,published_at desc);
create index document_events_doc_type_idx on public.document_events(document_id,event_type,created_at desc);

create or replace function public.has_role(required_role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id = auth.uid() and role = required_role) $$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id = auth.uid() and role in ('moderator','admin')) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles(id,full_name) values(new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  insert into public.user_roles(user_id,role) values(new.id,'student');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.legal_areas enable row level security;
alter table public.document_types enable row level security;
alter table public.documents enable row level security;
alter table public.document_files enable row level security;
alter table public.tags enable row level security;
alter table public.document_tags enable row level security;
alter table public.favorites enable row level security;
alter table public.document_events enable row level security;
alter table public.submissions enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_reports enable row level security;
alter table public.articles enable row level security;
alter table public.audit_logs enable row level security;

create policy "published profiles are visible to members" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());
create policy "users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "users read own roles; staff read all" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy "areas public read" on public.legal_areas for select using (is_active = true or public.is_staff());
create policy "types public read" on public.document_types for select using (true);
create policy "published docs public read" on public.documents for select using (status = 'published' or author_id = auth.uid() or public.is_staff());
create policy "authors create drafts" on public.documents for insert to authenticated with check (author_id = auth.uid() and status in ('draft','submitted'));
create policy "authors edit own drafts" on public.documents for update to authenticated using (author_id = auth.uid() and status in ('draft','rejected')) with check (author_id = auth.uid() and status in ('draft','submitted'));
create policy "staff manage docs" on public.documents for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "files visible for published docs" on public.document_files for select using (exists(select 1 from public.documents d where d.id=document_id and (d.status='published' or d.author_id=auth.uid() or public.is_staff())));
create policy "staff manage files" on public.document_files for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "tags public read" on public.tags for select using (true);
create policy "document tags public read" on public.document_tags for select using (exists(select 1 from public.documents d where d.id=document_id and d.status='published'));
create policy "users manage own favorites" on public.favorites for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "events insert" on public.document_events for insert with check (user_id is null or user_id=auth.uid());
create policy "staff read events" on public.document_events for select to authenticated using (public.is_staff());
create policy "users read own submissions" on public.submissions for select to authenticated using (user_id=auth.uid() or public.is_staff());
create policy "users submit licensed materials" on public.submissions for insert to authenticated with check (user_id=auth.uid() and status='submitted' and license_declaration=true);
create policy "staff manage submissions" on public.submissions for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "published forum topics read" on public.forum_topics for select using ((not is_hidden and auth.uid() is not null) or user_id=auth.uid() or public.is_staff());
create policy "members create topics" on public.forum_topics for insert to authenticated with check (user_id=auth.uid());
create policy "authors edit own topics" on public.forum_topics for update to authenticated using (user_id=auth.uid() or public.is_staff()) with check (user_id=auth.uid() or public.is_staff());
create policy "visible forum posts read" on public.forum_posts for select to authenticated using ((not is_hidden) or user_id=auth.uid() or public.is_staff());
create policy "members create posts on open topics" on public.forum_posts for insert to authenticated with check (user_id=auth.uid() and exists(select 1 from public.forum_topics t where t.id=topic_id and not t.is_locked and not t.is_hidden));
create policy "authors edit own posts" on public.forum_posts for update to authenticated using (user_id=auth.uid() or public.is_staff()) with check (user_id=auth.uid() or public.is_staff());
create policy "users create reports" on public.forum_reports for insert to authenticated with check (reporter_id=auth.uid());
create policy "staff manage reports" on public.forum_reports for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "published articles public read" on public.articles for select using (status='published' or public.is_staff());
create policy "staff manage articles" on public.articles for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff read audit logs" on public.audit_logs for select to authenticated using (public.is_staff());
create policy "staff insert audit logs" on public.audit_logs for insert to authenticated with check (public.is_staff());

insert into public.legal_areas(name,slug,sort_order) values
('Direito Civil','direito-civil',1),('Direito Trabalhista','direito-trabalhista',2),('Direito Penal','direito-penal',3),
('Direito de Família','direito-de-familia',4),('Direito do Consumidor','direito-do-consumidor',5),('Direito Contratual','direito-contratual',6),
('Direito Empresarial','direito-empresarial',7),('Direito Previdenciário','direito-previdenciario',8),('Direito Imobiliário','direito-imobiliario',9),
('Direito Tributário','direito-tributario',10),('Direito Administrativo','direito-administrativo',11),('Direito Ambiental','direito-ambiental',12)
on conflict(slug) do nothing;
insert into public.document_types(name,slug) values
('Petição inicial','peticao-inicial'),('Contestação','contestacao'),('Recurso','recurso'),('Contrato','contrato'),('Notificação','notificacao'),('Formulário','formulario'),('Parecer','parecer'),('Checklist','checklist')
on conflict(slug) do nothing;

-- Create a private Storage bucket manually or through Supabase dashboard:
-- bucket: legal-documents; public=false; max file size=20MB.
-- Storage policies must validate authenticated ownership and staff role.
-- Never put service_role keys in browser code.
