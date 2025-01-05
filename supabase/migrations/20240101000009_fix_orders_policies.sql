-- Add insert policy for orders table
create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Add insert policy for order items table
create policy "Users can create order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_items.order_id
      and user_id = auth.uid()
    )
  ); 