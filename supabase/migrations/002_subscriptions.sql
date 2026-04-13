-- Subscriptions table (managed by Stripe webhook)
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id  text unique,
  stripe_customer_id      text,
  plan                    text not null default 'free'
                            check (plan in ('free', 'basic', 'premium', 'annual', 'unknown')),
  status                  text not null default 'inactive'
                            check (status in ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (user_id)
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_stripe_customer_id_idx on public.subscriptions(stripe_customer_id);

-- RLS: users can only read their own subscription
alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role (webhook) can write freely — enforced via service role key, no policy needed

-- Auto-update updated_at
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();
