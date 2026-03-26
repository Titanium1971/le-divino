import { SupabaseClient } from "@supabase/supabase-js";
import type { Faq, FaqFormData } from "@/lib/types/database";

export async function getFaqs(supabase: SupabaseClient): Promise<Faq[]> {
  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as Faq[];
}

export async function getPublishedFaqs(supabase: SupabaseClient): Promise<Faq[]> {
  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("published", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as Faq[];
}

export async function createFaq(
  supabase: SupabaseClient,
  data: FaqFormData,
): Promise<Faq> {
  const { data: faq, error } = await supabase
    .from("faq")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return faq as Faq;
}

export async function updateFaq(
  supabase: SupabaseClient,
  id: string,
  data: Partial<FaqFormData>,
): Promise<Faq> {
  const { data: faq, error } = await supabase
    .from("faq")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return faq as Faq;
}

export async function deleteFaq(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("faq").delete().eq("id", id);
  if (error) throw error;
}
