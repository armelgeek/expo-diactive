-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id uuid REFERENCES public.partners ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    image_url text,
    price integer NOT NULL CHECK (price >= 0),
    stock integer NOT NULL CHECK (stock >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create product orders table
CREATE TABLE IF NOT EXISTS public.product_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    total_points integer NOT NULL CHECK (total_points >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create product order items table
CREATE TABLE IF NOT EXISTS public.product_order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.product_orders ON DELETE CASCADE,
    product_id uuid REFERENCES public.products ON DELETE CASCADE,
    quantity integer NOT NULL CHECK (quantity > 0),
    points_cost integer NOT NULL CHECK (points_cost >= 0),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_order_items ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Anyone can view products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Partners can manage their own products"
    ON public.products FOR ALL
    USING (auth.uid() IN (
        SELECT user_id FROM partners WHERE id = partner_id
    ));

-- Policies for product orders
CREATE POLICY "Users can view their own orders"
    ON public.product_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
    ON public.product_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
    ON public.product_orders FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for product order items
CREATE POLICY "Users can view their order items"
    ON public.product_order_items FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM product_orders WHERE id = order_id
        )
    );

CREATE POLICY "Users can create order items"
    ON public.product_order_items FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM product_orders WHERE id = order_id
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.set_timestamp();

CREATE TRIGGER set_timestamp_product_orders
    BEFORE UPDATE ON public.product_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_timestamp();

-- Create function to check points before completing product order
CREATE OR REPLACE FUNCTION public.check_points_before_product_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier les points uniquement lors de la finalisation de la commande
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        IF NOT EXISTS (
            SELECT 1
            FROM has_enough_points(p_user_id := NEW.user_id, required_points := NEW.total_points)
            WHERE has_enough_points = true
        ) THEN
            RAISE EXCEPTION 'Points insuffisants';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check points before completing order
CREATE TRIGGER before_product_order_update
    BEFORE UPDATE ON public.product_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.check_points_before_product_order();

-- Create trigger to update product stock
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si la commande est complétée
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Mettre à jour le stock pour chaque item de la commande
        UPDATE products p
        SET stock = p.stock - poi.quantity
        FROM product_order_items poi
        WHERE poi.order_id = NEW.id
        AND poi.product_id = p.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_product_order_update
    AFTER UPDATE ON public.product_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_product_stock();

-- Create trigger to check stock before adding item
CREATE OR REPLACE FUNCTION public.check_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    available_stock integer;
BEGIN
    -- Récupérer le stock disponible
    SELECT stock INTO available_stock
    FROM products
    WHERE id = NEW.product_id;

    -- Vérifier si le stock est suffisant
    IF available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Stock insuffisant pour le produit (ID: %)', NEW.product_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_product_order_item_insert
    BEFORE INSERT ON public.product_order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.check_product_stock(); 