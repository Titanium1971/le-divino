import { SupabaseClient } from "@supabase/supabase-js";
import { getSetting } from "./settings";
import { restaurantConfig } from "@/restaurant.config";

export type DayHoraires = {
  ouvert: boolean;
  debut: string;
  fin: string;
};

export type Horaires = {
  lundi: DayHoraires;
  mardi: DayHoraires;
  mercredi: DayHoraires;
  jeudi: DayHoraires;
  vendredi: DayHoraires;
  samedi: DayHoraires;
  dimanche: DayHoraires;
};

const DAY_KEYS: (keyof Horaires)[] = [
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
];

/** Build default horaires from restaurant.config.ts */
function defaultHoraires(): Horaires {
  const result = {} as Horaires;
  restaurantConfig.hours.forEach((h, i) => {
    result[DAY_KEYS[i]] = {
      ouvert: !!h.open,
      debut: h.open || "",
      fin: h.close || "",
    };
  });
  return result;
}

/** Fetch horaires from DB, falling back to restaurant.config.ts */
export async function getHoraires(supabase: SupabaseClient): Promise<Horaires> {
  const stored = await getSetting<Horaires>(supabase, "horaires");
  return stored ?? defaultHoraires();
}
