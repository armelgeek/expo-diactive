-- Table des récompenses disponibles
create table public.rewards (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  points_cost int not null,
  image_url text,
  available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),

  constraint positive_cost check (points_cost > 0)
);

-- Table des récompenses obtenues par les utilisateurs
create table public.user_rewards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  reward_id uuid references public.rewards not null,
  redeemed_at timestamp with time zone default timezone('utc'::text, now()),
  status text check (status in ('pending', 'completed', 'cancelled')) default 'pending'
);

-- Policies pour rewards
alter table public.rewards enable row level security;

create policy "Les récompenses sont visibles par tous"
  on rewards for select
  using ( true );

-- Policies pour user_rewards
alter table public.user_rewards enable row level security;

create policy "Les utilisateurs peuvent voir leurs récompenses"
  on user_rewards for select
  using ( auth.uid() = user_id );

create policy "Les utilisateurs peuvent échanger des points"
  on user_rewards for insert
  with check ( auth.uid() = user_id );

-- Table des relations d'amitié
create table public.friendships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  friend_id uuid references auth.users not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  constraint different_users check (user_id != friend_id),
  unique(user_id, friend_id)
);

-- Table des partages de points
create table public.point_shares (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users not null,
  receiver_id uuid references auth.users not null,
  points_amount int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),

  constraint positive_points check (points_amount > 0),
  constraint different_users check (sender_id != receiver_id)
);

-- Policies pour friendships
alter table public.friendships enable row level security;

create policy "Les utilisateurs peuvent voir leurs amitiés"
  on friendships for select
  using ( auth.uid() in (user_id, friend_id) );

create policy "Les utilisateurs peuvent créer des demandes d'amitié"
  on friendships for insert
  with check ( auth.uid() = user_id );

create policy "Les utilisateurs peuvent mettre à jour leurs amitiés"
  on friendships for update
  using ( auth.uid() in (user_id, friend_id) );

-- Policies pour point_shares
alter table public.point_shares enable row level security;

create policy "Les utilisateurs peuvent voir leurs partages"
  on point_shares for select
  using ( auth.uid() in (sender_id, receiver_id) );

create policy "Les utilisateurs peuvent partager leurs points"
  on point_shares for insert
  with check ( auth.uid() = sender_id );

-- Table des partenaires
create table public.partners (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  business_name text not null,
  description text,
  address text,
  phone text,
  email text,
  logo_url text,
  category text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),

  unique(business_name)
);

-- Table des commandes
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  partner_id uuid references public.partners not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  total_points int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  constraint positive_points check (total_points > 0)
);

-- Policies pour partners
alter table public.partners enable row level security;

create policy "Les partenaires sont visibles par tous"
  on partners for select
  using ( true );

create policy "Les partenaires peuvent modifier leurs informations"
  on partners for update
  using ( auth.uid() = user_id );

-- Policies pour orders
alter table public.orders enable row level security;

create policy "Les utilisateurs peuvent voir leurs commandes"
  on orders for select
  using ( auth.uid() = user_id );

create policy "Les partenaires peuvent voir leurs commandes"
  on orders for select
  using ( 
    auth.uid() in (
      select user_id from partners where id = partner_id
    )
  );

create policy "Les utilisateurs peuvent créer des commandes"
  on orders for insert
  with check ( auth.uid() = user_id );

create policy "Les partenaires peuvent mettre à jour les commandes"
  on orders for update
  using ( 
    auth.uid() in (
      select user_id from partners where id = partner_id
    )
  );

-- Table des avis
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  partner_id uuid references public.partners not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table des réponses aux avis
create table public.review_responses (
  id uuid default uuid_generate_v4() primary key,
  review_id uuid references public.reviews not null,
  partner_id uuid references public.partners not null,
  response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  unique(review_id)
);

-- Policies pour reviews
alter table public.reviews enable row level security;

create policy "Les avis sont visibles par tous"
  on reviews for select
  using ( true );

create policy "Les utilisateurs peuvent créer leurs avis"
  on reviews for insert
  with check ( auth.uid() = user_id );

create policy "Les utilisateurs peuvent modifier leurs avis"
  on reviews for update
  using ( auth.uid() = user_id );

-- Policies pour review_responses
alter table public.review_responses enable row level security;

create policy "Les réponses sont visibles par tous"
  on review_responses for select
  using ( true );

create policy "Les partenaires peuvent répondre aux avis"
  on review_responses for insert
  with check ( 
    auth.uid() in (
      select user_id from partners where id = partner_id
    )
  );

create policy "Les partenaires peuvent modifier leurs réponses"
  on review_responses for update
  using ( 
    auth.uid() in (
      select user_id from partners where id = partner_id
    )
  );

-- Table des produits
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  partner_id uuid references public.partners not null,
  title text not null,
  description text,
  points_price int not null,
  image_url text,
  category text,
  available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),

  constraint positive_price check (points_price > 0)
);

-- Table des catégories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table des notifications de commande
create table public.order_notifications (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders not null,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Policies pour products
alter table public.products enable row level security;

create policy "Les produits sont visibles par tous"
  on products for select
  using ( true );

create policy "Les partenaires peuvent gérer leurs produits"
  on products for all
  using ( 
    auth.uid() in (
      select user_id from partners where id = partner_id
    )
  );

-- Policies pour categories
alter table public.categories enable row level security;

create policy "Les catégories sont visibles par tous"
  on categories for select
  using ( true );

-- Policies pour order_notifications
alter table public.order_notifications enable row level security;

create policy "Les utilisateurs voient leurs notifications"
  on order_notifications for select
  using ( auth.uid() = user_id );

create policy "Les utilisateurs peuvent marquer comme lu"
  on order_notifications for update
  using ( auth.uid() = user_id );





-- Création de la table daily_steps
create table daily_steps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  steps_count integer not null default 0,
  points_earned integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Contrainte unique pour éviter les doublons par utilisateur et par jour
  constraint unique_user_date unique (user_id, date)
);

-- Politique RLS pour la sécurité
alter table daily_steps enable row level security;

-- Politique pour permettre aux utilisateurs de voir uniquement leurs propres données
create policy "Users can view their own steps"
  on daily_steps for select
  using (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'insérer leurs propres données
create policy "Users can insert their own steps"
  on daily_steps for insert
  with check (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres données
create policy "Users can update their own steps"
  on daily_steps for update
  using (auth.uid() = user_id);

-- Trigger pour mettre à jour le timestamp updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_daily_steps_updated_at
  before update on daily_steps
  for each row
  execute function update_updated_at_column();







-- Supprimer la table existante si elle existe
drop table if exists public.reward_orders;
drop table if exists public.rewards;

-- Recréer la table des récompenses avec la colonne stock
create table public.rewards (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    image_url text,
    points_cost integer not null check (points_cost > 0),
    stock integer not null default 0 check (stock >= 0),
    available boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table des commandes de récompenses
create table public.reward_orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    reward_id uuid references rewards not null,
    quantity integer not null check (quantity > 0),
    total_points integer not null check (total_points > 0),
    status text not null check (status in ('pending', 'confirmed', 'cancelled', 'delivered')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Fonction pour mettre à jour le stock
create or replace function update_reward_stock(p_reward_id uuid, p_quantity integer)
returns void as $$
begin
    update rewards
    set stock = stock - p_quantity
    where id = p_reward_id
    and stock >= p_quantity;
    
    if not found then
        raise exception 'Stock insuffisant';
    end if;
end;
$$ language plpgsql;

-- Activer RLS
alter table rewards enable row level security;
alter table reward_orders enable row level security;

-- Politiques RLS
create policy "Les récompenses sont visibles par tous les utilisateurs authentifiés"
    on rewards for select
    to authenticated
    using (true);

create policy "Les utilisateurs peuvent voir leurs propres commandes"
    on reward_orders for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent créer leurs propres commandes"
    on reward_orders for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Insérer des récompenses d'exemple
insert into rewards (title, description, points_cost, stock, available) values
    ('Bon d''achat 10€', 'Bon d''achat utilisable chez nos partenaires', 1000, 100, true),
    ('Bon d''achat 20€', 'Bon d''achat utilisable chez nos partenaires', 2000, 100, true),
    ('Bon d''achat 50€', 'Bon d''achat utilisable chez nos partenaires', 5000, 50, true),
    ('T-shirt eco-friendly', 'T-shirt 100% coton bio', 1500, 30, true),
    ('Gourde réutilisable', 'Gourde écologique en acier inoxydable', 800, 50, true);







-- Table des catégories
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    icon text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table des partenaires
create table public.partners (
    id uuid default uuid_generate_v4() primary key,
    business_name text not null,
    description text,
    logo_url text,
    category text references categories(name) not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table des avis
create table public.reviews (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    partner_id uuid references partners not null,
    rating integer not null check (rating between 1 and 5),
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer RLS
alter table categories enable row level security;
alter table partners enable row level security;
alter table reviews enable row level security;

-- Politiques RLS
create policy "Les catégories sont visibles par tous les utilisateurs authentifiés"
    on categories for select
    to authenticated
    using (true);

create policy "Les partenaires actifs sont visibles par tous les utilisateurs authentifiés"
    on partners for select
    to authenticated
    using (is_active = true);

create policy "Les avis sont visibles par tous les utilisateurs authentifiés"
    on reviews for select
    to authenticated
    using (true);

create policy "Les utilisateurs peuvent créer leurs propres avis"
    on reviews for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Insérer des catégories d'exemple
insert into categories (name, icon) values
    ('Restaurants', 'restaurant'),
    ('Sport', 'fitness-center'),
    ('Shopping', 'shopping-cart'),
    ('Bien-être', 'spa'),
    ('Loisirs', 'local-activity');

-- Insérer des partenaires d'exemple
insert into partners (business_name, description, category) values
    ('Restaurant Bio', 'Restaurant bio et local', 'Restaurants'),
    ('FitClub', 'Salle de sport premium', 'Sport'),
    ('Green Market', 'Supermarché bio', 'Shopping'),
    ('Zen Spa', 'Centre de bien-être', 'Bien-être'),
    ('Fun Park', 'Parc d''attractions', 'Loisirs');





-- Modifier la table institutes pour ajouter l'objectif de points
alter table public.institutes 
add column points_goal integer not null default 10000 check (points_goal > 0),
add column current_points integer not null default 0 check (current_points >= 0);

-- Fonction pour mettre à jour les points actuels d'un institut
create or replace function update_institute_points()
returns trigger as $$
begin
    update institutes
    set current_points = current_points + NEW.points_amount
    where id = NEW.institute_id;
    return NEW;
end;
$$ language plpgsql;

-- Trigger pour mettre à jour automatiquement les points de l'institut
create trigger after_donation_insert
    after insert on donations
    for each row
    execute function update_institute_points();

-- Mettre à jour les instituts existants avec des objectifs
update institutes set 
    points_goal = case name
        when 'Croix-Rouge française' then 100000
        when 'Restos du Cœur' then 75000
        when 'Médecins Sans Frontières' then 150000
        else 50000
    end;



-- Ajouter la colonne pour les points cumulés
alter table auth.users 
add column if not exists cumulative_points integer not null default 0;

-- Mettre à jour les points cumulés avec la somme des points actuels et des points déjà dépensés
update auth.users u
set cumulative_points = (
    select coalesce(sum(s.steps_count), 0)
    from public.daily_steps s
    where s.user_id = u.id
);

-- Créer une fonction pour mettre à jour les points cumulés
create or replace function update_cumulative_points()
returns trigger as $$
begin
    update auth.users
    set cumulative_points = cumulative_points + NEW.steps_count
    where id = NEW.user_id;
    return NEW;
end;
$$ language plpgsql;

-- Créer un trigger pour mettre à jour automatiquement les points cumulés
create trigger after_steps_insert
    after insert on public.daily_steps
    for each row
    execute function update_cumulative_points();





-- Table pour gérer les relations d'amitié
create table public.friendships (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    friend_id uuid references auth.users not null,
    status text check (status in ('pending', 'accepted')) not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Empêcher les doublons
    unique(user_id, friend_id),
    -- Empêcher de s'ajouter soi-même
    constraint no_self_friendship check (user_id != friend_id)
);

-- Trigger pour mettre à jour updated_at
create trigger set_friendships_updated_at
    before update on public.friendships
    for each row
    execute function public.set_current_timestamp_updated_at();

-- Policies de sécurité
alter table public.friendships enable row level security;

create policy "Les utilisateurs peuvent voir leurs amitiés"
    on public.friendships for select
    using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Les utilisateurs peuvent créer des demandes d'amitié"
    on public.friendships for insert
    with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent accepter/refuser les demandes"
    on public.friendships for update
    using (auth.uid() = friend_id)
    with check (status = 'accepted');

create policy "Les utilisateurs peuvent supprimer leurs amitiés"
    on public.friendships for delete
    using (auth.uid() = user_id or auth.uid() = friend_id);







-- Table des récompenses
create table if not exists public.rewards (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    points_cost integer not null check (points_cost > 0),
    stock integer not null default 0 check (stock >= 0),
    image_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Table des commandes de récompenses
create table if not exists public.reward_orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    status text not null check (status in ('pending', 'completed', 'cancelled')) default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Table des items de commande
create table if not exists public.reward_order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid references reward_orders not null,
    reward_id uuid references rewards not null,
    quantity integer not null check (quantity > 0),
    points_cost integer not null check (points_cost > 0),
    created_at timestamptz not null default now()
);

-- Activer RLS sur toutes les tables
alter table public.rewards enable row level security;
alter table public.reward_orders enable row level security;
alter table public.reward_order_items enable row level security;

-- Policies pour rewards
create policy "Tout le monde peut voir les récompenses"
    on public.rewards for select
    to authenticated
    using (true);

-- Policies pour reward_orders
create policy "Les utilisateurs peuvent voir leurs commandes"
    on public.reward_orders for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent créer leurs commandes"
    on public.reward_orders for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policies pour reward_order_items
create policy "Les utilisateurs peuvent voir leurs items de commande"
    on public.reward_order_items for select
    to authenticated
    using (
        exists (
            select 1 from reward_orders
            where reward_orders.id = reward_order_items.order_id
            and reward_orders.user_id = auth.uid()
        )
    );

create policy "Les utilisateurs peuvent créer leurs items de commande"
    on public.reward_order_items for insert
    to authenticated
    with check (
        exists (
            select 1 from reward_orders
            where reward_orders.id = reward_order_items.order_id
            and reward_orders.user_id = auth.uid()
        )
    );

-- Trigger pour mettre à jour le stock lors d'une commande
create or replace function update_reward_stock()
returns trigger as $$
begin
    update rewards
    set stock = stock - NEW.quantity
    where id = NEW.reward_id;
    return NEW;
end;
$$ language plpgsql;

create trigger after_order_item_insert
    after insert on reward_order_items
    for each row
    execute function update_reward_stock();

-- Trigger pour mettre à jour updated_at
create trigger set_rewards_updated_at
    before update on rewards
    for each row
    execute function public.set_current_timestamp_updated_at();

create trigger set_reward_orders_updated_at
    before update on reward_orders
    for each row
    execute function public.set_current_timestamp_updated_at();

-- Donner les permissions nécessaires
grant usage on schema public to anon, authenticated;
grant all on public.rewards to anon, authenticated;
grant all on public.reward_orders to anon, authenticated;
grant all on public.reward_order_items to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Mettre à jour la fonction calculate_spent_points pour utiliser les bonnes tables
create or replace function public.calculate_spent_points(user_id uuid)
returns integer
as $$
declare
    total_spent integer;
begin
    -- Points dépensés en dons
    select coalesce(sum(points_amount), 0) into total_spent
    from donations
    where donations.user_id = calculate_spent_points.user_id;

    -- Ajouter les points dépensés en récompenses
    total_spent := total_spent + (
        select coalesce(sum(roi.points_cost * roi.quantity), 0)
        from reward_orders ro
        join reward_order_items roi on roi.order_id = ro.id
        where ro.user_id = calculate_spent_points.user_id
        and ro.status != 'cancelled'
    );
    
    return total_spent;
end;
$$ language plpgsql stable security definer;





-- Créer la table profiles
create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    full_name text,
    email text unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Activer RLS sur la table profiles
alter table public.profiles enable row level security;

-- Policies pour profiles
create policy "Les profils sont visibles par tous les utilisateurs authentifiés"
    on public.profiles for select
    to authenticated
    using (true);

create policy "Les utilisateurs peuvent modifier leur propre profil"
    on public.profiles for update
    using (auth.uid() = id);

-- Trigger pour mettre à jour updated_at
create trigger set_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.set_current_timestamp_updated_at();

-- Trigger pour créer automatiquement un profil lors de l'inscription
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
    insert into public.profiles (id, email)
    values (new.id, new.email);
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_profile
    after insert on auth.users
    for each row
    execute function public.handle_new_user_profile();

-- Recréer la table friendships avec les bonnes relations
drop table if exists public.friendships;
create table public.friendships (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    friend_id uuid not null references public.profiles(id) on delete cascade,
    status text not null check (status in ('pending', 'accepted')) default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    constraint no_self_friendship check (user_id != friend_id),
    unique(user_id, friend_id)
);

-- Activer RLS sur friendships
alter table public.friendships enable row level security;

-- Policies pour friendships
create policy "Les utilisateurs peuvent voir leurs amitiés"
    on public.friendships for select
    using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Les utilisateurs peuvent créer des demandes d'amitié"
    on public.friendships for insert
    with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent accepter/refuser les demandes"
    on public.friendships for update
    using (auth.uid() = friend_id)
    with check (status = 'accepted');

create policy "Les utilisateurs peuvent supprimer leurs amitiés"
    on public.friendships for delete
    using (auth.uid() = user_id or auth.uid() = friend_id);

-- Trigger pour mettre à jour updated_at
create trigger set_friendships_updated_at
    before update on public.friendships
    for each row
    execute function public.set_current_timestamp_updated_at();

-- Créer des profils pour les utilisateurs existants
insert into public.profiles (id, email)
select id, email from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;



-- Ajouter la colonne is_admin à la table profiles

alter table public.profiles 

add column if not exists is_admin boolean not null default false;

-- Pour définir le premier admin, exécutez :

update public.profiles

set is_admin = true

where email = 'armelgeek5@gmail.com';  -- Remplacez par l'email de l'administrateur







-- Ajouter la colonne note à la table daily_steps
alter table public.daily_steps 
add column if not exists note text;

-- Recréer la fonction admin_give_points
create or replace function public.admin_give_points(
    target_user_id uuid,
    points_amount integer,
    reason text default 'Points administratifs'
)
returns void
language plpgsql
security definer
as $$
declare
    today date := current_date;
begin
    -- Insérer ou mettre à jour les pas pour aujourd'hui
    insert into daily_steps (
        user_id,
        date,
        steps_count,
        points_earned,
        note
    ) values (
        target_user_id,
        today,
        0,  -- Pas de pas pour les points administratifs
        points_amount,
        reason
    )
    on conflict (user_id, date) do update
    set 
        points_earned = daily_steps.points_earned + points_amount,
        note = case 
            when daily_steps.note is null then reason
            else daily_steps.note || ' + ' || reason
        end;
end;
$$;

-- Donner les permissions nécessaires
grant execute on function public.admin_give_points(uuid, integer, text) to authenticated;







-- Recréer la fonction admin_give_points avec mise à jour des points cumulés
create or replace function public.admin_give_points(
    target_user_id uuid,
    points_amount integer,
    reason text default 'Points administratifs'
)
returns void
language plpgsql
security definer
as $$
declare
    today date := current_date;
begin
    -- Insérer ou mettre à jour les pas pour aujourd'hui
    insert into daily_steps (
        user_id,
        date,
        steps_count,
        points_earned,
        note
    ) values (
        target_user_id,
        today,
        0,  -- Pas de pas pour les points administratifs
        points_amount,
        reason
    )
    on conflict (user_id, date) do update
    set 
        points_earned = daily_steps.points_earned + points_amount,
        note = case 
            when daily_steps.note is null then reason
            else daily_steps.note || ' + ' || reason
        end;

    -- Mettre à jour les points cumulés dans la table users
    update public.users
    set cumulative_points = (
        select coalesce(sum(points_earned), 0)
        from daily_steps
        where user_id = target_user_id
    )
    where id = target_user_id;
    
    -- Notifier le changement pour rafraîchir l'interface
    perform pg_notify(
        'points_updated',
        json_build_object(
            'user_id', target_user_id,
            'points_added', points_amount,
            'reason', reason
        )::text
    );
end;
$$;

-- Donner les permissions nécessaires
grant execute on function public.admin_give_points(uuid, integer, text) to authenticated;





-- Fonction pour calculer les points disponibles
create or replace function public.get_available_points(user_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
    total_points integer;
    spent_points integer;
begin
    -- Obtenir le total des points gagnés
    select cumulative_points into total_points
    from public.users
    where id = user_id;

    -- Calculer les points dépensés
    select coalesce(sum(points_amount), 0) into spent_points
    from donations
    where donations.user_id = get_available_points.user_id;
    
    -- Ajouter les points dépensés en récompenses
    spent_points := spent_points + (
        select coalesce(sum(roi.points_cost * roi.quantity), 0)
        from reward_orders ro
        join reward_order_items roi on roi.order_id = ro.id
        where ro.user_id = get_available_points.user_id
        and ro.status != 'cancelled'
    );
    
    -- Retourner les points disponibles
    return coalesce(total_points, 0) - coalesce(spent_points, 0);
end;
$$;

-- Donner les permissions nécessaires
grant execute on function public.get_available_points(uuid) to authenticated;





-- Supprimer l'ancienne fonction si elle existe
drop function if exists public.get_available_points;

-- Créer la fonction pour calculer les points disponibles
create or replace function public.get_available_points(user_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
    total_earned integer;
    total_spent integer;
begin
    -- Calculer le total des points gagnés (pas + points administratifs)
    select coalesce(sum(points_earned), 0) into total_earned
    from daily_steps
    where daily_steps.user_id = get_available_points.user_id;

    -- Calculer le total des points dépensés
    -- 1. Points dépensés en dons
    select coalesce(sum(points_amount), 0) into total_spent
    from donations
    where donations.user_id = get_available_points.user_id;
    
    -- 2. Ajouter les points dépensés en récompenses
    total_spent := total_spent + (
        select coalesce(sum(roi.points_cost * roi.quantity), 0)
        from reward_orders ro
        join reward_order_items roi on roi.order_id = ro.id
        where ro.user_id = get_available_points.user_id
        and ro.status != 'cancelled'
    );
    
    -- Retourner les points disponibles (jamais négatif)
    return greatest(0, total_earned - total_spent);
end;
$$;

-- Créer une fonction pour vérifier si un utilisateur a assez de points
create or replace function public.has_enough_points(user_id uuid, required_points integer)
returns boolean
language plpgsql
security definer
as $$
begin
    return (select get_available_points(user_id) >= required_points);
end;
$$;

-- Créer une fonction pour vérifier avant une dépense de points
create or replace function public.check_and_validate_points(user_id uuid, points_needed integer)
returns boolean
language plpgsql
security definer
as $$
begin
    -- Vérifier si l'utilisateur a assez de points
    if not has_enough_points(user_id, points_needed) then
        raise exception 'Points insuffisants. Disponible: %, Requis: %', 
            get_available_points(user_id), 
            points_needed;
    end if;
    return true;
end;
$$;

-- Donner les permissions nécessaires
grant execute on function public.get_available_points(uuid) to authenticated;
grant execute on function public.has_enough_points(uuid, integer) to authenticated;
grant execute on function public.check_and_validate_points(uuid, integer) to authenticated;

-- Créer un trigger pour vérifier les points avant un don
create or replace function public.check_points_before_donation()
returns trigger as $$
begin
    perform check_and_validate_points(NEW.user_id, NEW.points_amount);
    return NEW;
end;
$$ language plpgsql;

create trigger check_points_before_donation_trigger
    before insert on donations
    for each row
    execute function public.check_points_before_donation();

-- Créer un trigger pour vérifier les points avant une commande de récompense
create or replace function public.check_points_before_reward_order()
returns trigger as $$
declare
    total_cost integer;
begin
    -- Calculer le coût total de la commande
    select sum(r.points_cost * NEW.quantity) into total_cost
    from rewards r
    where r.id = NEW.reward_id;

    -- Vérifier si l'utilisateur a assez de points
    perform check_and_validate_points(
        (select user_id from reward_orders where id = NEW.order_id),
        total_cost
    );
    return NEW;
end;
$$ language plpgsql;

create trigger check_points_before_reward_order_trigger
    before insert on reward_order_items
    for each row
    execute function public.check_points_before_reward_order();





-- Table des récompenses
create table if not exists public.rewards (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    points_cost integer not null check (points_cost > 0),
    stock integer not null default 0 check (stock >= 0),
    image_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Table des commandes de récompenses
create table if not exists public.reward_orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id),
    status text not null check (status in ('pending', 'completed', 'cancelled')),
    total_points integer not null check (total_points >= 0),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Table des items de commande
create table if not exists public.reward_order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references public.reward_orders(id),
    reward_id uuid not null references public.rewards(id),
    quantity integer not null check (quantity > 0),
    points_cost integer not null check (points_cost >= 0),
    created_at timestamp with time zone default now()
);

-- Fonction pour calculer les points disponibles
create or replace function public.get_available_points(user_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
    total_earned integer;
    total_spent integer;
begin
    -- Calculer le total des points gagnés
    select coalesce(sum(points_earned), 0) into total_earned
    from daily_steps
    where daily_steps.user_id = get_available_points.user_id;

    -- Calculer le total des points dépensés en dons
    select coalesce(sum(points_amount), 0) into total_spent
    from donations
    where donations.user_id = get_available_points.user_id;
    
    -- Ajouter les points dépensés en récompenses
    total_spent := total_spent + (
        select coalesce(sum(total_points), 0)
        from reward_orders
        where user_id = get_available_points.user_id
        and status = 'completed'
    );
    
    -- Retourner les points disponibles
    return greatest(0, total_earned - total_spent);
end;
$$;

-- Fonction pour vérifier le stock
create or replace function public.check_reward_stock()
returns trigger
language plpgsql
security definer
as $$
declare
    available_stock integer;
begin
    -- Vérifier le stock disponible
    select stock into available_stock
    from rewards
    where id = NEW.reward_id;

    if available_stock < NEW.quantity then
        raise exception 'Stock insuffisant pour la récompense %', NEW.reward_id;
    end if;
    
    -- Mettre à jour le stock
    update rewards
    set stock = stock - NEW.quantity
    where id = NEW.reward_id;
    
    return NEW;
end;
$$;

-- Trigger pour vérifier le stock
drop trigger if exists check_reward_stock_trigger on reward_order_items;
create trigger check_reward_stock_trigger
    before insert on reward_order_items
    for each row
    execute function public.check_reward_stock();

-- Fonction pour restaurer le stock en cas d'annulation
create or replace function public.restore_reward_stock()
returns trigger
language plpgsql
security definer
as $$
begin
    if NEW.status = 'cancelled' and OLD.status != 'cancelled' then
        update rewards r
        set stock = r.stock + roi.quantity
        from reward_order_items roi
        where roi.order_id = NEW.id
        and r.id = roi.reward_id;
    end if;
    return NEW;
end;
$$;

-- Trigger pour restaurer le stock
drop trigger if exists restore_reward_stock_trigger on reward_orders;
create trigger restore_reward_stock_trigger
    before update on reward_orders
    for each row
    execute function public.restore_reward_stock();

-- Politiques de sécurité
alter table public.rewards enable row level security;
alter table public.reward_orders enable row level security;
alter table public.reward_order_items enable row level security;

create policy "Les récompenses sont visibles par tous les utilisateurs authentifiés"
    on public.rewards for select
    to authenticated
    using (true);

create policy "Les commandes sont visibles par leur propriétaire"
    on public.reward_orders for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent créer leurs propres commandes"
    on public.reward_orders for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent voir leurs items de commande"
    on public.reward_order_items for select
    to authenticated
    using (
        exists (
            select 1
            from reward_orders
            where id = reward_order_items.order_id
            and user_id = auth.uid()
        )
    );

create policy "Les utilisateurs peuvent ajouter des items à leurs commandes"
    on public.reward_order_items for insert
    to authenticated
    with check (
        exists (
            select 1
            from reward_orders
            where id = reward_order_items.order_id
            and user_id = auth.uid()
        )
    );

-- Accorder les permissions nécessaires
grant usage on schema public to authenticated;
grant all on public.rewards to authenticated;
grant all on public.reward_orders to authenticated;
grant all on public.reward_order_items to authenticated;





-- Supprimer et recréer la table reward_orders avec la bonne structure
drop table if exists public.reward_order_items;
drop table if exists public.reward_orders;

create table if not exists public.reward_orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id),
    status text not null check (status in ('pending', 'completed', 'cancelled')),
    total_points integer not null check (total_points >= 0),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table if not exists public.reward_order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references public.reward_orders(id),
    reward_id uuid not null references public.rewards(id),
    quantity integer not null check (quantity > 0),
    points_cost integer not null check (points_cost >= 0),
    created_at timestamp with time zone default now()
);

-- Ajouter les politiques de sécurité
alter table public.reward_orders enable row level security;
alter table public.reward_order_items enable row level security;

create policy "Les utilisateurs peuvent voir leurs commandes"
    on public.reward_orders for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent créer leurs commandes"
    on public.reward_orders for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent mettre à jour leurs commandes"
    on public.reward_orders for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent voir leurs items de commande"
    on public.reward_order_items for select
    to authenticated
    using (
        exists (
            select 1 from reward_orders
            where id = reward_order_items.order_id
            and user_id = auth.uid()
        )
    );

create policy "Les utilisateurs peuvent ajouter des items à leurs commandes"
    on public.reward_order_items for insert
    to authenticated
    with check (
        exists (
            select 1 from reward_orders
            where id = reward_order_items.order_id
            and user_id = auth.uid()
        )
    );

-- Trigger pour mettre à jour le stock
create or replace function public.update_reward_stock()
returns trigger as $$
begin
    update rewards
    set stock = stock - NEW.quantity
    where id = NEW.reward_id;
    return NEW;
end;
$$ language plpgsql;

create trigger update_reward_stock_trigger
    after insert on reward_order_items
    for each row
    execute function public.update_reward_stock();

-- Trigger pour restaurer le stock en cas d'annulation
create or replace function public.restore_reward_stock()
returns trigger as $$
begin
    if NEW.status = 'cancelled' and OLD.status != 'cancelled' then
        update rewards r
        set stock = r.stock + roi.quantity
        from reward_order_items roi
        where roi.order_id = NEW.id
        and r.id = roi.reward_id;
    end if;
    return NEW;
end;
$$ language plpgsql;

create trigger restore_reward_stock_trigger
    before update on reward_orders
    for each row
    execute function public.restore_reward_stock();

-- Donner les permissions nécessaires
grant all on public.reward_orders to authenticated;
grant all on public.reward_order_items to authenticated;
