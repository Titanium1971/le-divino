"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { randomUUID } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function getStoredClientName(): string | undefined {
  try {
    return localStorage.getItem("divino-chat-name") || undefined;
  } catch {
    return undefined;
  }
}

type UseChatReturn = {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  isReady: boolean;
  clientEmail: string | null;
  setOpen: (open: boolean) => void;
  setClientEmail: (email: string, name: string) => void;
  sendMessage: (text: string) => Promise<void>;
};

export function useChat(locale: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [clientEmail, setClientEmailState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const sessionIdRef = useRef<string>("");

  // Initialize session ID + restore email
  useEffect(() => {
    // Storage access can throw on iOS Safari (private mode, content blockers, ITP).
    // Fail open: keep an in-memory session ID so the rest of the app keeps working.
    try {
      let id = sessionStorage.getItem("divino-chat-session");
      if (!id) {
        id = randomUUID();
        sessionStorage.setItem("divino-chat-session", id);
      }
      sessionIdRef.current = id;
    } catch {
      sessionIdRef.current = randomUUID();
    }

    try {
      const savedEmail = localStorage.getItem("divino-chat-email");
      if (savedEmail) setClientEmailState(savedEmail);
    } catch {
      // Ignore — user can re-enter email if needed.
    }

    setIsReady(true);
  }, []);

  const setClientEmail = useCallback((email: string, name: string) => {
    setClientEmailState(email);
    try {
      localStorage.setItem("divino-chat-email", email);
      localStorage.setItem("divino-chat-name", name);
    } catch {
      // Ignore — email is still kept in component state for the session.
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: randomUUID(),
        role: "user",
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const assistantId = randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            message: text.trim(),
            locale,
            clientEmail,
            clientName: getStoredClientName(),
          }),
        });

        if (!response.ok) {
          throw new Error("API error");
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "text") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + event.content }
                      : m,
                  ),
                );
              } else if (event.type === "error") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: event.content }
                      : m,
                  ),
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Désolé, une erreur est survenue. Veuillez réessayer.",
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, locale, clientEmail],
  );

  return {
    messages,
    isLoading,
    isOpen,
    isReady,
    clientEmail,
    setOpen,
    setClientEmail,
    sendMessage,
  };
}
