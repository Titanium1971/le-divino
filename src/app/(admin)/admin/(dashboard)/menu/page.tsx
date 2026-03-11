import { createClient } from "@/lib/supabase/server";
import { getDishesGrouped } from "@/lib/supabase/dishes";
import { DishesManager } from "@/components/admin/dishes-manager";

export default async function AdminMenuPage() {
  const supabase = await createClient();
  const groups = await getDishesGrouped(supabase);

  return (
    <div>
      <DishesManager initialGroups={groups} />
    </div>
  );
}
