import { createClient } from "@/lib/supabase/server";
import { getMenus } from "@/lib/supabase/menus";
import { getDishesGrouped } from "@/lib/supabase/dishes";
import { MenusManager } from "@/components/admin/menus-manager";

export default async function AdminMenusPage() {
  const supabase = await createClient();
  const [menus, dishGroups] = await Promise.all([
    getMenus(supabase),
    getDishesGrouped(supabase),
  ]);

  return (
    <div>
      <MenusManager initialMenus={menus} dishGroups={dishGroups} />
    </div>
  );
}
