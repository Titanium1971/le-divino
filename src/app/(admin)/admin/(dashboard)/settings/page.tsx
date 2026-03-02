import { createClient } from "@/lib/supabase/server";
import { getSetting } from "@/lib/supabase/settings";
import { SettingsManager } from "@/components/admin/settings-manager";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const pin = await getSetting<string>(supabase, "service_pin");

  return (
    <div>
      <SettingsManager initialPin={pin ?? "1234"} />
    </div>
  );
}
