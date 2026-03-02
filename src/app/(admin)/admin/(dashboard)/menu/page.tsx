import { createClient } from "@/lib/supabase/server";
import { getDishesGrouped, getAllCategories } from "@/lib/supabase/dishes";
import { DishesManager } from "@/components/admin/dishes-manager";

export default async function AdminMenuPage() {
  const supabase = await createClient();
  const [groups, categories] = await Promise.all([
    getDishesGrouped(supabase),
    getAllCategories(supabase),
  ]);

  return (
    <div>
      <DishesManager initialGroups={groups} categories={categories} />
    </div>
  );
}
