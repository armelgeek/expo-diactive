-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error'
    action_link TEXT, -- Lien optionnel pour une action
    action_data JSONB, -- Données supplémentaires pour l'action
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archive BOOLEAN DEFAULT FALSE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS notifications_read_at_idx ON public.notifications(read_at);

-- Add RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type VARCHAR(50),
    p_action_link TEXT DEFAULT NULL,
    p_action_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        action_link,
        action_data
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_action_link,
        p_action_data
    )
    RETURNING id INTO v_notification_id;

    -- Notify through Postgres channel
    PERFORM pg_notify(
        'new_notification',
        json_build_object(
            'notification_id', v_notification_id,
            'user_id', p_user_id
        )::text
    );

    RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
    p_notification_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET read_at = NOW()
    WHERE id = p_notification_id
    AND user_id = auth.uid()
    AND read_at IS NULL;

    RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.notifications
    SET read_at = NOW()
    WHERE user_id = p_user_id
    AND read_at IS NULL
    RETURNING COUNT(*) INTO v_count;

    RETURN v_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
