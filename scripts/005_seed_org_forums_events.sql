-- Seed organization-specific forums and events
-- Note: Replace the UUIDs with actual organization and user UUIDs from your database

-- First, get the organization IDs (replace these with actual IDs after initial seed)
-- Example organization forum threads for each organization

-- Get organization IDs for seeding (using the ones from previous seed)
-- These are examples; adjust based on actual database values

-- Add organization-specific forum threads
insert into public.forum_threads (title, description, category, created_by, organization_id, created_at)
select 
  'Upcoming Cleanup Drive',
  'Let''s discuss our upcoming environmental cleanup initiative and how we can maximize participation.',
  'General',
  (select id from auth.users where email like '%@example.com' limit 1),
  id,
  now()
from public.organizations
where name = 'Enviro Change'
on conflict do nothing;

insert into public.forum_threads (title, description, category, created_by, organization_id, created_at)
select 
  'Workshop Planning - December',
  'Coordinate dates and topics for our December tech workshops',
  'General',
  (select id from auth.users where email like '%@example.com' limit 1),
  id,
  now()
from public.organizations
where name = 'Tech Empowerment'
on conflict do nothing;

-- Add sample events
insert into public.events (organization_id, title, description, event_date, location, max_volunteers, created_by, created_at)
select
  id,
  'Beach Cleanup Drive',
  'Join us for a community beach cleanup to protect marine life and reduce plastic waste.',
  now() + interval '7 days',
  'Chowpatty Beach, Pune',
  50,
  (select id from auth.users where email like '%@example.com' limit 1),
  now()
from public.organizations
where name = 'Enviro Change'
on conflict do nothing;

insert into public.events (organization_id, title, description, event_date, location, max_volunteers, created_by, created_at)
select
  id,
  'Introduction to Web Development',
  'Learn the basics of HTML, CSS, and JavaScript in this hands-on workshop for beginners.',
  now() + interval '14 days',
  'Tech Hub, Pune',
  30,
  (select id from auth.users where email like '%@example.com' limit 1),
  now()
from public.organizations
where name = 'Tech Empowerment'
on conflict do nothing;

insert into public.events (organization_id, title, description, event_date, location, max_volunteers, created_by, created_at)
select
  id,
  'Free Health Checkup Camp',
  'Comprehensive health screenings and consultations for the underprivileged communities.',
  now() + interval '21 days',
  'Community Center, Pune',
  100,
  (select id from auth.users where email like '%@example.com' limit 1),
  now()
from public.organizations
where name = 'Health For All'
on conflict do nothing;

-- Add sample volunteer hours
insert into public.volunteer_hours (volunteer_id, organization_id, hours, description, created_at)
select
  (select id from auth.users where email like 'volunteer%@example.com' limit 1),
  id,
  4,
  'Participated in community service project',
  now() - interval '5 days'
from public.organizations
where name = 'Enviro Change'
on conflict do nothing;

-- Add sample badges
insert into public.user_badges (user_id, badge_name, badge_icon, earned_at)
select
  id,
  'First Volunteer',
  '🌟',
  now()
from public.profiles
where user_type = 'volunteer'
limit 1
on conflict do nothing;
