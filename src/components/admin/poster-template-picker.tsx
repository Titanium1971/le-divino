"use client";

import type { PosterTemplate } from "@/lib/poster-templates/types";
import type { EventType } from "@/lib/types/database";

type Props = {
  templates: PosterTemplate[];
  selectedId: string | null;
  onSelect: (template: PosterTemplate) => void;
  eventType?: EventType;
};

export function PosterTemplatePicker({ templates, selectedId, onSelect, eventType }: Props) {
  // Sort: matching event type first, then the rest
  const sorted = eventType
    ? [...templates].sort((a, b) => {
        const aMatch = a.eventTypes.includes(eventType) ? 0 : 1;
        const bMatch = b.eventTypes.includes(eventType) ? 0 : 1;
        return aMatch - bMatch;
      })
    : templates;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {sorted.map((template) => {
        const isSelected = selectedId === template.id;
        const isRecommended = eventType && template.eventTypes.includes(eventType);

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className={`relative rounded-lg border-2 p-3 text-left transition-all hover:shadow-md ${
              isSelected
                ? "border-[#C5A55A] bg-[#C5A55A]/5 shadow-md"
                : "border-transparent bg-muted/50 hover:border-[#C5A55A]/30"
            }`}
          >
            {isRecommended && (
              <span className="absolute -top-2 -right-2 rounded-full bg-[#C5A55A] px-1.5 py-0.5 text-[9px] font-medium text-white">
                Recommandé
              </span>
            )}
            <div className="mb-2 text-2xl">{template.icon}</div>
            <p className="text-sm font-medium leading-tight">{template.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
              {template.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
