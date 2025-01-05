-- Drop existing function if it exists
drop function if exists public.get_top_rewards(integer, uuid);

-- Create function to get top rewards
create or replace function public.get_top_rewards(p_limit integer, p_partner_id uuid)
returns json as $$
begin
  return (
    select coalesce(
      json_agg(reward),
      '[]'::json
    )
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