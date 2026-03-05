import { createClient } from "@/lib/supabase/server";
import { getGalleryItems } from "@/lib/supabase/gallery";
import { GalleryManager } from "@/components/admin/gallery-manager";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const items = await getGalleryItems(supabase);

  return (
    <div>
      <GalleryManager initialItems={items} />
    </div>
  );
}
