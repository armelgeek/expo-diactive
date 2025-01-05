-- Fonction pour vérifier si un utilisateur a assez de points
CREATE OR REPLACE FUNCTION public.has_enough_points(p_user_id uuid, required_points integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    available_points integer;
BEGIN
    -- Calculer les points disponibles
    SELECT COALESCE(
        (
            -- Points gagnés des pas quotidiens
            SELECT COALESCE(SUM(points), 0)
            FROM user_points
            WHERE user_id = p_user_id
            AND status = 'confirmed'
        ) - (
            -- Points dépensés en récompenses
            SELECT COALESCE(SUM(total_points), 0)
            FROM reward_orders
            WHERE user_id = p_user_id
            AND status IN ('pending', 'confirmed', 'completed')
        ),
        0
    ) INTO available_points;

    -- Retourner vrai si l'utilisateur a assez de points
    RETURN available_points >= required_points;
END;
$$;

-- Calculate user points
CREATE OR REPLACE FUNCTION get_user_points(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_earned integer;
  total_spent integer;
BEGIN
  -- Calculate total points earned
  SELECT COALESCE(SUM(points), 0)
  INTO total_earned
  FROM user_points
  WHERE user_id = p_user_id
    AND status = 'confirmed';

  -- Calculate total points spent
  SELECT COALESCE(SUM(total_points), 0)
  INTO total_spent
  FROM reward_orders
  WHERE user_id = p_user_id
    AND status IN ('pending', 'confirmed', 'completed');

  -- Return available points
  RETURN total_earned - total_spent;
END;
$$; 