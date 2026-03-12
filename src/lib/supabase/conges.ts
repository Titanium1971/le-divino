import { SupabaseClient } from "@supabase/supabase-js";
import { getSetting } from "./settings";

export type CongesData = {
  actif: boolean;
  message: string;
  dateDebut: string;
  dateFin: string;
};

export async function getConges(
  supabase: SupabaseClient,
  locale: string,
): Promise<CongesData> {
  const [actif, messageFr, messageEn, messageIt, messageEs, messageDe, dateDebut, dateFin] =
    await Promise.all([
      getSetting<boolean>(supabase, "conges_actif"),
      getSetting<string>(supabase, "conges_message_fr"),
      getSetting<string>(supabase, "conges_message_en"),
      getSetting<string>(supabase, "conges_message_it"),
      getSetting<string>(supabase, "conges_message_es"),
      getSetting<string>(supabase, "conges_message_de"),
      getSetting<string>(supabase, "conges_date_debut"),
      getSetting<string>(supabase, "conges_date_fin"),
    ]);

  const messages: Record<string, string | null> = {
    fr: messageFr,
    en: messageEn,
    it: messageIt,
    es: messageEs,
    de: messageDe,
  };

  const message = messages[locale] || messageFr || "";

  return {
    actif: actif ?? false,
    message,
    dateDebut: dateDebut ?? "",
    dateFin: dateFin ?? "",
  };
}
