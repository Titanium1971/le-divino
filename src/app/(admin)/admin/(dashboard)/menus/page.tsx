import { createClient } from "@/lib/supabase/server";
import { getMenus } from "@/lib/supabase/menus";
import { MenusManager } from "@/components/admin/menus-manager";

export default async function AdminMenusPage() {
  const supabase = await createClient();
  const menus = await getMenus(supabase);

  return (
    <div>
      <MenusManager initialMenus={menus} />
    </div>
  );
}
