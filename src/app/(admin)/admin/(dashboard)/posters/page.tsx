import { createClient } from "@/lib/supabase/server";
import { getPosters } from "@/lib/supabase/posters";
import { PostersManager } from "@/components/admin/posters-manager";
import type { PosterGeneration } from "@/lib/poster-templates/types";

export default async function AdminPostersPage() {
  const supabase = await createClient();
  let posters: PosterGeneration[] = [];
  try {
    posters = await getPosters(supabase);
  } catch {
    // Table may not exist yet
  }

  return (
    <div>
      <PostersManager initialPosters={posters} />
    </div>
  );
}
