import { createClient } from "@/lib/supabase/server";
import { getMenus, getAllMenuDishes } from "@/lib/supabase/menus";
import { getAllDishes } from "@/lib/supabase/dishes";
import { FormulesManager } from "@/components/admin/formules-manager";

export default async function AdminFormulesPage() {
  const supabase = await createClient();
  const [menus, dishes, menuDishes] = await Promise.all([
    getMenus(supabase),
    getAllDishes(supabase),
    getAllMenuDishes(supabase),
  ]);

  return (
    <div>
      <FormulesManager
        initialMenus={menus}
        initialDishes={dishes}
        initialMenuDishes={menuDishes}
      />
    </div>
  );
}
