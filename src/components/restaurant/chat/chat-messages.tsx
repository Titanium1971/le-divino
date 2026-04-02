"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  messages: Message[];
};

export function ChatMessages({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((m) => (
        <ChatMessage key={m.id} role={m.role} content={m.content} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
