-- Create orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  partner_id uuid references public.partners(id) not null,
  status text check (status in ('pending', 'completed', 'cancelled')) not null default 'pending',
  total_points integer not null check (total_points >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order items table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  reward_id uuid references public.rewards(id),
  product_id uuid references public.products(id),
  quantity integer not null check (quantity > 0),
  points_cost integer not null check (points_cost >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (reward_id is not null and product_id is null) or
    (reward_id is null and product_id is not null)
  )
);

-- Add indexes
create index orders_user_id_idx on public.orders(user_id);
create index orders_partner_id_idx on public.orders(partner_id);
create index orders_status_idx on public.orders(status);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_reward_id_idx on public.order_items(reward_id);
create index order_items_product_id_idx on public.order_items(product_id);

-- Add RLS policies
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Users can view their own orders
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Partners can view orders for their products/rewards
create policy "Partners can view their orders"
  on public.orders for select
  using (partner_id in (
    select id from public.partners where user_id = auth.uid()
  ));

-- Partners can update status of their orders
create policy "Partners can update their orders"
  on public.orders for update
  using (partner_id in (
    select id from public.partners where user_id = auth.uid()
  ))
  with check (
    partner_id in (
      select id from public.partners where user_id = auth.uid()
    )
  );

-- Users can view their own order items
create policy "Users can view their own order items"
  on public.order_items for select
  using (order_id in (
    select id from public.orders where user_id = auth.uid()
  ));

-- Partners can view items from their orders
create policy "Partners can view their order items"
  on public.order_items for select
  using (order_id in (
    select id from public.orders where partner_id in (
      select id from public.partners where user_id = auth.uid()
    )
  )); 