import { createClient } from "@/lib/supabase/server";
import { getMenus } from "@/lib/supabase/menus";
import { getDishesGrouped } from "@/lib/supabase/dishes";
import { MenusManager } from "@/components/admin/menus-manager";

export default async function AdminMenusPage() {
  const supabase = await createClient();
  const [menus, groups] = await Promise.all([
    getMenus(supabase),
    getDishesGrouped(supabase),
  ]);

  // Only available dishes
  const availableGroups = groups
    .map((g) => ({ ...g, dishes: g.dishes.filter((d) => d.available) }))
    .filter((g) => g.dishes.length > 0);

  return (
    <div>
      <MenusManager initialMenus={menus} dishGroups={availableGroups} />
    </div>
  );
}
