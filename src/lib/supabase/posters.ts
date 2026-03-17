import { SupabaseClient } from "@supabase/supabase-js";
import type { PosterGeneration, PosterGenerationFormData } from "@/lib/poster-templates/types";

export async function getPosters(supabase: SupabaseClient): Promise<PosterGeneration[]> {
  const { data, error } = await supabase
    .from("poster_generations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PosterGeneration[];
}

export async function getPoster(supabase: SupabaseClient, id: string): Promise<PosterGeneration> {
  const { data, error } = await supabase
    .from("poster_generations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PosterGeneration;
}

export async function createPoster(
  supabase: SupabaseClient,
  data: PosterGenerationFormData,
): Promise<PosterGeneration> {
  const { data: poster, error } = await supabase
    .from("poster_generations")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return poster as PosterGeneration;
}

export async function updatePoster(
  supabase: SupabaseClient,
  id: string,
  data: Partial<PosterGeneration>,
): Promise<PosterGeneration> {
  const { data: poster, error } = await supabase
    .from("poster_generations")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return poster as PosterGeneration;
}

export async function deletePoster(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("poster_generations").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleFavorite(supabase: SupabaseClient, id: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from("poster_generations")
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ── Poster images ──

export async function uploadPosterImage(
  supabase: SupabaseClient,
  file: File,
  posterId: string,
): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${posterId}.${ext}`;

  const { error } = await supabase.storage.from("posters").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;
  return path;
}

export async function deletePosterImage(supabase: SupabaseClient, path: string): Promise<void> {
  const { error } = await supabase.storage.from("posters").remove([path]);
  if (error) throw error;
}

export function getPosterImageUrl(supabase: SupabaseClient, path: string): string {
  const { data } = supabase.storage.from("posters").getPublicUrl(path);
  return data.publicUrl;
}
