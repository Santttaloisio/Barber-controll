alter table public.cuts
  add column if not exists payment_method text,
  add column if not exists observation text,
  add column if not exists service_name_snapshot text,
  add column if not exists service_price_snapshot numeric;

alter table public.barbers
  add column if not exists active boolean not null default true;

alter table public.services
  add column if not exists active boolean not null default true;

alter table public.expenses
  add column if not exists category text,
  add column if not exists payment_method text,
  add column if not exists date date,
  add column if not exists observation text;

alter table public.barbers enable row level security;
alter table public.cuts enable row level security;
alter table public.services enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "authenticated users can read barbers" on public.barbers;
create policy "authenticated users can read barbers"
  on public.barbers for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can insert barbers" on public.barbers;
create policy "authenticated users can insert barbers"
  on public.barbers for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can update barbers" on public.barbers;
create policy "authenticated users can update barbers"
  on public.barbers for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can read cuts" on public.cuts;
create policy "authenticated users can read cuts"
  on public.cuts for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can insert cuts" on public.cuts;
create policy "authenticated users can insert cuts"
  on public.cuts for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can read services" on public.services;
create policy "authenticated users can read services"
  on public.services for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can insert services" on public.services;
create policy "authenticated users can insert services"
  on public.services for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can update services" on public.services;
create policy "authenticated users can update services"
  on public.services for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can read expenses" on public.expenses;
create policy "authenticated users can read expenses"
  on public.expenses for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can insert expenses" on public.expenses;
create policy "authenticated users can insert expenses"
  on public.expenses for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can delete expenses" on public.expenses;
create policy "authenticated users can delete expenses"
  on public.expenses for delete
  to authenticated
  using (true);
