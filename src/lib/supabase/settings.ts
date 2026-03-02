import { SupabaseClient } from "@supabase/supabase-js";

export async function getSetting<T = unknown>(
  supabase: SupabaseClient,
  key: string,
): Promise<T | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data.value as T;
}

export async function setSetting(
  supabase: SupabaseClient,
  key: string,
  value: unknown,
): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) throw error;
}
