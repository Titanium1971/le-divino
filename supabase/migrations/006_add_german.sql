-- Le Divino — Migration 006 : ajout de l'allemand (de) dans tous les champs i18n jsonb

-- dishes.name + dishes.description
update public.dishes set name = name || '{"de": ""}'::jsonb where not (name ? 'de');
update public.dishes set description = description || '{"de": ""}'::jsonb where not (description ? 'de');
alter table public.dishes alter column name set default '{"fr":"","en":"","it":"","es":"","de":""}'::jsonb;
alter table public.dishes alter column description set default '{"fr":"","en":"","it":"","es":"","de":""}'::jsonb;

-- menus.name + menus.description
update public.menus set name = name || '{"de": ""}'::jsonb where not (name ? 'de');
update public.menus set description = description || '{"de": ""}'::jsonb where not (description ? 'de');
alter table public.menus alter column name set default '{"fr":"","en":"","it":"","es":"","de":""}'::jsonb;
alter table public.menus alter column description set default '{"fr":"","en":"","it":"","es":"","de":""}'::jsonb;

-- events.title + events.description
update public.events set title = title || '{"de": ""}'::jsonb where not (title ? 'de');
update public.events set description = description || '{"de": ""}'::jsonb where not (description ? 'de');
alter table public.events alter column title set default '{"fr":"","en":"","it":"","es":"","de":""}'::jsonb;
alter table public.events alter column description set default '{"fr":"","en":"","it":"","es":"","de":""}'::jsonb;

-- gallery.caption (005 already creates with "de", this handles existing rows if 005 ran without "de")
update public.gallery set caption = caption || '{"de": ""}'::jsonb where not (caption ? 'de');
alter table public.gallery alter column caption set default '{"fr":"","en":"","it":"","es":"","de":""}'::jsonb;
