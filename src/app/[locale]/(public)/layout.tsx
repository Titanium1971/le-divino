import { SiteHeader } from "@/components/restaurant/site-header";
import { SiteFooter } from "@/components/restaurant/site-footer";
import { ChatWidget } from "@/components/restaurant/chat/chat-widget";
import { useLocale } from "next-intl";

const CHAT_ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      {CHAT_ENABLED && <ChatWidget locale={locale} />}
    </>
  );
}
