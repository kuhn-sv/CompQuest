-- Game content schema: components (levels), quests (sublevels), tasks
-- and user progress: attempts, best scores, component progression

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- CONTENT TABLES (admin-managed)
create table if not exists public.components (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text,
  model_key text, -- key to map to 3D model component name
  order_index int not null,
  prerequisite_component_id uuid references public.components(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
-- Ensure deterministic ordering
create unique index if not exists components_order_idx on public.components(order_index);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create unique index if not exists quests_component_order_idx on public.quests(component_id, order_index);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null,
  points_max_speed int not null default 100,
  points_max_accuracy int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create unique index if not exists tasks_quest_order_idx on public.tasks(quest_id, order_index);

-- USER PROGRESS TABLES (user-owned)
create table if not exists public.user_component_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  component_id uuid not null references public.components(id) on delete cascade,
  status text not null check (status in ('locked','unlocked','in_progress','completed')),
  unlocked_at timestamptz,
  last_attempt_at timestamptz,
  last_completed_at timestamptz,
  attempts_count int not null default 0,
  best_total_points int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  primary key (user_id, component_id)
);

create table if not exists public.user_task_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  created_at timestamptz not null default now(),
  duration_ms int,
  speed_points int not null default 0,
  accuracy_points int not null default 0,
  total_points int not null default 0
);
create index if not exists user_task_attempts_user_task_idx on public.user_task_attempts(user_id, task_id);

create table if not exists public.user_task_best (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  best_attempt_id uuid references public.user_task_attempts(id) on delete set null,
  best_speed_points int not null default 0,
  best_accuracy_points int not null default 0,
  best_total_points int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

-- ACHIEVEMENTS (future-proof)
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  description text,
  icon text,
  points int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- RLS POLICIES

-- Enable RLS
alter table public.components enable row level security;
alter table public.quests enable row level security;
alter table public.tasks enable row level security;
alter table public.user_component_progress enable row level security;
alter table public.user_task_attempts enable row level security;
alter table public.user_task_best enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- Content tables: readable by all authenticated users, writeable by admins
drop policy if exists "components_read" on public.components;
create policy "components_read" on public.components for select to authenticated using (true);
drop policy if exists "components_write_admin" on public.components;
create policy "components_write_admin" on public.components for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "quests_read" on public.quests;
create policy "quests_read" on public.quests for select to authenticated using (true);
drop policy if exists "quests_write_admin" on public.quests;
create policy "quests_write_admin" on public.quests for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tasks_read" on public.tasks;
create policy "tasks_read" on public.tasks for select to authenticated using (true);
drop policy if exists "tasks_write_admin" on public.tasks;
create policy "tasks_write_admin" on public.tasks for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- User progress: users can manage their own, admins can manage all
drop policy if exists "ucp_select" on public.user_component_progress;
create policy "ucp_select" on public.user_component_progress for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "ucp_modify" on public.user_component_progress;
create policy "ucp_modify" on public.user_component_progress for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "uta_select" on public.user_task_attempts;
create policy "uta_select" on public.user_task_attempts for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "uta_modify" on public.user_task_attempts;
create policy "uta_modify" on public.user_task_attempts for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "utb_select" on public.user_task_best;
create policy "utb_select" on public.user_task_best for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "utb_modify" on public.user_task_best;
create policy "utb_modify" on public.user_task_best for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "achievements_read" on public.achievements;
create policy "achievements_read" on public.achievements for select to authenticated using (true);
drop policy if exists "achievements_write_admin" on public.achievements;
create policy "achievements_write_admin" on public.achievements for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ua_select" on public.user_achievements;
create policy "ua_select" on public.user_achievements for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "ua_modify" on public.user_achievements;
create policy "ua_modify" on public.user_achievements for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
