-- Fonction pour obtenir les statistiques d'un partenaire
create or replace function public.get_partner_stats(p_partner_id uuid)
returns json as $$
declare
  v_stats json;
begin
  select json_build_object(
    'totalOrders', count(distinct ro.id),
    'totalItemsSold', sum(roi.quantity),
    'totalPointsUsed', sum(roi.points_cost * roi.quantity)
  )
  into v_stats
  from reward_orders ro
  join reward_order_items roi on roi.order_id = ro.id
  join rewards r on r.id = roi.reward_id
  where r.partner_id = p_partner_id;

  return v_stats;
end;
$$ language plpgsql security definer;

-- Fonction pour obtenir le top des récompenses d'un partenaire
create or replace function public.get_top_rewards(p_partner_id uuid, p_limit int default 5)
returns table (
  id uuid,
  title text,
  total_orders bigint,
  total_points bigint
) as $$
begin
  return query
  select
    r.id,
    r.title,
    count(distinct roi.order_id) as total_orders,
    sum(roi.points_cost * roi.quantity) as total_points
  from rewards r
  left join reward_order_items roi on roi.reward_id = r.id
  where r.partner_id = p_partner_id
  group by r.id, r.title
  order by total_orders desc, total_points desc
  limit p_limit;
end;
$$ language plpgsql security definer;

-- Fonction pour obtenir les commandes d'un partenaire
create or replace function public.get_partner_orders(p_partner_id uuid)
returns table (
  order_id uuid,
  created_at timestamp with time zone,
  user_id uuid,
  user_email text,
  user_full_name text,
  total_points bigint,
  items json
) as $$
begin
  return query
  select
    ro.id as order_id,
    ro.created_at,
    ro.user_id,
    u.email as user_email,
    u.raw_user_meta_data->>'full_name' as user_full_name,
    sum(roi.points_cost * roi.quantity) as total_points,
    json_agg(json_build_object(
      'id', roi.id,
      'reward_id', r.id,
      'reward_title', r.title,
      'quantity', roi.quantity,
      'points_cost', roi.points_cost
    )) as items
  from reward_orders ro
  join reward_order_items roi on roi.order_id = ro.id
  join rewards r on r.id = roi.reward_id
  join auth.users u on u.id = ro.user_id
  where r.partner_id = p_partner_id
  group by ro.id, ro.created_at, ro.user_id, u.email, u.raw_user_meta_data->>'full_name'
  order by ro.created_at desc;
end;
$$ language plpgsql security definer; 