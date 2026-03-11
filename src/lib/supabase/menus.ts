import { SupabaseClient } from "@supabase/supabase-js";
import type { Menu, MenuFormData, MenuDish } from "@/lib/types/database";

export async function getMenus(supabase: SupabaseClient): Promise<Menu[]> {
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .order("created_at");

  if (error) throw error;
  return (data ?? []) as Menu[];
}

export async function createMenu(
  supabase: SupabaseClient,
  data: MenuFormData,
): Promise<Menu> {
  const { data: menu, error } = await supabase
    .from("menus")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return menu as Menu;
}

export async function updateMenu(
  supabase: SupabaseClient,
  id: string,
  data: Partial<MenuFormData>,
): Promise<Menu> {
  const { data: menu, error } = await supabase
    .from("menus")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return menu as Menu;
}

export async function deleteMenu(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("menus").delete().eq("id", id);
  if (error) throw error;
}

// ── Menu ↔ Dish junction ──

export async function getMenuDishes(
  supabase: SupabaseClient,
  menuId: string,
): Promise<MenuDish[]> {
  const { data, error } = await supabase
    .from("menu_dishes")
    .select("*")
    .eq("menu_id", menuId);

  if (error) throw error;
  return (data ?? []) as MenuDish[];
}

export async function getAllMenuDishes(
  supabase: SupabaseClient,
): Promise<MenuDish[]> {
  const { data, error } = await supabase
    .from("menu_dishes")
    .select("*");

  if (error) throw error;
  return (data ?? []) as MenuDish[];
}

export async function addDishToMenu(
  supabase: SupabaseClient,
  menuId: string,
  dishId: string,
): Promise<MenuDish> {
  const { data, error } = await supabase
    .from("menu_dishes")
    .insert({ menu_id: menuId, dish_id: dishId })
    .select()
    .single();

  if (error) throw error;
  return data as MenuDish;
}

export async function removeDishFromMenu(
  supabase: SupabaseClient,
  menuId: string,
  dishId: string,
): Promise<void> {
  const { error } = await supabase
    .from("menu_dishes")
    .delete()
    .eq("menu_id", menuId)
    .eq("dish_id", dishId);
  if (error) throw error;
}

