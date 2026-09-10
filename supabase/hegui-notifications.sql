-- Hé Guǐ phone notification storage. These public-schema tables are protected
-- by RLS with no client policies; only the Edge Function service role can read them.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create table if not exists public.hegui_notification_devices (
    device_id uuid primary key,
    token_hash text not null,
    subscription jsonb not null,
    timezone text not null default 'Australia/Sydney',
    updated_at timestamptz not null default now()
);

create table if not exists public.hegui_notification_reminders (
    id bigint generated always as identity primary key,
    device_id uuid not null references public.hegui_notification_devices(device_id) on delete cascade,
    event_id text not null,
    kind text not null check (kind in ('day', 'two_hours')),
    title text not null,
    event_date date not null,
    event_starts_at timestamptz not null,
    scheduled_at timestamptz not null,
    subscription jsonb not null,
    sent_at timestamptz,
    created_at timestamptz not null default now(),
    unique (device_id, event_id, kind)
);

create index if not exists hegui_notification_reminders_due
    on public.hegui_notification_reminders (scheduled_at)
    where sent_at is null;

create table if not exists public.hegui_notification_settings (
    key text primary key,
    value text not null,
    updated_at timestamptz not null default now()
);

alter table public.hegui_notification_devices enable row level security;
alter table public.hegui_notification_reminders enable row level security;
alter table public.hegui_notification_settings enable row level security;

revoke all on public.hegui_notification_devices from anon, authenticated;
revoke all on public.hegui_notification_reminders from anon, authenticated;
revoke all on public.hegui_notification_settings from anon, authenticated;

grant all on public.hegui_notification_devices to service_role;
grant all on public.hegui_notification_reminders to service_role;
grant all on public.hegui_notification_settings to service_role;
grant usage, select on sequence public.hegui_notification_reminders_id_seq to service_role;

-- The dispatcher call is scheduled separately after its private token is placed in Vault.
