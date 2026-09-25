-- =====================================================================
-- Badminton Tournament App — Supabase schema
-- Run this once in your Supabase project's SQL editor.
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  season text not null,
  status text not null default 'draft' check (status in ('draft','active','completed')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  name text not null check (name in ('Boys','Girls')),
  unique (tournament_id, name)
);

create table members (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  name text not null,
  phone text
);

create table teams (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references categories(id) on delete cascade,
  member_a_id uuid not null references members(id),
  member_b_id uuid not null references members(id),
  display_name text not null,
  check (member_a_id <> member_b_id)
);

create table matches (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references categories(id) on delete cascade,
  stage text not null check (stage in ('league','knockout_m1','knockout_m2','knockout_m3','final')),
  match_no int not null,
  team_a_id uuid references teams(id),
  team_b_id uuid references teams(id),
  score_a int,
  score_b int,
  status text not null default 'upcoming' check (status in ('upcoming','live','completed')),
  started_at timestamptz,
  completed_at timestamptz
);

create table tournament_admins (
  tournament_id uuid not null references tournaments(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete cascade,
  primary key (tournament_id, admin_id)
);

-- ---------------------------------------------------------------------
-- Standings view — always derived, never hand-edited.
-- "played" counts only matches with a recorded score (the bug fixed
-- earlier: an unplayed scheduled match must never count as a loss).
-- ---------------------------------------------------------------------

create view standings as
with league_results as (
  select
    category_id,
    team_a_id as team_id,
    case when score_a > score_b then 1 else 0 end as won,
    case when score_a = score_b then 1 else 0 end as tied,
    case when score_a < score_b then 1 else 0 end as lost,
    case when score_a > score_b then 2 when score_a = score_b then 1 else 0 end as points
  from matches
  where stage = 'league' and score_a is not null and score_b is not null and team_a_id is not null
  union all
  select
    category_id,
    team_b_id as team_id,
    case when score_b > score_a then 1 else 0 end as won,
    case when score_a = score_b then 1 else 0 end as tied,
    case when score_b < score_a then 1 else 0 end as lost,
    case when score_b > score_a then 2 when score_a = score_b then 1 else 0 end as points
  from matches
  where stage = 'league' and score_a is not null and score_b is not null and team_b_id is not null
)
select
  t.id as team_id,
  t.category_id,
  t.display_name as team_name,
  coalesce(count(lr.team_id), 0) as played,
  coalesce(sum(lr.won), 0) as won,
  coalesce(sum(lr.tied), 0) as tied,
  coalesce(sum(lr.lost), 0) as lost,
  coalesce(sum(lr.points), 0) as points,
  rank() over (partition by t.category_id order by coalesce(sum(lr.points), 0) desc) as rank
from teams t
left join league_results lr on lr.team_id = t.id
group by t.id, t.category_id, t.display_name;

-- ---------------------------------------------------------------------
-- Row Level Security: public read-only, admin-only writes
-- ---------------------------------------------------------------------

alter table tournaments enable row level security;
alter table categories enable row level security;
alter table members enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table tournament_admins enable row level security;

-- anyone (including anonymous) can read
create policy "public read tournaments" on tournaments for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read members" on members for select using (true);
create policy "public read teams" on teams for select using (true);
create policy "public read matches" on matches for select using (true);

-- only a tournament's admins can write to it
create policy "admins write tournaments" on tournaments for all
  using (exists (select 1 from tournament_admins ta where ta.tournament_id = tournaments.id and ta.admin_id = auth.uid()))
  with check (exists (select 1 from tournament_admins ta where ta.tournament_id = tournaments.id and ta.admin_id = auth.uid()));

create policy "admins write categories" on categories for all
  using (exists (select 1 from tournament_admins ta where ta.tournament_id = categories.tournament_id and ta.admin_id = auth.uid()));

create policy "admins write members" on members for all
  using (exists (select 1 from tournament_admins ta where ta.tournament_id = members.tournament_id and ta.admin_id = auth.uid()));

create policy "admins write teams" on teams for all
  using (exists (
    select 1 from tournament_admins ta
    join categories c on c.tournament_id = ta.tournament_id
    where c.id = teams.category_id and ta.admin_id = auth.uid()
  ));

create policy "admins write matches" on matches for all
  using (exists (
    select 1 from tournament_admins ta
    join categories c on c.tournament_id = ta.tournament_id
    where c.id = matches.category_id and ta.admin_id = auth.uid()
  ));

create policy "admins manage tournament_admins" on tournament_admins for all
  using (admin_id = auth.uid());

-- creating a tournament auto-adds the creator as its first admin
create or replace function handle_new_tournament()
returns trigger as $$
begin
  insert into tournament_admins (tournament_id, admin_id) values (new.id, new.created_by);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_tournament_created
  after insert on tournaments
  for each row execute function handle_new_tournament();
