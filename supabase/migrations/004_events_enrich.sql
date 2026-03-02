-- ============================================================
-- Le Divino — Migration 004 : enrich events table
-- Adds: event_type, show_on_screen, i18n for title & description
-- Renames: published → is_active
-- ============================================================

-- 1. Add event_type enum + column
create type public.event_type as enum (
  'karaoke', 'concert', 'private', 'holiday', 'animation', 'custom'
);

alter table public.events add column event_type public.event_type not null default 'custom';

-- 2. Add show_on_screen toggle
alter table public.events add column show_on_screen boolean not null default false;

-- 3. Rename published → is_active
alter table public.events rename column published to is_active;

-- 4. Convert title text → jsonb i18n
alter table public.events add column title_i18n jsonb;

update public.events
set title_i18n = jsonb_build_object('fr', title, 'en', '', 'it', '', 'es', '');

alter table public.events alter column title_i18n set not null;
alter table public.events alter column title_i18n set default '{"fr":"","en":"","it":"","es":""}'::jsonb;

alter table public.events drop column title;
alter table public.events rename column title_i18n to title;

-- 5. Convert description text → jsonb i18n
alter table public.events add column description_i18n jsonb;

update public.events
set description_i18n = jsonb_build_object('fr', coalesce(description, ''), 'en', '', 'it', '', 'es', '');

alter table public.events alter column description_i18n set not null;
alter table public.events alter column description_i18n set default '{"fr":"","en":"","it":"","es":""}'::jsonb;

alter table public.events drop column description;
alter table public.events rename column description_i18n to description;
