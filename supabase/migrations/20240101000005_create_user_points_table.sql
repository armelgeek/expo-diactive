-- Create user points table
CREATE TABLE IF NOT EXISTS public.user_points (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    points integer NOT NULL CHECK (points >= 0),
    status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    source text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- Policies for user_points
CREATE POLICY "Users can view their own points"
    ON public.user_points FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add points to their account"
    ON public.user_points FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER set_timestamp_user_points
    BEFORE UPDATE ON public.user_points
    FOR EACH ROW
    EXECUTE FUNCTION public.set_timestamp();

-- Create function to add points from daily steps
CREATE OR REPLACE FUNCTION public.add_points_from_steps()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert points record when daily steps are added
    INSERT INTO public.user_points (user_id, points, status, source)
    VALUES (NEW.user_id, NEW.points_earned, 'confirmed', 'daily_steps');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add points when daily steps are added
CREATE TRIGGER after_daily_steps_insert
    AFTER INSERT ON public.daily_steps
    FOR EACH ROW
    EXECUTE FUNCTION public.add_points_from_steps(); 