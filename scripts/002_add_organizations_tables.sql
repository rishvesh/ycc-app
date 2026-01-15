-- Add organization subscriptions table
create table if not exists public.organization_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.ngos(id) on delete cascade,
  subscribed_at timestamp default now(),
  unique(user_id, organization_id)
);

-- Rename ngos table to organizations for clarity
alter table public.ngos rename to organizations;
alter table public.posts rename column ngo_id to organization_id;

-- Enable RLS for organization_subscriptions
alter table public.organization_subscriptions enable row level security;

-- RLS Policies for organization_subscriptions
create policy "org_subs_select_own"
  on public.organization_subscriptions for select
  using (auth.uid() = user_id);

create policy "org_subs_insert_own"
  on public.organization_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "org_subs_delete_own"
  on public.organization_subscriptions for delete
  using (auth.uid() = user_id);

-- Update references in RLS policies
drop policy if exists "ngos_select_all" on public.organizations;
drop policy if exists "ngos_insert_own" on public.organizations;
drop policy if exists "ngos_update_own" on public.organizations;
drop policy if exists "ngos_delete_own" on public.organizations;

create policy "organizations_select_all"
  on public.organizations for select
  using (true);

create policy "organizations_insert_own"
  on public.organizations for insert
  with check (auth.uid() = created_by);

create policy "organizations_update_own"
  on public.organizations for update
  using (auth.uid() = created_by);

create policy "organizations_delete_own"
  on public.organizations for delete
  using (auth.uid() = created_by);
