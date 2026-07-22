alter table public.cuts
  add column if not exists payment_method text,
  add column if not exists observation text;

alter table public.barbers
  add column if not exists active boolean not null default true;

alter table public.expenses
  add column if not exists category text,
  add column if not exists payment_method text,
  add column if not exists date date,
  add column if not exists observation text;
