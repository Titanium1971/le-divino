import { SupabaseClient } from "@supabase/supabase-js";
import type { Drink, DrinkCategory, DrinkFormData } from "@/lib/types/database";
import { DRINK_CATEGORIES } from "@/lib/types/database";

export type DrinkGroup = {
  category: DrinkCategory;
  label: string;
  drinks: Drink[];
};

export async function getDrinks(supabase: SupabaseClient): Promise<Drink[]> {
  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Drink[];
}

export function getDrinksGrouped(drinks: Drink[]): DrinkGroup[] {
  return DRINK_CATEGORIES.map(({ value, label }) => ({
    category: value,
    label,
    drinks: drinks.filter((d) => d.category === value),
  }));
}

export async function createDrink(
  supabase: SupabaseClient,
  data: DrinkFormData,
): Promise<Drink> {
  const { data: drink, error } = await supabase
    .from("drinks")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return drink as Drink;
}

export async function updateDrink(
  supabase: SupabaseClient,
  id: string,
  data: Partial<DrinkFormData>,
): Promise<Drink> {
  const { data: drink, error } = await supabase
    .from("drinks")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return drink as Drink;
}

export async function deleteDrink(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("drinks").delete().eq("id", id);
  if (error) throw error;
}
