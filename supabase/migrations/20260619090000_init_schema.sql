-- =============================================================================
-- Plan dein Ding — Phase 2: Schema, RLS, Helfer-Funktionen & Views
-- Reproduzierbar: `supabase db reset` (lokal) bzw. `supabase db push` (gelinkt).
-- =============================================================================

-- gen_random_uuid() ist in PG13+ Core enthalten (Supabase = PG15). pgcrypto zur
-- Sicherheit bereitstellen, falls in einer Umgebung nicht vorab geladen.
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tabellen
-- -----------------------------------------------------------------------------

-- profiles (1:1 zu auth.users)
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role         text not null default 'user'
                 check (role in ('user', 'admin')),
  can_rate     boolean not null default false,
  created_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Öffentliches Profil je Auth-User. role: user|admin (Admin manuell). '
  'can_rate schaltet das Bewerten frei.';

-- projects
create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles (id) on delete cascade,
  title           text not null,
  teaser          text not null,                 -- dient als SEO-Description
  description     text not null,
  cover_template  text not null
                    check (cover_template in
                      ('hellblau', 'dunkelblau', 'hell-klar', 'split', 'gruen', 'muster')),
  slug            text not null unique,
  status          text not null default 'pending'
                    check (status in ('draft', 'pending', 'published', 'rejected')),
  rejection_reason text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz
);

comment on table public.projects is
  'Eingereichte Projekte. Default-Status pending; Admin kann direkt published. '
  'cover_template mappt 1:1 auf die Cover-SVG-Dateinamen in /public.';

-- ratings
create table public.ratings (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  stars          smallint not null check (stars between 1 and 5),
  comment        text,
  comment_hidden boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (project_id, user_id)               -- eine Bewertung je Nutzer/Projekt
);

comment on table public.ratings is
  'Sternebewertung (1–5, Pflicht) + optionaler Kommentar. '
  'comment_hidden = nachträgliche Kommentar-Moderation (Sterne zählen weiter).';

-- -----------------------------------------------------------------------------
-- Indizes
-- -----------------------------------------------------------------------------
create index projects_status_idx    on public.projects (status);
create index projects_author_id_idx on public.projects (author_id);
-- projects.slug: unique-Constraint erzeugt bereits einen eindeutigen Index.
create index ratings_project_id_idx  on public.ratings (project_id);

-- -----------------------------------------------------------------------------
-- SECURITY DEFINER Helfer (lesen profiles ohne RLS-Rekursion; search_path fix)
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.can_current_user_rate()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and can_rate = true
  );
$$;

-- -----------------------------------------------------------------------------
-- Trigger-Funktionen
-- -----------------------------------------------------------------------------

-- Legt bei Signup automatisch eine profiles-Zeile an (display_name aus Metadaten).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generischer updated_at-Trigger.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger ratings_set_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

-- Integritäts-Trigger projects: erzwingt die Regeln aus CLAUDE.md auf DB-Ebene
-- (RLS WITH CHECK kann OLD vs NEW nicht vergleichen):
--   * Nicht-Admins dürfen privilegierte Spalten nicht ändern
--     -> "Bearbeiten eines published bleibt published", kein Self-Publish.
--   * published_at wird beim Wechsel auf published gesetzt.
-- auth.uid() IS NULL = Service-Role/serverseitig -> volle Kontrolle.
create or replace function public.projects_enforce()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and auth.uid() is not null
     and not public.is_admin() then
    new.author_id        := old.author_id;
    new.status           := old.status;
    new.slug             := old.slug;
    new.rejection_reason := old.rejection_reason;
    new.published_at     := old.published_at;
  end if;

  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  return new;
end;
$$;

create trigger projects_enforce
  before insert or update on public.projects
  for each row execute function public.projects_enforce();

-- Integritäts-Trigger ratings: Nicht-Admins dürfen Moderationsflag/Schlüssel
-- nicht verändern (sonst könnten Nutzer eigene ausgeblendete Kommentare wieder
-- sichtbar schalten).
create or replace function public.ratings_enforce()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and auth.uid() is not null
     and not public.is_admin() then
    new.user_id        := old.user_id;
    new.project_id     := old.project_id;
    new.comment_hidden := old.comment_hidden;
  end if;
  return new;
end;
$$;

create trigger ratings_enforce
  before update on public.ratings
  for each row execute function public.ratings_enforce();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.ratings  enable row level security;

-- profiles -------------------------------------------------------------------
-- Lesen: eigenes Profil oder Admin. (Öffentliche Anzeige -> View public_profiles.)
create policy profiles_select_own_or_admin
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Aktualisieren: nur eigenes Profil. Spaltenrechte (siehe GRANTS) beschränken
-- Nicht-Admins auf display_name; role/can_rate ändert der Admin per Service-Role.
create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- (Kein INSERT/DELETE-Policy: profiles entstehen via handle_new_user-Trigger
--  und werden per auth.users-Cascade gelöscht.)

-- projects -------------------------------------------------------------------
-- Lesen: published für alle; eigene Projekte für den Autor; alles für Admin.
create policy projects_select_published_or_own_or_admin
  on public.projects for select
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_admin()
  );

-- Einfügen: nur als eigener Autor; Status erzwingt pending (außer Admin).
create policy projects_insert_author
  on public.projects for insert
  with check (
    author_id = auth.uid()
    and (public.is_admin() or status = 'pending')
  );

-- Aktualisieren: eigener Autor oder Admin (Spalten-Integrität via Trigger).
create policy projects_update_own_or_admin
  on public.projects for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

-- Löschen: eigener Autor oder Admin.
create policy projects_delete_own_or_admin
  on public.projects for delete
  using (author_id = auth.uid() or public.is_admin());

-- ratings --------------------------------------------------------------------
-- Lesen der Basistabelle: eigene Bewertungen oder Admin.
-- (Öffentliche Bewertungsliste -> View public_ratings; Statistik -> View.)
create policy ratings_select_own_or_admin
  on public.ratings for select
  using (user_id = auth.uid() or public.is_admin());

-- Einfügen: freigeschalteter Nicht-Autor auf ein published-Projekt.
create policy ratings_insert_eligible
  on public.ratings for insert
  with check (
    user_id = auth.uid()
    and public.can_current_user_rate()
    and exists (
      select 1 from public.projects p
      where p.id = ratings.project_id
        and p.status = 'published'
        and p.author_id <> auth.uid()      -- keine Selbstbewertung
    )
  );

-- Aktualisieren: eigene Bewertung oder Admin (comment_hidden via Trigger geschützt).
create policy ratings_update_own_or_admin
  on public.ratings for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Löschen: eigene Bewertung oder Admin.
create policy ratings_delete_own_or_admin
  on public.ratings for delete
  using (user_id = auth.uid() or public.is_admin());

-- -----------------------------------------------------------------------------
-- Views (laufen mit Owner-Rechten -> umgehen RLS gezielt für öffentliche Daten)
-- -----------------------------------------------------------------------------

-- Öffentliche Profil-Infos.
create view public.public_profiles as
  select id, display_name
  from public.profiles;

-- Bewertungsstatistik je published-Projekt — Sterne zählen unabhängig von
-- comment_hidden.
create view public.project_rating_stats as
  select
    r.project_id,
    round(avg(r.stars)::numeric, 2) as avg_stars,
    count(*)::int                   as rating_count
  from public.ratings r
  join public.projects p
    on p.id = r.project_id and p.status = 'published'
  group by r.project_id;

-- Öffentliche Bewertungsliste für published-Projekte: maskiert ausgeblendete
-- Kommentare (Sterne/Anzeigename bleiben sichtbar).
create view public.public_ratings as
  select
    r.id,
    r.project_id,
    r.user_id,
    pr.display_name,
    r.stars,
    case when r.comment_hidden then null else r.comment end as comment,
    r.comment_hidden,
    r.created_at,
    r.updated_at
  from public.ratings r
  join public.profiles pr on pr.id = r.user_id
  join public.projects p  on p.id  = r.project_id and p.status = 'published';

-- -----------------------------------------------------------------------------
-- GRANTS (RLS bleibt die Zeilen-Sicherheitsgrenze)
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

-- profiles: anon kein Direktzugriff; authenticated liest (RLS) & ändert nur display_name.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

-- projects: alle lesen (RLS gated), authenticated schreibt.
revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

-- ratings: anon kein Direktzugriff (öffentlich nur via View), authenticated schreibt.
revoke all on public.ratings from anon, authenticated;
grant select, insert, update, delete on public.ratings to authenticated;

-- Views: öffentlich lesbar.
grant select on public.public_profiles      to anon, authenticated;
grant select on public.project_rating_stats to anon, authenticated;
grant select on public.public_ratings       to anon, authenticated;

-- Helfer-Funktionen ausführbar (werden in Policies genutzt).
grant execute on function public.is_admin()               to anon, authenticated;
grant execute on function public.can_current_user_rate()  to anon, authenticated;
