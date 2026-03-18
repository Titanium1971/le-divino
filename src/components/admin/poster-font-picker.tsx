"use client";

import { useEffect } from "react";
import { POSTER_FONTS } from "@/lib/poster-fonts";
import { Label } from "@/components/ui/label";

type Props = {
  selectedFontId: string;
  onFontChange: (fontId: string) => void;
};

export function PosterFontPicker({ selectedFontId, onFontChange }: Props) {
  // Load Google Fonts CSS for preview
  useEffect(() => {
    const families = POSTER_FONTS.map((f) => f.family.replace(/ /g, "+")).join("&family=");
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    link.rel = "stylesheet";
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Police de texte</Label>
      <div className="grid grid-cols-2 gap-2">
        {POSTER_FONTS.map((font) => (
          <button
            key={font.id}
            type="button"
            onClick={() => onFontChange(font.id)}
            className={`rounded-lg border-2 px-3 py-2 text-left transition-all ${
              selectedFontId === font.id
                ? "border-[#C5A55A] bg-[#C5A55A]/10"
                : "border-muted hover:border-muted-foreground/30"
            }`}
          >
            <span
              className="block text-lg leading-tight"
              style={{ fontFamily: `"${font.family}", ${font.category}` }}
            >
              Le Divino
            </span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              {font.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
