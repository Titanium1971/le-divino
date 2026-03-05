import { createClient } from "@/lib/supabase/server";
import { getScreenSlides } from "@/lib/supabase/screen-slides";
import { EcranManager } from "@/components/admin/ecran-manager";

export default async function AdminScreenPage() {
  const supabase = await createClient();
  const slides = await getScreenSlides(supabase);

  return (
    <div>
      <EcranManager initialSlides={slides} />
    </div>
  );
}
