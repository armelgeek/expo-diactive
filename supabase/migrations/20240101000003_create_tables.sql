-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS public.users (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE,
    full_name text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies pour users
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Table des pas quotidiens
CREATE TABLE IF NOT EXISTS public.daily_steps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    date date DEFAULT CURRENT_DATE,
    steps_count integer NOT NULL CHECK (steps_count >= 0),
    points_earned integer NOT NULL CHECK (points_earned >= 0),
    note text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Activer RLS
ALTER TABLE public.daily_steps ENABLE ROW LEVEL SECURITY;

-- Policies pour daily_steps
CREATE POLICY "Les utilisateurs peuvent voir leurs pas"
    ON public.daily_steps FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent ajouter leurs pas"
    ON public.daily_steps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs pas"
    ON public.daily_steps FOR UPDATE
    USING (auth.uid() = user_id);

-- Table des instituts
CREATE TABLE IF NOT EXISTS public.institutes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    image_url text,
    points_goal integer NOT NULL CHECK (points_goal > 0),
    current_points integer DEFAULT 0 CHECK (current_points >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

-- Policies pour institutes
CREATE POLICY "Tout le monde peut voir les instituts"
    ON public.institutes FOR SELECT
    TO PUBLIC
    USING (true);

-- Table des dons
CREATE TABLE IF NOT EXISTS public.donations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    institute_id uuid REFERENCES public.institutes ON DELETE CASCADE,
    points_amount integer NOT NULL CHECK (points_amount > 0),
    created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policies pour donations
CREATE POLICY "Les utilisateurs peuvent voir leurs dons"
    ON public.donations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent faire des dons"
    ON public.donations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Table des récompenses
CREATE TABLE IF NOT EXISTS public.rewards (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    image_url text,
    points_cost integer NOT NULL CHECK (points_cost > 0),
    stock integer NOT NULL CHECK (stock >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Policies pour rewards
CREATE POLICY "Tout le monde peut voir les récompenses"
    ON public.rewards FOR SELECT
    TO PUBLIC
    USING (true);

-- Table des commandes de récompenses
CREATE TABLE IF NOT EXISTS public.reward_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    total_points integer NOT NULL CHECK (total_points > 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.reward_orders ENABLE ROW LEVEL SECURITY;

-- Policies pour reward_orders
CREATE POLICY "Les utilisateurs peuvent voir leurs commandes"
    ON public.reward_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer des commandes"
    ON public.reward_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs commandes"
    ON public.reward_orders FOR UPDATE
    USING (auth.uid() = user_id);

-- Table des items de commande
CREATE TABLE IF NOT EXISTS public.reward_order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.reward_orders ON DELETE CASCADE,
    reward_id uuid REFERENCES public.rewards ON DELETE CASCADE,
    quantity integer NOT NULL CHECK (quantity > 0),
    points_cost integer NOT NULL CHECK (points_cost > 0),
    created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.reward_order_items ENABLE ROW LEVEL SECURITY;

-- Policies pour reward_order_items
CREATE POLICY "Les utilisateurs peuvent voir leurs items de commande"
    ON public.reward_order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.reward_orders
            WHERE id = reward_order_items.order_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Les utilisateurs peuvent ajouter des items à leurs commandes"
    ON public.reward_order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.reward_orders
            WHERE id = order_id
            AND user_id = auth.uid()
        )
    );

-- Table des contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    full_name text NOT NULL,
    email text,
    phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Activer RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policies pour contacts
CREATE POLICY "Les utilisateurs peuvent voir leurs contacts"
    ON public.contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent ajouter des contacts"
    ON public.contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs contacts"
    ON public.contacts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs contacts"
    ON public.contacts FOR DELETE
    USING (auth.uid() = user_id);

-- Table des invitations de contacts
CREATE TABLE IF NOT EXISTS public.invite_contacts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    email text,
    phone text,
    status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Activer RLS
ALTER TABLE public.invite_contacts ENABLE ROW LEVEL SECURITY;

-- Policies pour invite_contacts
CREATE POLICY "Les utilisateurs peuvent voir leurs invitations"
    ON public.invite_contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer des invitations"
    ON public.invite_contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Table des amis
CREATE TABLE IF NOT EXISTS public.friends (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    friend_id uuid REFERENCES public.users ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, friend_id)
);

-- Activer RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Policies pour friends
CREATE POLICY "Les utilisateurs peuvent voir leurs amis"
    ON public.friends FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent ajouter des amis"
    ON public.friends FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer des amis"
    ON public.friends FOR DELETE
    USING (auth.uid() = user_id);

-- Table des demandes d'amis
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.users ON DELETE CASCADE,
    receiver_id uuid REFERENCES public.users ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(sender_id, receiver_id)
);

-- Activer RLS
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Policies pour friend_requests
CREATE POLICY "Les utilisateurs peuvent voir leurs demandes d'amis"
    ON public.friend_requests FOR SELECT
    USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Les utilisateurs peuvent envoyer des demandes d'amis"
    ON public.friend_requests FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs demandes d'amis"
    ON public.friend_requests FOR UPDATE
    USING (auth.uid() IN (sender_id, receiver_id)); 