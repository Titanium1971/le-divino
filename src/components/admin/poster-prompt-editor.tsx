"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  templateId: string;
  variables: Record<string, string>;
  eventType?: string;
};

export function PosterPromptEditor({
  prompt,
  onPromptChange,
  templateId,
  variables,
  eventType,
}: Props) {
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSuggest() {
    setSuggesting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-poster-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, variables, eventType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      if (data.prompt) onPromptChange(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Prompt de génération</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={suggesting}
          className="border-[#C5A55A]/50 text-xs text-[#C5A55A] hover:bg-[#C5A55A]/10"
        >
          {suggesting ? "Amélioration..." : "Améliorer avec IA"}
        </Button>
      </div>
      <Textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={5}
        className="text-sm"
        placeholder="Décrivez l'affiche souhaitée..."
      />
      <p className="text-[11px] text-muted-foreground">
        Le prompt sera envoyé à Gemini Imagen 3. Vous pouvez le modifier librement.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
