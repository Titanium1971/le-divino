"use client";

import { X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export function ChatHeader({ onClose }: Props) {
  return (
    <div className="flex items-center justify-between bg-brand-dark px-4 py-3">
      <div>
        <h3 className="text-sm font-medium tracking-wide text-brand-cream">
          Concierge Le Divino
        </h3>
        <p className="text-[10px] tracking-wider uppercase text-brand-gold/80">
          Assistant virtuel
        </p>
      </div>
      <button
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full text-brand-cream/60 transition-colors hover:text-brand-cream hover:bg-brand-cream/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
