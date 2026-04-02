"use client";

import { MessageCircle } from "lucide-react";
import { useChat } from "./use-chat";
import { ChatWindow } from "./chat-window";

type Props = {
  locale: string;
};

export function ChatWidget({ locale }: Props) {
  const {
    messages,
    isLoading,
    isOpen,
    isReady,
    clientEmail,
    setOpen,
    setClientEmail,
    sendMessage,
  } = useChat(locale);

  // Don't render until localStorage is loaded
  if (!isReady) return null;

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 h-[520px] w-[380px] max-md:inset-x-0 max-md:bottom-0 max-md:left-0 max-md:h-[85vh] max-md:w-full">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            clientEmail={clientEmail}
            locale={locale}
            onClose={() => setOpen(false)}
            onSend={sendMessage}
            onSetEmail={setClientEmail}
          />
        </div>
      )}

      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark border border-brand-gold/30 shadow-lg transition-all duration-300 hover:scale-105 hover:border-brand-gold/60 md:h-12 md:w-12"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="h-5 w-5 text-brand-gold" />
        </button>
      )}
    </>
  );
}
