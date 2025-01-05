-- Drop existing functions
drop function if exists public.get_partner_stats(uuid);
drop function if exists public.get_top_rewards(integer, uuid);

-- Create function to get partner statistics
create or replace function public.get_partner_stats(p_partner_id uuid)
returns json as $$
declare
  total_orders integer;
  total_items integer;
  total_points integer;
  best_rewards json;
begin
  -- Get total orders count
  select count(distinct roi.order_id)
  into total_orders
  from public.reward_order_items roi
  join public.rewards r on r.id = roi.reward_id
  where r.partner_id = p_partner_id
  and exists (
    select 1 
    from public.reward_orders ro 
    where ro.id = roi.order_id 
    and ro.status = 'completed'
  );

  -- Get total items sold
  select coalesce(sum(roi.quantity), 0)
  into total_items
  from public.reward_order_items roi
  join public.rewards r on r.id = roi.reward_id
  join public.reward_orders ro on ro.id = roi.order_id
  where r.partner_id = p_partner_id
  and ro.status = 'completed';

  -- Get total points earned
  select coalesce(sum(roi.points_cost * roi.quantity), 0)
  into total_points
  from public.reward_order_items roi
  join public.rewards r on r.id = roi.reward_id
  join public.reward_orders ro on ro.id = roi.order_id
  where r.partner_id = p_partner_id
  and ro.status = 'completed';

  -- Get top 5 best-selling rewards
  select json_agg(reward)
  into best_rewards
  from (
    select 
      r.id,
      r.title,
      r.image_url,
      sum(roi.quantity) as total_sold,
      sum(roi.points_cost * roi.quantity) as total_points
    from public.rewards r
    left join public.reward_order_items roi on roi.reward_id = r.id
    left join public.reward_orders ro on ro.id = roi.order_id
    where r.partner_id = p_partner_id
    and (ro.status = 'completed' or ro.status is null)
    group by r.id, r.title, r.image_url
    order by total_sold desc nulls last
    limit 5
  ) reward;

  -- Return statistics as JSON
  return json_build_object(
    'total_orders', total_orders,
    'total_items', total_items,
    'total_points', total_points,
    'best_rewards', coalesce(best_rewards, '[]'::json)
  );
end;
$$ language plpgsql security definer;

-- Create function to get top rewards
create or replace function public.get_top_rewards(p_limit integer, p_partner_id uuid)
returns json as $$
begin
  return (
    select json_agg(reward)
    from (
      select 
        r.id,
        r.title,
        r.description,
        r.image_url,
        r.points_cost,
        r.stock,
        coalesce(sum(roi.quantity), 0) as total_sold,
        coalesce(sum(roi.points_cost * roi.quantity), 0) as total_points
      from public.rewards r
      left join public.reward_order_items roi on roi.reward_id = r.id
      left join public.reward_orders ro on ro.id = roi.order_id and ro.status = 'completed'
      where r.partner_id = p_partner_id
      group by r.id, r.title, r.description, r.image_url, r.points_cost, r.stock
      order by total_sold desc nulls last, r.created_at desc
      limit p_limit
    ) reward
  );
end;
$$ language plpgsql security definer; 