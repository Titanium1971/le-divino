import { createClient } from "@supabase/supabase-js";
import { getHoraires, type Horaires } from "@/lib/supabase/horaires";
import { getPublishedFaqs } from "@/lib/supabase/faqs";
import type { Faq } from "@/lib/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type RestaurantContext = {
  hours: Horaires;
  faqs: Faq[];
  conges: string | null;
};

let cache: { data: RestaurantContext; timestamp: number } | null = null;
const TTL = 5 * 60 * 1000; // 5 minutes

export async function getRestaurantContext(): Promise<RestaurantContext> {
  if (cache && Date.now() - cache.timestamp < TTL) {
    return cache.data;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const [hours, faqs, congesResult] = await Promise.all([
    getHoraires(supabase),
    getPublishedFaqs(supabase),
    supabase
      .from("settings")
      .select("value")
      .eq("key", "conges")
      .single()
      .then(({ data }) => (data?.value as string) || null),
  ]);

  const data: RestaurantContext = { hours, faqs, conges: congesResult };
  cache = { data, timestamp: Date.now() };
  return data;
}
