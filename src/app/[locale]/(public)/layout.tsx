import { SiteHeader } from "@/components/restaurant/site-header";
import { SiteFooter } from "@/components/restaurant/site-footer";
import { ChatWidget } from "@/components/restaurant/chat/chat-widget";
import { useLocale } from "next-intl";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <ChatWidget locale={locale} />
    </>
  );
}
