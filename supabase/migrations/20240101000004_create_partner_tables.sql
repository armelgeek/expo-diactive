-- Table des partenaires
CREATE TABLE IF NOT EXISTS public.partners (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    company_name text NOT NULL,
    description text,
    logo_url text,
    website_url text,
    status text NOT NULL CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Policies pour partners
CREATE POLICY "Les partenaires peuvent voir leur profil"
    ON public.partners FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les partenaires peuvent modifier leur profil"
    ON public.partners FOR UPDATE
    USING (auth.uid() = user_id);

-- Ajouter la colonne partner_id à la table rewards
ALTER TABLE public.rewards
ADD COLUMN partner_id uuid REFERENCES public.partners ON DELETE CASCADE;

-- Mettre à jour les policies de la table rewards
DROP POLICY IF EXISTS "Tout le monde peut voir les récompenses" ON public.rewards;

CREATE POLICY "Les utilisateurs peuvent voir les récompenses actives"
    ON public.rewards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.partners
            WHERE id = rewards.partner_id
            AND status = 'active'
        )
    );

CREATE POLICY "Les partenaires peuvent voir leurs récompenses"
    ON public.rewards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.partners
            WHERE id = partner_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Les partenaires peuvent créer des récompenses"
    ON public.rewards FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.partners
            WHERE id = partner_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

CREATE POLICY "Les partenaires peuvent modifier leurs récompenses"
    ON public.rewards FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.partners
            WHERE id = partner_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

CREATE POLICY "Les partenaires peuvent supprimer leurs récompenses"
    ON public.rewards FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.partners
            WHERE id = partner_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

-- Mettre à jour les policies de reward_orders pour les partenaires
CREATE POLICY "Les partenaires peuvent voir les commandes de leurs récompenses"
    ON public.reward_orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.reward_order_items roi
            JOIN public.rewards r ON r.id = roi.reward_id
            JOIN public.partners p ON p.id = r.partner_id
            WHERE roi.order_id = reward_orders.id
            AND p.user_id = auth.uid()
        )
    );

-- Fonction pour obtenir les statistiques des partenaires
CREATE OR REPLACE FUNCTION public.get_partner_stats(p_partner_id uuid)
RETURNS TABLE (
    total_orders bigint,
    total_points_spent bigint,
    total_items_sold bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ro.id) as total_orders,
        COALESCE(SUM(ro.total_points), 0) as total_points_spent,
        COALESCE(SUM(roi.quantity), 0) as total_items_sold
    FROM public.reward_orders ro
    JOIN public.reward_order_items roi ON roi.order_id = ro.id
    JOIN public.rewards r ON r.id = roi.reward_id
    WHERE r.partner_id = p_partner_id
    AND ro.status = 'completed';
END;
$$;

-- Fonction pour obtenir le classement des récompenses d'un partenaire
CREATE OR REPLACE FUNCTION public.get_partner_reward_ranking(p_partner_id uuid)
RETURNS TABLE (
    reward_id uuid,
    reward_title text,
    total_orders bigint,
    total_items_sold bigint,
    total_points_spent bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as reward_id,
        r.title as reward_title,
        COUNT(DISTINCT ro.id) as total_orders,
        COALESCE(SUM(roi.quantity), 0) as total_items_sold,
        COALESCE(SUM(roi.points_cost * roi.quantity), 0) as total_points_spent
    FROM public.rewards r
    LEFT JOIN public.reward_order_items roi ON roi.reward_id = r.id
    LEFT JOIN public.reward_orders ro ON ro.id = roi.order_id AND ro.status = 'completed'
    WHERE r.partner_id = p_partner_id
    GROUP BY r.id, r.title
    ORDER BY total_items_sold DESC;
END;
$$; 