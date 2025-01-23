-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(50), -- 'steps', 'social', 'donation', etc.
    requirement_type VARCHAR(50), -- 'count', 'streak', 'milestone', etc.
    requirement_value INTEGER, -- The value needed to earn the badge
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archive BOOLEAN DEFAULT FALSE
);

-- Create user_badges table to track earned badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    category VARCHAR(50) NOT NULL, -- 'steps', 'social', 'donation'
    goal_type VARCHAR(50) NOT NULL, -- 'steps_count', 'donation_amount', etc.
    goal_value INTEGER NOT NULL,
    reward_points INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archive BOOLEAN DEFAULT FALSE
);

-- Create user_challenges table to track challenge participation
CREATE TABLE IF NOT EXISTS public.user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    current_value INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- Create leaderboard table for different time periods
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
    period_date DATE NOT NULL, -- The start date of the period
    steps_count INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON public.leaderboard(period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON public.leaderboard(user_id);

-- Add RLS policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Badges policies
CREATE POLICY "Badges are viewable by all authenticated users"
    ON public.badges FOR SELECT
    TO authenticated
    USING (true);

-- User badges policies
CREATE POLICY "Users can view their own badges"
    ON public.user_badges FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Challenges are viewable by all authenticated users"
    ON public.challenges FOR SELECT
    TO authenticated
    USING (true);

-- User challenges policies
CREATE POLICY "Users can view and update their own challenges"
    ON public.user_challenges FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Leaderboard policies
CREATE POLICY "Leaderboard is viewable by all authenticated users"
    ON public.leaderboard FOR SELECT
    TO authenticated
    USING (true);

-- Function to update user badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
BEGIN
    -- Check steps-related badges
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT
        NEW.user_id,
        b.id
    FROM public.badges b
    WHERE b.category = 'steps'
    AND b.requirement_type = 'count'
    AND b.requirement_value <= NEW.steps_count
    AND NOT EXISTS (
        SELECT 1 FROM public.user_badges ub
        WHERE ub.user_id = NEW.user_id AND ub.badge_id = b.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for checking badges after steps validation
CREATE TRIGGER check_badges_after_steps
    AFTER INSERT OR UPDATE ON public.daily_points
    FOR EACH ROW
    EXECUTE FUNCTION check_and_award_badges();

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily leaderboard
    INSERT INTO public.leaderboard (
        user_id,
        period_type,
        period_date,
        steps_count,
        points_earned
    )
    VALUES (
        NEW.user_id,
        'daily',
        NEW.date,
        NEW.steps_count,
        NEW.points
    )
    ON CONFLICT (user_id, period_type, period_date)
    DO UPDATE SET
        steps_count = EXCLUDED.steps_count,
        points_earned = EXCLUDED.points_earned,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating leaderboard after steps validation
CREATE TRIGGER update_leaderboard_after_steps
    AFTER INSERT OR UPDATE ON public.daily_points
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard();
