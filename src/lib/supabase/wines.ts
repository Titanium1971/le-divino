import { SupabaseClient } from "@supabase/supabase-js";
import type { Wine, WineFormData, WineColor } from "@/lib/types/database";
import { WINE_COLORS } from "@/lib/types/database";

export type WineGroup = {
  color: WineColor;
  label: string;
  wines: Wine[];
};

export async function getWines(supabase: SupabaseClient): Promise<Wine[]> {
  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Wine[];
}

export function getWinesGrouped(wines: Wine[]): WineGroup[] {
  return WINE_COLORS.map(({ value, label }) => ({
    color: value,
    label,
    wines: wines.filter((w) => w.color === value),
  }));
}

export async function createWine(
  supabase: SupabaseClient,
  data: WineFormData,
): Promise<Wine> {
  const { data: wine, error } = await supabase
    .from("wines")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return wine as Wine;
}

export async function updateWine(
  supabase: SupabaseClient,
  id: string,
  data: Partial<WineFormData>,
): Promise<Wine> {
  const { data: wine, error } = await supabase
    .from("wines")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return wine as Wine;
}

export async function deleteWine(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("wines").delete().eq("id", id);
  if (error) throw error;
}

// ── Wine images ──

export async function uploadWineImage(
  supabase: SupabaseClient,
  file: File,
  wineId: string,
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${wineId}.${ext}`;

  const { error } = await supabase.storage.from("wine-images").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;
  return path;
}

export async function deleteWineImage(
  supabase: SupabaseClient,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from("wine-images").remove([path]);
  if (error) throw error;
}

export function getWineImageUrl(supabase: SupabaseClient, path: string): string {
  const { data } = supabase.storage.from("wine-images").getPublicUrl(path);
  return data.publicUrl;
}
