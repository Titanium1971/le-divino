import { SupabaseClient } from "@supabase/supabase-js";
import type { Dish, DishCategory, DishFormData } from "@/lib/types/database";
import { DISH_CATEGORIES } from "@/lib/types/database";

export type DishGroup = { category: DishCategory; label: string; dishes: Dish[] };

export async function getDishesGrouped(
  supabase: SupabaseClient,
): Promise<DishGroup[]> {
  const { data, error } = await supabase
    .from("dishes")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  const dishes = (data ?? []) as Dish[];

  return DISH_CATEGORIES.map(({ value, label }) => ({
    category: value,
    label,
    dishes: dishes.filter((d) => d.category === value),
  })).filter((g) => g.dishes.length > 0);
}

export async function getAllDishes(supabase: SupabaseClient): Promise<Dish[]> {
  const { data, error } = await supabase
    .from("dishes")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as Dish[];
}

export async function createDish(
  supabase: SupabaseClient,
  data: DishFormData,
): Promise<Dish> {
  const { data: dish, error } = await supabase
    .from("dishes")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return dish as Dish;
}

export async function updateDish(
  supabase: SupabaseClient,
  id: string,
  data: Partial<DishFormData> & { image_path?: string | null },
): Promise<Dish> {
  const { data: dish, error } = await supabase
    .from("dishes")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return dish as Dish;
}

export async function deleteDish(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadDishImage(
  supabase: SupabaseClient,
  file: File,
  dishId: string,
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${dishId}.${ext}`;

  const { error } = await supabase.storage.from("dishes").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;
  return path;
}

export async function deleteDishImage(
  supabase: SupabaseClient,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from("dishes").remove([path]);
  if (error) throw error;
}

export function getDishImageUrl(supabase: SupabaseClient, path: string): string {
  const { data } = supabase.storage.from("dishes").getPublicUrl(path);
  return data.publicUrl;
}
