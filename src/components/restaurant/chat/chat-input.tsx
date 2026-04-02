"use client";

import { useState, useCallback } from "react";
import { Send } from "lucide-react";

type Props = {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder: string;
};

export function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [text, setText] = useState("");

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  }, [text, disabled, onSend]);

  return (
    <div className="border-t border-brand-gold/20 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-full border border-brand-gold/30 bg-brand-cream/50 px-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/40 outline-none focus:border-brand-gold/60 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-bordeaux text-brand-cream transition-colors hover:bg-brand-bordeaux/90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
