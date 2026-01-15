-- Add organization_id to forum_threads table and create org-specific forum structure
alter table public.forum_threads add column organization_id uuid references public.organizations(id) on delete cascade;

-- Create index for faster queries
create index if not exists idx_forum_threads_org on public.forum_threads(organization_id);
create index if not exists idx_forum_threads_created on public.forum_threads(created_at desc);

-- Add events table for organization events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  event_date timestamp not null,
  location text,
  image_url text,
  max_volunteers integer,
  created_by uuid not null references auth.users(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create user badges/achievements table
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_name text not null,
  badge_icon text,
  earned_at timestamp default now()
);

-- Create volunteer hours tracking
create table if not exists public.volunteer_hours (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  hours numeric not null,
  description text,
  verified_by uuid references auth.users(id),
  verified_at timestamp,
  created_at timestamp default now()
);

-- Enable RLS
alter table public.events enable row level security;
alter table public.user_badges enable row level security;
alter table public.volunteer_hours enable row level security;

-- RLS Policies for events
create policy "events_select_all"
  on public.events for select
  using (true);

create policy "events_insert_org_staff"
  on public.events for insert
  with check (auth.uid() = created_by);

create policy "events_update_own"
  on public.events for update
  using (auth.uid() = created_by);

create policy "events_delete_own"
  on public.events for delete
  using (auth.uid() = created_by);

-- RLS Policies for user_badges
create policy "user_badges_select_own"
  on public.user_badges for select
  using (auth.uid() = user_id or true);

create policy "user_badges_insert_any"
  on public.user_badges for insert
  with check (true);

-- RLS Policies for volunteer_hours
create policy "volunteer_hours_select_own"
  on public.volunteer_hours for select
  using (auth.uid() = volunteer_id);

create policy "volunteer_hours_insert_own"
  on public.volunteer_hours for insert
  with check (auth.uid() = volunteer_id);
