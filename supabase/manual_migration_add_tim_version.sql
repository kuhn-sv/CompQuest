-- Add tim_version columns
ALTER TABLE public.tim_conversations ADD COLUMN IF NOT EXISTS tim_version text;
ALTER TABLE public.tim_message_feedback ADD COLUMN IF NOT EXISTS tim_version text;

-- Update save_tim_conversation RPC
CREATE OR REPLACE FUNCTION public.save_tim_conversation(
  p_id uuid,
  p_task_id text,
  p_task_title text,
  p_messages jsonb,
  p_rating int default null,
  p_tim_version text default null
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.tim_conversations (id, task_id, task_title, messages, rating, tim_version, updated_at)
  VALUES (p_id, p_task_id, p_task_title, p_messages, p_rating, p_tim_version, now())
  ON CONFLICT (id)
  DO UPDATE SET
    messages = excluded.messages,
    rating = COALESCE(excluded.rating, public.tim_conversations.rating),
    tim_version = COALESCE(excluded.tim_version, public.tim_conversations.tim_version),
    updated_at = now();
END;
$$;

-- Update rate_tim_message RPC
CREATE OR REPLACE FUNCTION public.rate_tim_message(
  p_conversation_id uuid,
  p_message_index int,
  p_message_content jsonb,
  p_is_helpful boolean,
  p_tim_version text default null
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.tim_message_feedback (conversation_id, message_index, message_content, is_helpful, tim_version)
  VALUES (p_conversation_id, p_message_index, p_message_content, p_is_helpful, p_tim_version);
END;
$$;
