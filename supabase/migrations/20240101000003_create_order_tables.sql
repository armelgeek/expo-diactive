-- Drop existing tables if they exist
drop table if exists public.reward_order_items cascade;
drop table if exists public.reward_orders cascade;

-- Create reward orders table
create table public.reward_orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  status text not null check (status in ('pending', 'completed', 'cancelled')),
  total_points integer not null check (total_points >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reward order items table
create table public.reward_order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.reward_orders(id) not null,
  reward_id uuid references public.rewards(id) not null,
  quantity integer not null check (quantity > 0),
  points_cost integer not null check (points_cost >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create triggers for updated_at
create trigger set_timestamp_reward_orders
  before update on public.reward_orders
  for each row
  execute function public.set_timestamp();

create trigger set_timestamp_reward_order_items
  before update on public.reward_order_items
  for each row
  execute function public.set_timestamp();

-- Enable RLS
alter table public.reward_orders enable row level security;
alter table public.reward_order_items enable row level security;

-- Create RLS policies for reward orders
create policy "Users can view their own orders"
  on public.reward_orders for select
  using (auth.uid() = user_id);

create policy "Users can create their own orders"
  on public.reward_orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own orders"
  on public.reward_orders for update
  using (auth.uid() = user_id);

-- Create RLS policies for reward order items
create policy "Users can view their own order items"
  on public.reward_order_items for select
  using (
    exists (
      select 1 from public.reward_orders
      where id = reward_order_items.order_id
      and user_id = auth.uid()
    )
  );

create policy "Users can create their own order items"
  on public.reward_order_items for insert
  with check (
    exists (
      select 1 from public.reward_orders
      where id = reward_order_items.order_id
      and user_id = auth.uid()
    )
  );

create policy "Partners can view orders for their rewards"
  on public.reward_order_items for select
  using (
    exists (
      select 1 from public.rewards r
      join public.partners p on p.id = r.partner_id
      where r.id = reward_order_items.reward_id
      and p.user_id = auth.uid()
    )
  );

-- Grant necessary permissions
grant all on public.reward_orders to authenticated;
grant all on public.reward_order_items to authenticated; 