import { SupabaseClient } from "@supabase/supabase-js";
import type { Menu, MenuFormData } from "@/lib/types/database";

export async function getMenus(supabase: SupabaseClient): Promise<Menu[]> {
  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .order("sort_order");

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
