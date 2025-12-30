-- Create Table: user_credits
create table public.user_credits (
  id uuid not null default gen_random_uuid (),
  user_email text not null,
  credits numeric not null default 0,
  updated_at timestamp with time zone null default now(),
  constraint user_credits_pkey primary key (id),
  constraint user_credits_user_email_key unique (user_email)
);

-- Enable Row Level Security (RLS)
alter table public.user_credits enable row level security;

-- Policy: Allow read access for everyone (Demo purpose)
-- Ideally: auth.uid() = user_id, but we are using email for this simple demo
create policy "Allow all read access"
on public.user_credits
for select
to anon
using (true);

-- Policy: Allow update/insert for everyone (Demo purpose)
create policy "Allow all modifications"
on public.user_credits
for all
to anon
using (true)
with check (true);
