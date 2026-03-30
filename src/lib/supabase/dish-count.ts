import type { SupabaseClient } from "@supabase/supabase-js";
import type { Dish } from "@/lib/types/database";

/**
 * Count total numbered dishes for global numbering.
 * Includes: available dishes (carte + marché) + non-available dishes linked to active menus.
 * This ensures drinks/wines start after ALL dish numbers.
 */
export async function getTotalDishCount(supabase: SupabaseClient): Promise<number> {
  // 1. All available dishes
  const { data: available } = await supabase
    .from("dishes")
    .select("id")
    .eq("available", true);

  const ids = new Set((available ?? []).map((d: { id: string }) => d.id));

  // 2. Dishes linked to active menus (may include non-available ones)
  const { data: menuDishes } = await supabase
    .from("menus")
    .select("menu_dishes(dishes(id))")
    .eq("active", true);

  for (const menu of menuDishes ?? []) {
    const menuData = menu as unknown as { menu_dishes: { dishes: { id: string } | null }[] };
    for (const md of menuData.menu_dishes ?? []) {
      if (md.dishes?.id) ids.add(md.dishes.id);
    }
  }

  return ids.size;
}
