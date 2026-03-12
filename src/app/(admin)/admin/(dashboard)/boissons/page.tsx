import { createClient } from "@/lib/supabase/server";
import { getDrinks } from "@/lib/supabase/drinks";
import { DrinksManager } from "@/components/admin/drinks-manager";

export default async function AdminDrinksPage() {
  const supabase = await createClient();
  const drinks = await getDrinks(supabase);

  return (
    <div>
      <DrinksManager initialDrinks={drinks} />
    </div>
  );
}
