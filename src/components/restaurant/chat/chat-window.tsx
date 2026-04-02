"use client";

import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { EmailPrompt } from "./email-prompt";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  messages: Message[];
  isLoading: boolean;
  clientEmail: string | null;
  locale: string;
  onClose: () => void;
  onSend: (text: string) => void;
  onSetEmail: (email: string, name: string) => void;
};

const PLACEHOLDERS: Record<string, string> = {
  fr: "Posez votre question...",
  en: "Ask your question...",
  it: "Fai la tua domanda...",
  es: "Haga su pregunta...",
  de: "Stellen Sie Ihre Frage...",
};

export function ChatWindow({
  messages,
  isLoading,
  clientEmail,
  locale,
  onClose,
  onSend,
  onSetEmail,
}: Props) {
  const showEmailPrompt = !clientEmail;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-brand-cream shadow-2xl border border-brand-gold/10 max-md:rounded-none max-md:rounded-t-2xl">
      <ChatHeader onClose={onClose} />

      {showEmailPrompt ? (
        <EmailPrompt locale={locale} onSubmit={(email, name) => onSetEmail(email, name)} />
      ) : (
        <>
          <ChatMessages messages={messages} />
          <ChatInput
            onSend={onSend}
            disabled={isLoading}
            placeholder={PLACEHOLDERS[locale] || PLACEHOLDERS.fr}
          />
        </>
      )}
    </div>
  );
}
