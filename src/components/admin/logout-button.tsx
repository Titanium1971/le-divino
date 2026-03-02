"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-2 w-full rounded-md px-3 py-1.5 text-left text-xs font-light text-[#f5f0eb]/50 transition-colors hover:bg-[#f5f0eb]/5 hover:text-[#f5f0eb]"
    >
      Se déconnecter
    </button>
  );
}
