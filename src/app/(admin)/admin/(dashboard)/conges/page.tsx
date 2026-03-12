import { createClient } from "@/lib/supabase/server";
import { getSetting } from "@/lib/supabase/settings";
import { CongesManager } from "@/components/admin/conges-manager";

export const dynamic = "force-dynamic";

export default async function CongesPage() {
  const supabase = await createClient();

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

  return (
    <CongesManager
      initialActif={actif ?? false}
      initialMessageFr={messageFr ?? ""}
      initialMessageEn={messageEn ?? ""}
      initialMessageIt={messageIt ?? ""}
      initialMessageEs={messageEs ?? ""}
      initialMessageDe={messageDe ?? ""}
      initialDateDebut={dateDebut ?? ""}
      initialDateFin={dateFin ?? ""}
    />
  );
}
