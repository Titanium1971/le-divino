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
      className="admin-focus mt-2 w-full rounded-md px-3 py-1.5 text-left text-xs font-light text-[#FAF6F0]/40 transition-colors duration-200 hover:bg-[#C5A55A]/8 hover:text-[#FAF6F0]/70"
    >
      Se déconnecter
    </button>
  );
}
