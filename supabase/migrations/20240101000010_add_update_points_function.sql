-- Fonction pour mettre à jour les points d'un utilisateur
create or replace function public.update_user_points(
  p_user_id uuid,
  p_points_to_deduct integer
)
returns void
language plpgsql
security definer
as $$
declare
  available_points integer;
begin
  -- Récupérer les points disponibles
  select get_available_points(p_user_id) into available_points;

  -- Vérifier si l'utilisateur a assez de points
  if available_points < p_points_to_deduct then
    raise exception 'Points insuffisants. Disponible: %, Requis: %', available_points, p_points_to_deduct;
  end if;

  -- Mettre à jour ou créer l'entrée dans daily_steps
  insert into daily_steps (
    user_id,
    date,
    steps_count,
    points_earned,
    note
  ) values (
    p_user_id,
    current_date,
    0,
    -p_points_to_deduct,
    'Points déduits pour achat'
  )
  on conflict (user_id, date) do update
  set points_earned = daily_steps.points_earned - p_points_to_deduct,
      note = case 
        when daily_steps.note is null then 'Points déduits pour achat'
        else daily_steps.note || ' + Points déduits pour achat'
      end;
end;
$$; 