-- Function to update challenge progress
CREATE OR REPLACE FUNCTION update_challenge_progress(
  p_user_id UUID,
  p_challenge_id UUID,
  p_progress INTEGER
) RETURNS void AS $$
BEGIN
  -- Update progress in user_challenges
  UPDATE public.user_challenges
  SET
    progress = p_progress,
    -- If progress meets or exceeds goal, mark as completed
    completed_at = CASE
      WHEN p_progress >= (SELECT goal_value FROM public.challenges WHERE id = p_challenge_id)
      AND completed_at IS NULL
      THEN CURRENT_TIMESTAMP
      ELSE completed_at
    END
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to handle challenge completion
CREATE OR REPLACE FUNCTION handle_challenge_completion() RETURNS TRIGGER AS $$
BEGIN
  -- If challenge was just completed (completed_at changed from NULL to timestamp)
  IF OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL THEN
    -- Get challenge details
    WITH challenge_data AS (
      SELECT reward_points
      FROM public.challenges
      WHERE id = NEW.challenge_id
    )
    -- Add points to user's balance
    UPDATE public.profiles
    SET points_balance = points_balance + (SELECT reward_points FROM challenge_data)
    WHERE id = NEW.user_id;

    -- Create notification for challenge completion
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      action_data
    )
    SELECT
      NEW.user_id,
      'Challenge Terminé !',
      'Vous avez terminé le challenge "' || c.title || '" et gagné ' || c.reward_points || ' points !',
      'challenge_completed',
      jsonb_build_object(
        'challenge_id', c.id,
        'reward_points', c.reward_points
      )
    FROM public.challenges c
    WHERE c.id = NEW.challenge_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for challenge completion
DROP TRIGGER IF EXISTS on_challenge_completion ON public.user_challenges;
CREATE TRIGGER on_challenge_completion
  AFTER UPDATE ON public.user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION handle_challenge_completion();

-- Function to join a challenge
CREATE OR REPLACE FUNCTION join_challenge(
  p_user_id UUID,
  p_challenge_id UUID
) RETURNS public.user_challenges AS $$
DECLARE
  v_challenge_record public.user_challenges;
BEGIN
  -- Check if challenge exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM public.challenges
    WHERE id = p_challenge_id
    AND start_date <= CURRENT_TIMESTAMP
    AND end_date >= CURRENT_TIMESTAMP
    AND archive = false
  ) THEN
    RAISE EXCEPTION 'Challenge not found or not active';
  END IF;

  -- Check if user already joined
  IF EXISTS (
    SELECT 1 FROM public.user_challenges
    WHERE user_id = p_user_id AND challenge_id = p_challenge_id
  ) THEN
    RAISE EXCEPTION 'Already joined this challenge';
  END IF;

  -- Join challenge with initial progress
  INSERT INTO public.user_challenges (
    user_id,
    challenge_id,
    progress,
    completed_at
  )
  VALUES (
    p_user_id,
    p_challenge_id,
    0,
    NULL
  )
  RETURNING * INTO v_challenge_record;

  RETURN v_challenge_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
