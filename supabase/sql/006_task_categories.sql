-- ============================================================
-- 006 – Task categories lookup table
-- ============================================================
-- Run order: 6 of 7  (standalone, no dependencies)
-- ============================================================
-- Maps each task_id to a topic category so we can compute
-- per-topic accuracy and award badges.

-- 1. Table
create table if not exists public.task_categories (
  task_id        text primary key,
  category       text not null,
  display_order  int not null default 0
);

create index if not exists task_categories_category_idx
  on public.task_categories (category);

-- 2. Enable RLS (read-only for everyone, admin-writable)
alter table public.task_categories enable row level security;

drop policy if exists "task_categories_select_all" on public.task_categories;
create policy "task_categories_select_all" on public.task_categories
for select to authenticated
using (true);

drop policy if exists "task_categories_admin_insert" on public.task_categories;
create policy "task_categories_admin_insert" on public.task_categories
for insert to authenticated
with check (public.is_admin());

drop policy if exists "task_categories_admin_update" on public.task_categories;
create policy "task_categories_admin_update" on public.task_categories
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "task_categories_admin_delete" on public.task_categories;
create policy "task_categories_admin_delete" on public.task_categories
for delete to authenticated
using (public.is_admin());

-- 3. Seed data
-- Zahlendarstellung (5 missions)
insert into public.task_categories (task_id, category, display_order) values
  ('number-system',              'zahlendarstellung',     1),
  ('positive-arithmetic',        'zahlendarstellung',     2),
  ('complements',                'zahlendarstellung',     3),
  ('twos-complement-arithmetic', 'zahlendarstellung',     4),
  ('quiz',                       'zahlendarstellung',     5)
on conflict (task_id) do update
  set category      = excluded.category,
      display_order = excluded.display_order;

-- Mikroprozessortechnik (4 missions)
insert into public.task_categories (task_id, category, display_order) values
  ('von-neumann',    'mikroprozessortechnik', 1),
  ('read-assembly',  'mikroprozessortechnik', 2),
  ('write-assembly', 'mikroprozessortechnik', 3),
  ('java-to-assembly','mikroprozessortechnik', 4)
on conflict (task_id) do update
  set category      = excluded.category,
      display_order = excluded.display_order;
