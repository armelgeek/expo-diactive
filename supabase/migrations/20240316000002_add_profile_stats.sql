-- Add gamification stats columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_challenges_completed INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_badges_earned INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;

-- Function to get user's gamification stats
CREATE OR REPLACE FUNCTION get_user_gamification_stats(p_user_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'badges', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', b.id,
          'name', b.name,
          'description', b.description,
          'icon_url', b.icon_url,
          'earned_at', ub.earned_at
        )
      )
      FROM public.user_badges ub
      JOIN public.badges b ON b.id = ub.badge_id
      WHERE ub.user_id = p_user_id
      ORDER BY ub.earned_at DESC
    ),
    'challenges', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'title', c.title,
          'description', c.description,
          'progress', uc.progress,
          'goal_value', c.goal_value,
          'completed_at', uc.completed_at,
          'reward_points', c.reward_points
        )
      )
      FROM public.user_challenges uc
      JOIN public.challenges c ON c.id = uc.challenge_id
      WHERE uc.user_id = p_user_id
      ORDER BY uc.completed_at DESC NULLS LAST
    ),
    'stats', (
      SELECT jsonb_build_object(
        'total_challenges_completed', total_challenges_completed,
        'total_badges_earned', total_badges_earned,
        'current_streak', current_streak,
        'best_streak', best_streak,
        'points_balance', points_balance
      )
      FROM public.profiles
      WHERE id = p_user_id
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard(
  p_user_id UUID,
  p_steps_count INTEGER,
  p_period_type TEXT DEFAULT 'daily'
) RETURNS void AS $$
DECLARE
  v_period_date DATE;
  v_points_earned INTEGER;
BEGIN
  -- Calculate period date based on type
  v_period_date := CASE p_period_type
    WHEN 'daily' THEN CURRENT_DATE
    WHEN 'weekly' THEN date_trunc('week', CURRENT_DATE)::DATE
    WHEN 'monthly' THEN date_trunc('month', CURRENT_DATE)::DATE
  END;

  -- Calculate points (1 point per 100 steps)
  v_points_earned := p_steps_count / 100;

  -- Insert or update leaderboard entry
  INSERT INTO public.leaderboard (
    user_id,
    period_type,
    period_date,
    steps_count,
    points_earned
  )
  VALUES (
    p_user_id,
    p_period_type,
    v_period_date,
    p_steps_count,
    v_points_earned
  )
  ON CONFLICT (user_id, period_type, period_date)
  DO UPDATE SET
    steps_count = EXCLUDED.steps_count,
    points_earned = EXCLUDED.points_earned;

  -- Update ranks for the period
  WITH ranked_users AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY steps_count DESC) as new_rank
    FROM public.leaderboard
    WHERE period_type = p_period_type
    AND period_date = v_period_date
  )
  UPDATE public.leaderboard l
  SET rank = r.new_rank
  FROM ranked_users r
  WHERE l.id = r.id
  AND l.period_type = p_period_type
  AND l.period_date = v_period_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile stats on challenge completion
CREATE OR REPLACE FUNCTION update_profile_challenge_stats() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL THEN
    UPDATE public.profiles
    SET total_challenges_completed = total_challenges_completed + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_challenge_stats_update
  AFTER UPDATE ON public.user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_challenge_stats();

-- Trigger to update profile stats on badge earned
CREATE OR REPLACE FUNCTION update_profile_badge_stats() RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_badges_earned = total_badges_earned + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_badge_stats_update
  AFTER INSERT ON public.user_badges
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_badge_stats();
