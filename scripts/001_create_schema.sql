-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text not null check (user_type in ('volunteer', 'ngo_staff')),
  display_name text not null,
  bio text,
  avatar_url text,
  city text default 'Pune',
  skills text[] default array[]::text[],
  interests text[] default array[]::text[],
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create NGOs table
create table if not exists public.ngos (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  name text not null,
  description text,
  logo_url text,
  mission text,
  focus_areas text[] default array[]::text[],
  city text default 'Pune',
  website text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id),
  ngo_id uuid references public.ngos(id),
  title text not null,
  content text not null,
  post_type text not null check (post_type in ('opportunity', 'announcement', 'discussion')),
  tags text[] default array[]::text[],
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id),
  recipient_id uuid not null references auth.users(id),
  content text not null,
  read_at timestamp,
  created_at timestamp default now()
);

-- Create forum_threads table
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  title text not null,
  description text,
  category text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create forum_replies table
create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads(id),
  author_id uuid not null references auth.users(id),
  content text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create volunteer_applications table
create table if not exists public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references auth.users(id),
  opportunity_id uuid not null references public.posts(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  cover_letter text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.ngos enable row level security;
alter table public.posts enable row level security;
alter table public.messages enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_replies enable row level security;
alter table public.volunteer_applications enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id or true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for ngos
create policy "ngos_select_all"
  on public.ngos for select
  using (true);

create policy "ngos_insert_own"
  on public.ngos for insert
  with check (auth.uid() = created_by);

create policy "ngos_update_own"
  on public.ngos for update
  using (auth.uid() = created_by);

create policy "ngos_delete_own"
  on public.ngos for delete
  using (auth.uid() = created_by);

-- RLS Policies for posts
create policy "posts_select_all"
  on public.posts for select
  using (true);

create policy "posts_insert_own"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "posts_update_own"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "posts_delete_own"
  on public.posts for delete
  using (auth.uid() = author_id);

-- RLS Policies for messages
create policy "messages_select_own"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "messages_insert_own"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- RLS Policies for forum_threads
create policy "forum_threads_select_all"
  on public.forum_threads for select
  using (true);

create policy "forum_threads_insert_any"
  on public.forum_threads for insert
  with check (auth.uid() = created_by);

create policy "forum_threads_update_own"
  on public.forum_threads for update
  using (auth.uid() = created_by);

-- RLS Policies for forum_replies
create policy "forum_replies_select_all"
  on public.forum_replies for select
  using (true);

create policy "forum_replies_insert_any"
  on public.forum_replies for insert
  with check (auth.uid() = author_id);

create policy "forum_replies_update_own"
  on public.forum_replies for update
  using (auth.uid() = author_id);

-- RLS Policies for volunteer_applications
create policy "volunteer_applications_select_own"
  on public.volunteer_applications for select
  using (auth.uid() = volunteer_id);

create policy "volunteer_applications_insert_own"
  on public.volunteer_applications for insert
  with check (auth.uid() = volunteer_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'user_type', 'volunteer')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
