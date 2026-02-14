-- ============================================================
-- 003 – Tim Conversations & Feedback
-- ============================================================
-- Run order: 3 of 5
-- ============================================================

-- 1. Conversations Table
create table if not exists public.tim_conversations (
  id          uuid primary key default gen_random_uuid(),
  task_id     text not null,
  task_title  text,
  messages    jsonb not null default '[]'::jsonb,
  rating      int check (rating >= 1 and rating <= 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for task-based lookups (optional, usually we lookup by ID)
create index if not exists tim_conversations_task_idx
  on public.tim_conversations (task_id);

alter table public.tim_conversations enable row level security;

-- Policies for conversations
-- Since we removed user_id, ownership is via the UUID (session ID).
-- We allow authenticated users to perform operations.
drop policy if exists "tim_conversations_policy" on public.tim_conversations;
create policy "tim_conversations_policy" on public.tim_conversations
for all to authenticated
using (true)
with check (true);


-- 2. Message Feedback Table (Thumbs Up/Down)
create table if not exists public.tim_message_feedback (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.tim_conversations(id) on delete cascade,
  message_index   int not null, -- Index of the message in the conversation array
  message_content jsonb not null, -- Storing { question: string, answer: string }
  is_helpful      boolean not null,
  created_at      timestamptz not null default now()
);

create index if not exists tim_feedback_conversation_idx
  on public.tim_message_feedback (conversation_id);

alter table public.tim_message_feedback enable row level security;

-- Policies for feedback
drop policy if exists "tim_feedback_policy" on public.tim_message_feedback;
create policy "tim_feedback_policy" on public.tim_message_feedback
for all to authenticated
using (true)
with check (true);
