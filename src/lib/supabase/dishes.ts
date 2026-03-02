import { SupabaseClient } from "@supabase/supabase-js";
import type { Category, CategoryFormData, Dish, DishFormData } from "@/lib/types/database";

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("visible", true)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getAllCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(
  supabase: SupabaseClient,
  data: CategoryFormData,
): Promise<Category> {
  const { data: cat, error } = await supabase
    .from("categories")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return cat as Category;
}

export async function updateCategory(
  supabase: SupabaseClient,
  id: string,
  data: Partial<CategoryFormData>,
): Promise<Category> {
  const { data: cat, error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return cat as Category;
}

export async function deleteCategory(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function updateCategorySortOrders(
  supabase: SupabaseClient,
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  for (const { id, sort_order } of updates) {
    const { error } = await supabase
      .from("categories")
      .update({ sort_order })
      .eq("id", id);
    if (error) throw error;
  }
}

export async function getDishesGrouped(
  supabase: SupabaseClient,
): Promise<{ category: Category; dishes: Dish[] }[]> {
  const [categoriesRes, dishesRes] = await Promise.all([
    supabase.from("categories").select("*").eq("visible", true).order("sort_order"),
    supabase.from("dishes").select("*").order("sort_order"),
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (dishesRes.error) throw dishesRes.error;

  const categories = (categoriesRes.data ?? []) as Category[];
  const dishes = (dishesRes.data ?? []) as Dish[];

  return categories.map((category) => ({
    category,
    dishes: dishes.filter((d) => d.category_id === category.id),
  }));
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
