import { SupabaseClient } from "@supabase/supabase-js";
import type { GalleryItem } from "@/lib/types/database";

export async function getGalleryItems(supabase: SupabaseClient): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as GalleryItem[];
}

export async function getPublishedGalleryItems(supabase: SupabaseClient): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .eq("published", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as GalleryItem[];
}

export async function createGalleryItem(
  supabase: SupabaseClient,
  data: Partial<GalleryItem>,
): Promise<GalleryItem> {
  const { data: item, error } = await supabase
    .from("gallery")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return item as GalleryItem;
}

export async function updateGalleryItem(
  supabase: SupabaseClient,
  id: string,
  data: Partial<GalleryItem>,
): Promise<GalleryItem> {
  const { data: item, error } = await supabase
    .from("gallery")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return item as GalleryItem;
}

export async function deleteGalleryItem(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw error;
}

export async function updateGallerySortOrders(
  supabase: SupabaseClient,
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  for (const { id, sort_order } of updates) {
    const { error } = await supabase
      .from("gallery")
      .update({ sort_order })
      .eq("id", id);
    if (error) throw error;
  }
}

export async function uploadGalleryImage(
  supabase: SupabaseClient,
  file: File,
  itemId: string,
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${itemId}.${ext}`;

  const { error } = await supabase.storage.from("gallery").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;
  return path;
}

export async function deleteGalleryImage(
  supabase: SupabaseClient,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from("gallery").remove([path]);
  if (error) throw error;
}

export function getGalleryImageUrl(supabase: SupabaseClient, path: string): string {
  const { data } = supabase.storage.from("gallery").getPublicUrl(path);
  return data.publicUrl;
}
