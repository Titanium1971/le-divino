import { SupabaseClient } from "@supabase/supabase-js";
import type { ScreenSlide } from "@/lib/types/database";

export async function getScreenSlides(supabase: SupabaseClient): Promise<ScreenSlide[]> {
  const { data, error } = await supabase
    .from("screen_slides")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as ScreenSlide[];
}

export async function getActiveScreenSlides(supabase: SupabaseClient): Promise<ScreenSlide[]> {
  const { data, error } = await supabase
    .from("screen_slides")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as ScreenSlide[];
}

export async function createScreenSlide(
  supabase: SupabaseClient,
  data: Partial<ScreenSlide>,
): Promise<ScreenSlide> {
  const { data: slide, error } = await supabase
    .from("screen_slides")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return slide as ScreenSlide;
}

export async function updateScreenSlide(
  supabase: SupabaseClient,
  id: string,
  data: Partial<ScreenSlide>,
): Promise<ScreenSlide> {
  const { data: slide, error } = await supabase
    .from("screen_slides")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return slide as ScreenSlide;
}

export async function deleteScreenSlide(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("screen_slides").delete().eq("id", id);
  if (error) throw error;
}

export async function updateSlideSortOrders(
  supabase: SupabaseClient,
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  for (const { id, sort_order } of updates) {
    const { error } = await supabase
      .from("screen_slides")
      .update({ sort_order })
      .eq("id", id);
    if (error) throw error;
  }
}
