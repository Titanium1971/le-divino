import { createClient } from "@/lib/supabase/server";
import { getFaqs } from "@/lib/supabase/faqs";
import { FaqsManager } from "@/components/admin/faqs-manager";

export default async function AdminFaqPage() {
  const supabase = await createClient();
  const faqs = await getFaqs(supabase);

  return (
    <div>
      <FaqsManager initialFaqs={faqs} />
    </div>
  );
}
