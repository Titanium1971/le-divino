import { createClient } from "@/lib/supabase/server";
import { getWines } from "@/lib/supabase/wines";
import { WinesManager } from "@/components/admin/wines-manager";

export default async function AdminWinesPage() {
  const supabase = await createClient();
  const wines = await getWines(supabase);

  return (
    <div>
      <WinesManager initialWines={wines} />
    </div>
  );
}
