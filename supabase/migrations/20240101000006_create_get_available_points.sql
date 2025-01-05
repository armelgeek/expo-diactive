-- Create function to get available points
CREATE OR REPLACE FUNCTION public.get_available_points(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_earned integer;
  total_spent integer;
BEGIN
  -- Calculate total points earned from daily steps
  SELECT COALESCE(SUM(points_earned), 0)
  INTO total_earned
  FROM daily_steps
  WHERE user_id = p_user_id;

  -- Calculate total points spent on rewards and donations
  SELECT COALESCE(SUM(total_points), 0)
  INTO total_spent
  FROM reward_orders
  WHERE user_id = p_user_id
  AND status IN ('pending', 'confirmed', 'completed');

  -- Add points spent on donations
  total_spent := total_spent + (
    SELECT COALESCE(SUM(points_amount), 0)
    FROM donations
    WHERE user_id = p_user_id
  );

  -- Return available points
  RETURN total_earned - total_spent;
END;
$$;

-- Update has_enough_points to use daily_steps instead of user_points
CREATE OR REPLACE FUNCTION public.has_enough_points(p_user_id uuid, required_points integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    available_points integer;
BEGIN
    -- Get available points
    SELECT * INTO available_points
    FROM get_available_points(p_user_id);

    -- Return true if user has enough points
    RETURN available_points >= required_points;
END;
$$; 