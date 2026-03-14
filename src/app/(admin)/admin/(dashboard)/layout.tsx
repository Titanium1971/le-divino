import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-theme flex min-h-screen flex-col md:flex-row">
      <AdminSidebar userEmail={user.email ?? ""} />
      <main className="admin-scrollbar flex-1 overflow-y-auto bg-[#F5EFE8] p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
