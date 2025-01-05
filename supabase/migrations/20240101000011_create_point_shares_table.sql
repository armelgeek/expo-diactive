-- Drop existing table if it exists
DROP TABLE IF EXISTS point_shares CASCADE;

-- Create point_shares table
CREATE TABLE point_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL CHECK (points > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE point_shares ENABLE ROW LEVEL SECURITY;

-- Allow users to view their sent and received point shares
CREATE POLICY "Users can view their point shares"
  ON point_shares
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = point_shares.sender_id
    AND auth.uid() = user_id
  ) OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = point_shares.receiver_id
    AND auth.uid() = user_id
  ));

-- Allow users to create point shares
CREATE POLICY "Users can create point shares"
  ON point_shares
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = point_shares.sender_id
    AND auth.uid() = user_id
  ));

-- Allow receivers to update point shares (accept/reject)
CREATE POLICY "Receivers can update point shares"
  ON point_shares
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = point_shares.receiver_id
    AND auth.uid() = user_id
  ))
  WITH CHECK (status IN ('accepted', 'rejected'));

-- Function to handle point share acceptance
CREATE OR REPLACE FUNCTION handle_point_share_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  sender_user_id UUID;
  receiver_user_id UUID;
BEGIN
  -- Get user_ids from profiles
  SELECT user_id INTO sender_user_id FROM profiles WHERE id = OLD.sender_id;
  SELECT user_id INTO receiver_user_id FROM profiles WHERE id = OLD.receiver_id;

  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Déduire les points du sender
    INSERT INTO daily_steps (user_id, date, points_earned)
    VALUES (sender_user_id, CURRENT_DATE, -OLD.points)
    ON CONFLICT (user_id, date) DO UPDATE
    SET points_earned = daily_steps.points_earned - OLD.points;

    -- Ajouter les points au receiver
    INSERT INTO daily_steps (user_id, date, points_earned)
    VALUES (receiver_user_id, CURRENT_DATE, OLD.points)
    ON CONFLICT (user_id, date) DO UPDATE
    SET points_earned = daily_steps.points_earned + OLD.points;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for point share acceptance
CREATE TRIGGER on_point_share_acceptance
  AFTER UPDATE ON point_shares
  FOR EACH ROW
  EXECUTE FUNCTION handle_point_share_acceptance(); 