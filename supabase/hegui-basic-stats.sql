-- Hé Guǐ Planner - Basic Statistics
-- Supabase project: Hé Guǐ Logger
--
-- This report counts devices separately from roster profiles.
-- Each device can contribute up to three profile slots.
-- James's identified phone and PC are excluded through the private
-- hegui_logger_excluded_devices table.
--
-- The private schema keeps the administration report and exclusion
-- identifiers out of the public Data API.

create schema if not exists private;

create table if not exists private.hegui_logger_excluded_devices (
  device_id text primary key,
  label text not null,
  added_at timestamptz not null default now()
);

revoke all on table private.hegui_logger_excluded_devices
from public, anon, authenticated;

create or replace view private.hegui_basic_stats
with (security_invoker = true)
as
with filtered_events as (
  select e.*
  from public.usage_events e
  where e.device_id is not null
    and not exists (
      select 1
      from private.hegui_logger_excluded_devices x
      where x.device_id = e.device_id
    )
),
latest_profile_selection as (
  select distinct on (
    device_id,
    coalesce(nullif(details->>'profile_slot', '')::integer, 1)
  )
    device_id,
    coalesce(nullif(details->>'profile_slot', '')::integer, 1) as profile_slot,
    roster,
    case
      when details->>'employment_type' = 'fulltime' then 'permanent_full_time'
      when details->>'employment_type' = 'parttime' then 'permanent_part_time'
      when details->>'employment_type' = 'casual' then 'casual'
      else 'unknown'
    end as employment_type,
    created_at
  from filtered_events
  where event_type = 'roster_selected'
  order by
    device_id,
    coalesce(nullif(details->>'profile_slot', '')::integer, 1),
    created_at desc
),
share_counts as (
  select device_id, count(*) as share_count
  from filtered_events
  where event_type = 'share_app'
  group by device_id
)
select
  (select count(distinct device_id) from filtered_events) as total_devices,
  (select count(*) from latest_profile_selection) as configured_profiles,
  (select count(distinct device_id) from latest_profile_selection) as devices_with_roster_or_casual,
  (select count(*) from latest_profile_selection where employment_type = 'permanent_full_time') as permanent_full_time_profiles,
  (select count(*) from latest_profile_selection where employment_type = 'permanent_part_time') as permanent_part_time_profiles,
  (select count(*) from latest_profile_selection where employment_type = 'casual') as casual_profiles,
  (select count(distinct device_id) from filtered_events where event_type = 'ghost_escape_open') as ghost_escape_devices,
  (select count(distinct device_id) from filtered_events where event_type = 'app_like') as app_like_devices,
  (select count(distinct device_id) from filtered_events where event_type = 'calendar_added' and details->>'provider' = 'google') as google_calendar_devices,
  (select count(distinct device_id) from filtered_events where event_type = 'support_form_open') as help_devices,
  (select count(*) from share_counts where share_count >= 1) as shared_app_devices,
  (select count(*) from share_counts where share_count >= 3) as shared_app_three_plus_devices;

revoke all on table private.hegui_basic_stats
from public, anon, authenticated;

-- Read the Basic Stats report:
select * from private.hegui_basic_stats;

-- Add another device to the exclusion list when required:
-- insert into private.hegui_logger_excluded_devices (device_id, label)
-- values ('device-id-here', 'Reason for exclusion')
-- on conflict (device_id) do update set label = excluded.label;
