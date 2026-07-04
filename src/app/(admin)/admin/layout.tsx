import { redirect } from "next/navigation";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Kill-switch: entire admin back-office disabled (unpaid invoice).
  // Blocks /admin, /admin/login and every /admin/* page.
  // Re-enable by setting ADMIN_ENABLED="true" on Vercel.
  if (process.env.ADMIN_ENABLED !== "true") {
    redirect("/");
  }

  return <>{children}</>;
}
