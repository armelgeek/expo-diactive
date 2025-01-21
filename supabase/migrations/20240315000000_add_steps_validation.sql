-- Add validation columns to daily_points table
ALTER TABLE public.daily_points
ADD COLUMN IF NOT EXISTS validated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_validated boolean DEFAULT false;

-- Create function to automatically invalidate points if not validated
CREATE OR REPLACE FUNCTION invalidate_unvalidated_points()
RETURNS trigger AS $$
BEGIN
    -- Si les points n'ont pas été validés à minuit, les mettre à 0
    UPDATE daily_points
    SET points = 0,
        steps_count = 0
    WHERE date < CURRENT_DATE
    AND is_validated = false;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run at midnight
CREATE OR REPLACE TRIGGER daily_points_invalidation
    AFTER INSERT OR UPDATE ON daily_points
    FOR EACH STATEMENT
    EXECUTE FUNCTION invalidate_unvalidated_points();
