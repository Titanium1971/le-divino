-- ============================================================
-- Le Divino — Migration 003 : i18n menus + service PIN + Realtime
-- Gère les deux cas : colonnes text (001) ou déjà jsonb
-- ============================================================

-- 1. Convertir menus.name / description → jsonb i18n (si nécessaire)
do $$
declare
  col_type text;
begin
  -- Vérifier le type actuel de la colonne name
  select data_type into col_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'menus'
    and column_name = 'name';

  if col_type = 'text' then
    -- Cas normal : colonnes text → conversion complète
    raise notice 'menus.name is text — converting to jsonb i18n';

    alter table public.menus add column name_i18n jsonb;
    alter table public.menus add column description_i18n jsonb;

    update public.menus
    set name_i18n = jsonb_build_object(
      'fr', coalesce(name, ''), 'en', '', 'it', '', 'es', ''
    );

    update public.menus
    set description_i18n = jsonb_build_object(
      'fr', coalesce(description, ''), 'en', '', 'it', '', 'es', ''
    );

    alter table public.menus alter column name_i18n set not null;
    alter table public.menus alter column name_i18n
      set default '{"fr":"","en":"","it":"","es":""}'::jsonb;
    alter table public.menus alter column description_i18n set not null;
    alter table public.menus alter column description_i18n
      set default '{"fr":"","en":"","it":"","es":""}'::jsonb;

    alter table public.menus drop column name;
    alter table public.menus drop column description;

    alter table public.menus rename column name_i18n to name;
    alter table public.menus rename column description_i18n to description;

  elsif col_type = 'jsonb' then
    -- Colonnes déjà jsonb — juste s'assurer des defaults / not null
    raise notice 'menus.name is already jsonb — ensuring defaults';

    alter table public.menus alter column name set not null;
    alter table public.menus alter column name
      set default '{"fr":"","en":"","it":"","es":""}'::jsonb;
    alter table public.menus alter column description set not null;
    alter table public.menus alter column description
      set default '{"fr":"","en":"","it":"","es":""}'::jsonb;

    -- Remplir les éventuels NULL restants avant la contrainte
    update public.menus
    set name = '{"fr":"","en":"","it":"","es":""}'::jsonb
    where name is null;

    update public.menus
    set description = '{"fr":"","en":"","it":"","es":""}'::jsonb
    where description is null;

  else
    raise exception 'Type inattendu pour menus.name : %', col_type;
  end if;
end;
$$;

-- 2. Seed service_pin dans settings
insert into public.settings (key, value)
values ('service_pin', '"1234"'::jsonb)
on conflict (key) do nothing;

-- 3. Activer Realtime sur dishes pour la page /service
do $$
begin
  alter publication supabase_realtime add table public.dishes;
exception when duplicate_object then
  null;
end;
$$;
