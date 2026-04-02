export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { ClientsManager } from "@/components/admin/clients-manager";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("chat_clients")
    .select("*")
    .order("last_visit_date", { ascending: false, nullsFirst: false });

  return (
    <div>
      <ClientsManager initialClients={clients ?? []} />
    </div>
  );
}
