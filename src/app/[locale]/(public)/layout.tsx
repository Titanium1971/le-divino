import { SiteHeader } from "@/components/restaurant/site-header";
import { SiteFooter } from "@/components/restaurant/site-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
    </>
  );
}
