-- Créer la table des utilisateurs
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table des partenaires
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table des récompenses
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    points_cost INT NOT NULL,
    stock INT NOT NULL,
    image_url TEXT,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table des commandes
CREATE TABLE reward_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_points INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Créer la table des items de commande
CREATE TABLE reward_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES reward_orders(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    points_cost INT NOT NULL
);

-- Créer la table des partages de points
CREATE TABLE point_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    points INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table des catégories de partenaires
CREATE TABLE partner_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL
);

-- Créer la table de liaison entre partenaires et catégories
CREATE TABLE partner_category_link (
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    category_id UUID REFERENCES partner_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (partner_id, category_id)
);


   ALTER TABLE orders
   DROP CONSTRAINT orders_status_check;

   ALTER TABLE orders
   ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'validated', 'completed', 'cancelled'));