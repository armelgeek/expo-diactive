-- Trigger pour mettre à jour les points actuels d'un institut après un don
CREATE OR REPLACE FUNCTION public.update_institute_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE institutes
    SET current_points = current_points + NEW.points_amount
    WHERE id = NEW.institute_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_donation_insert
    AFTER INSERT ON donations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_institute_points();

-- Trigger pour mettre à jour le stock des récompenses après une commande
CREATE OR REPLACE FUNCTION public.update_reward_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si la commande est complétée
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Mettre à jour le stock pour chaque item de la commande
        UPDATE rewards r
        SET stock = r.stock - roi.quantity
        FROM reward_order_items roi
        WHERE roi.order_id = NEW.id
        AND roi.reward_id = r.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_reward_order_update
    AFTER UPDATE ON reward_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_reward_stock();

-- Trigger pour vérifier le stock avant d'ajouter un item à la commande
CREATE OR REPLACE FUNCTION public.check_reward_stock()
RETURNS TRIGGER AS $$
DECLARE
    available_stock integer;
BEGIN
    -- Récupérer le stock disponible
    SELECT stock INTO available_stock
    FROM rewards
    WHERE id = NEW.reward_id;

    -- Vérifier si le stock est suffisant
    IF available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Stock insuffisant pour la récompense (ID: %)', NEW.reward_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_reward_order_item_insert
    BEFORE INSERT ON reward_order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.check_reward_stock();

-- Trigger pour vérifier les points avant de finaliser une commande
CREATE OR REPLACE FUNCTION public.check_points_before_order()
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

CREATE TRIGGER before_reward_order_update
    BEFORE UPDATE ON reward_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.check_points_before_order();

-- Trigger pour vérifier les points avant un don
CREATE OR REPLACE FUNCTION public.check_points_before_donation()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM has_enough_points(p_user_id := NEW.user_id, required_points := NEW.points_amount)
        WHERE has_enough_points = true
    ) THEN
        RAISE EXCEPTION 'Points insuffisants';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_donation_insert
    BEFORE INSERT ON donations
    FOR EACH ROW
    EXECUTE FUNCTION public.check_points_before_donation();

-- Trigger pour vérifier qu'un contact a au moins un moyen de contact
CREATE OR REPLACE FUNCTION public.check_contact_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email IS NULL AND NEW.phone IS NULL THEN
        RAISE EXCEPTION 'Un contact doit avoir au moins une méthode de contact (email ou téléphone)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_contact_insert_update
    BEFORE INSERT OR UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.check_contact_method();

-- Même vérification pour les invitations
CREATE TRIGGER before_invite_contact_insert_update
    BEFORE INSERT OR UPDATE ON invite_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.check_contact_method(); 