-- Create command_items table
CREATE TABLE command_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commande_id UUID REFERENCES commande(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES reward(id),
    product_id UUID REFERENCES product(id),
    quantite INTEGER NOT NULL,
    point_cost INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archive BOOLEAN DEFAULT FALSE,
    CONSTRAINT item_type_check CHECK (
        (reward_id IS NOT NULL AND product_id IS NULL) OR
        (product_id IS NOT NULL AND reward_id IS NULL)
    )
);

-- Add updated_at trigger
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON command_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Add indexes for better performance
CREATE INDEX idx_command_items_commande_id ON command_items(commande_id);
CREATE INDEX idx_command_items_reward_id ON command_items(reward_id);
CREATE INDEX idx_command_items_product_id ON command_items(product_id);

-- Add RLS policies
ALTER TABLE command_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own command items"
    ON command_items FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM commande WHERE id = commande_id
        )
    );

CREATE POLICY "Partners can view their command items"
    ON command_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM commande c
            JOIN profile_partner pp ON c.partner_id = pp.partner_id
            WHERE c.id = commande_id
            AND pp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all command items"
    ON command_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profile
            WHERE user_id = auth.uid()
            AND is_admin = true
        )
    );

CREATE POLICY "Users can create command items"
    ON command_items FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM commande WHERE id = commande_id
        )
    );

CREATE POLICY "Partners can update their command items"
    ON command_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM commande c
            JOIN profile_partner pp ON c.partner_id = pp.partner_id
            WHERE c.id = commande_id
            AND pp.user_id = auth.uid()
        )
    );

-- Add comment for documentation
COMMENT ON TABLE command_items IS 'Items in a command, can be either a reward or a product';
