-- =============================================================================
-- RLS-Smoke-Test (manuell):  docker exec -i supabase_db_plan-dein-ding \
--   psql -U postgres -d postgres -v ON_ERROR_STOP=0 -f - < supabase/tests/rls_smoke.sql
-- Prüft die Sicherheitsregeln aus CLAUDE.md / Phase 2. Erwartung: alle PASS = t.
-- =============================================================================
\set A '11111111-1111-1111-1111-111111111111'
\set R '22222222-2222-2222-2222-222222222222'
\set U '33333333-3333-3333-3333-333333333333'
\set P1 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set P2 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

-- --- Aufräumen (idempotent) -------------------------------------------------
reset role;
select set_config('request.jwt.claims', '', false);
delete from auth.users where id in (:'A', :'R', :'U');

-- --- Seed: Auth-User anlegen -> handle_new_user erzeugt profiles ------------
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change)
values
 ('00000000-0000-0000-0000-000000000000', :'A', 'authenticated','authenticated','autor@test.de',  crypt('pw',gen_salt('bf')), now(), now(), now(), '{"provider":"email"}','{"display_name":"Autor A"}',  false,'','','',''),
 ('00000000-0000-0000-0000-000000000000', :'R', 'authenticated','authenticated','rater@test.de',  crypt('pw',gen_salt('bf')), now(), now(), now(), '{"provider":"email"}','{"display_name":"Rater R"}',  false,'','','',''),
 ('00000000-0000-0000-0000-000000000000', :'U', 'authenticated','authenticated','admin@test.de',  crypt('pw',gen_salt('bf')), now(), now(), now(), '{"provider":"email"}','{"display_name":"Admin U"}',  false,'','','','');

select 'T01 handle_new_user legt profiles an' as test,
       count(*) = 3 as pass
from public.profiles where id in (:'A', :'R', :'U');

select 'T02 display_name aus Metadaten' as test,
       (select display_name from public.profiles where id = :'A') = 'Autor A' as pass;

-- Admin- und can_rate-Freigaben (entspricht manuell/Service-Role)
update public.profiles set role = 'admin'  where id = :'U';
update public.profiles set can_rate = true where id = :'R';

-- Seed-Projekte (als postgres -> RLS-Bypass; published_at-Trigger greift trotzdem)
insert into public.projects (id, author_id, title, teaser, description, cover_template, slug, status)
values (:'P1', :'A', 'Pub',  't','d','hellblau','proj-pub',  'published'),
       (:'P2', :'A', 'Pend', 't','d','split',   'proj-pend', 'pending');

select 'T03 published_at automatisch gesetzt' as test,
       (select published_at is not null from public.projects where slug='proj-pub') as pass;

-- --- anon: sieht nur published ---------------------------------------------
select set_config('request.jwt.claims', '', false);
set role anon;
select 'T04 anon sieht nur published' as test,
       (select count(*) from public.projects) = 1 as pass;

do $$ begin
  perform 1 from public.ratings;
  raise notice 'T05 anon kein Direktzugriff auf ratings: FAIL (erlaubt)';
exception when others then
  raise notice 'T05 anon kein Direktzugriff auf ratings: PASS (%).', sqlerrm;
end $$;

-- --- Autor A: sieht eigenes pending zusätzlich ------------------------------
reset role;
select set_config('request.jwt.claims', json_build_object('sub', :'A', 'role','authenticated')::text, false);
set role authenticated;
select 'T06 Autor sieht eigenes pending' as test,
       (select count(*) from public.projects) = 2 as pass;

-- Selbstbewertung verboten (A bewertet eigenes published)
do $$ begin
  insert into public.ratings(project_id,user_id,stars) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111',5);
  raise notice 'T07 Selbstbewertung verboten: FAIL (erlaubt)';
exception when others then
  raise notice 'T07 Selbstbewertung verboten: PASS (blockiert).';
end $$;

-- Non-Admin kann nicht published einfügen (Insert erzwingt pending)
do $$ begin
  insert into public.projects(author_id,title,teaser,description,cover_template,slug,status)
  values('11111111-1111-1111-1111-111111111111','X','t','d','muster','proj-x','published');
  raise notice 'T08 Insert erzwingt pending (Non-Admin): FAIL (published erlaubt)';
exception when others then
  raise notice 'T08 Insert erzwingt pending (Non-Admin): PASS (blockiert).';
end $$;

-- Autor editiert published -> bleibt published (Trigger), Inhalt änderbar
update public.projects set status='draft', title='Pub editiert' where slug='proj-pub';
reset role;
select 'T09 Bearbeiten eines published bleibt published' as test,
       (select status from public.projects where slug='proj-pub') = 'published' as pass,
       (select title  from public.projects where slug='proj-pub') = 'Pub editiert' as inhalt_geaendert;

-- --- Rater R (can_rate, Nicht-Autor): darf bewerten ------------------------
select set_config('request.jwt.claims', json_build_object('sub', :'R', 'role','authenticated')::text, false);
set role authenticated;
do $$ begin
  insert into public.ratings(project_id,user_id,stars,comment)
  values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222',4,'starke Idee');
  raise notice 'T10 Freigegebener Nicht-Autor darf bewerten: PASS.';
exception when others then
  raise notice 'T10 Freigegebener Nicht-Autor darf bewerten: FAIL (%).', sqlerrm;
end $$;

-- --- Admin U: is_admin(), darf freigeben -----------------------------------
reset role;
select set_config('request.jwt.claims', json_build_object('sub', :'U', 'role','authenticated')::text, false);
set role authenticated;
select 'T11 is_admin() für Admin' as test, public.is_admin() as pass;
select 'T12 can_current_user_rate() für Admin (kein can_rate)' as test, public.can_current_user_rate() = false as pass;

update public.projects set status='published' where slug='proj-pend';
reset role;
select 'T13 Admin gibt pending frei -> published + published_at' as test,
       (select status from public.projects where slug='proj-pend') = 'published'
       and (select published_at is not null from public.projects where slug='proj-pend') as pass;

-- Admin blendet Kommentar aus (Moderation)
select set_config('request.jwt.claims', json_build_object('sub', :'U', 'role','authenticated')::text, false);
set role authenticated;
update public.ratings set comment_hidden = true where user_id = :'R';
reset role;

-- --- anon: Kommentar maskiert, Sterne bleiben, Statistik zählt weiter -------
select set_config('request.jwt.claims', '', false);
set role anon;
select 'T14 public_ratings maskiert versteckten Kommentar' as test,
       (select comment is null from public.public_ratings where user_id = :'R') as pass,
       (select stars from public.public_ratings where user_id = :'R') = 4 as sterne_sichtbar;
select 'T15 project_rating_stats zählt Sterne unabhängig von comment_hidden' as test,
       (select rating_count from public.project_rating_stats where project_id = :'P1') = 1 as pass,
       (select avg_stars   from public.project_rating_stats where project_id = :'P1') = 4.00 as schnitt_ok;

-- Unfreigeschalteter Nutzer (kein can_rate) darf nicht bewerten — Admin U hat can_rate=false
reset role;
select set_config('request.jwt.claims', json_build_object('sub', :'U', 'role','authenticated')::text, false);
set role authenticated;
do $$ begin
  insert into public.ratings(project_id,user_id,stars)
  values('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','33333333-3333-3333-3333-333333333333',3);
  -- Hinweis: U ist zwar Admin, hat aber can_rate=false -> Insert-Policy verlangt can_current_user_rate()
  raise notice 'T16 ohne can_rate keine Bewertung: FAIL (erlaubt)';
exception when others then
  raise notice 'T16 ohne can_rate keine Bewertung: PASS (blockiert).';
end $$;

reset role;
select set_config('request.jwt.claims', '', false);
\echo '--- Smoke-Test fertig: alle pass-Spalten sollten t sein, T05/07/08/16 PASS-NOTICEs ---'
