-- Drop existing tables
drop table if exists public.reward_order_items cascade;
drop table if exists public.reward_orders cascade;
drop table if exists public.rewards cascade;
drop table if exists public.reviews cascade;
drop table if exists public.partners cascade;

-- Create partners table
create table public.partners (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null unique,
  company_name text not null,
  description text,
  logo_url text,
  website_url text,
  status text default 'pending' check (status in ('pending', 'active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create rewards table
create table public.rewards (
  id uuid default uuid_generate_v4() primary key,
  partner_id uuid references public.partners(id) not null,
  title text not null,
  description text,
  image_url text,
  points_cost integer not null check (points_cost > 0),
  stock integer not null check (stock >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reward orders table
create table public.reward_orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
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

-- Create reviews table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  partner_id uuid references public.partners(id) not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create triggers for updated_at
create trigger set_timestamp_partners
  before update on public.partners
  for each row
  execute function public.set_timestamp();

create trigger set_timestamp_rewards
  before update on public.rewards
  for each row
  execute function public.set_timestamp();

create trigger set_timestamp_reward_orders
  before update on public.reward_orders
  for each row
  execute function public.set_timestamp();

create trigger set_timestamp_reward_order_items
  before update on public.reward_order_items
  for each row
  execute function public.set_timestamp();

create trigger set_timestamp_reviews
  before update on public.reviews
  for each row
  execute function public.set_timestamp();

-- Enable RLS
alter table public.partners enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_orders enable row level security;
alter table public.reward_order_items enable row level security;
alter table public.reviews enable row level security;

-- Create RLS policies for partners
create policy "Users can view all active partners"
  on public.partners for select
  using (status = 'active');

create policy "Users can view their own partner profile"
  on public.partners for select
  using (auth.uid() = user_id);

create policy "Users can update their own partner profile"
  on public.partners for update
  using (auth.uid() = user_id);

create policy "Users can create their own partner profile"
  on public.partners for insert
  with check (auth.uid() = user_id);

-- Create RLS policies for rewards
create policy "Partners can manage their own rewards"
  on public.rewards for all
  using (partner_id in (select id from public.partners where user_id = auth.uid()));

create policy "Everyone can view active rewards"
  on public.rewards for select
  using (
    exists (
      select 1
      from public.partners
      where id = rewards.partner_id
      and status = 'active'
    )
  );

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

-- Create RLS policies for reviews
create policy "Users can view all reviews"
  on public.reviews for select
  using (true);

create policy "Users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Grant permissions
grant usage on schema public to authenticated;
grant all on public.partners to authenticated;
grant all on public.rewards to authenticated;
grant all on public.reward_orders to authenticated;
grant all on public.reward_order_items to authenticated;
grant all on public.reviews to authenticated;