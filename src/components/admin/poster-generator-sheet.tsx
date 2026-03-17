"use client";

import { useState, useEffect } from "react";
import { getAllTemplates } from "@/lib/poster-templates";
import { assemblePrompt } from "@/lib/gemini";
import type { PosterTemplate, PosterOrientation } from "@/lib/poster-templates/types";
import type { Event, EventType } from "@/lib/types/database";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PosterTemplatePicker } from "./poster-template-picker";
import { PosterPromptEditor } from "./poster-prompt-editor";
import { PosterPreview } from "./poster-preview";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSaved?: () => Promise<void>;
};

type Step = "template" | "configure" | "generate";

export function PosterGeneratorSheet({ open, onOpenChange, event, onSaved }: Props) {
  const templates = getAllTemplates();

  const [step, setStep] = useState<Step>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplate | null>(null);
  const [orientation, setOrientation] = useState<PosterOrientation>("portrait");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [posterId, setPosterId] = useState<string | null>(null);
  const [pushingToScreen, setPushingToScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset on open/close
  useEffect(() => {
    if (!open) return;
    setStep("template");
    setSelectedTemplate(null);
    setOrientation("portrait");
    setVariables({});
    setPrompt("");
    setImageBase64(null);
    setPosterId(null);
    setError(null);
    setSuccessMessage(null);
  }, [open]);

  // Auto-fill variables from event when template is selected
  useEffect(() => {
    if (!selectedTemplate || !event) return;
    const filled: Record<string, string> = {};
    for (const v of selectedTemplate.variables) {
      if (v.defaultFromEvent) {
        switch (v.defaultFromEvent) {
          case "title":
            filled[v.key] = event.title?.fr || "";
            break;
          case "event_date":
            filled[v.key] = event.event_date || "";
            break;
          case "event_time":
            filled[v.key] = event.event_time || "";
            break;
          case "end_time":
            filled[v.key] = event.end_time || "";
            break;
          case "description":
            filled[v.key] = event.description?.fr || "";
            break;
          case "location":
            filled[v.key] = event.location || "";
            break;
        }
      }
    }
    setVariables(filled);
  }, [selectedTemplate, event]);

  function handleSelectTemplate(template: PosterTemplate) {
    setSelectedTemplate(template);
    // Assemble initial prompt
    const vars = event
      ? selectedTemplate?.variables.reduce((acc, v) => {
          if (v.defaultFromEvent === "title") acc[v.key] = event.title?.fr || "";
          if (v.defaultFromEvent === "event_date") acc[v.key] = event.event_date || "";
          return acc;
        }, {} as Record<string, string>) || {}
      : {};
    setPrompt(assemblePrompt(template.aiPromptTemplate, vars));
    setStep("configure");
  }

  function handleVariableChange(key: string, value: string) {
    const updated = { ...variables, [key]: value };
    setVariables(updated);
    // Re-assemble prompt
    if (selectedTemplate) {
      setPrompt(assemblePrompt(selectedTemplate.aiPromptTemplate, updated));
    }
  }

  async function handleGenerate() {
    if (!selectedTemplate || !prompt) return;
    setGenerating(true);
    setError(null);
    setImageBase64(null);
    setStep("generate");

    try {
      const res = await fetch("/api/admin/generate-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          orientation,
          variables,
          prompt,
          eventId: event?.id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de génération");

      setImageBase64(data.imageBase64);
      setPosterId(data.posterId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setStep("configure");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate() {
    await handleGenerate();
  }

  async function handlePushToScreen() {
    if (!posterId) return;
    setPushingToScreen(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/poster-to-screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterId, duration: 15 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSuccessMessage("Affiche ajoutée à l'écran 55\" !");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setPushingToScreen(false);
    }
  }

  async function handleDownload() {
    if (!imageBase64) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageBase64}`;
    const name = variables.eventName || variables.title || "affiche";
    link.download = `Le_Divino_${name.replace(/\s+/g, "_")}_${orientation}.png`;
    link.click();
  }

  async function handleDone() {
    if (onSaved) await onSaved();
    onOpenChange(false);
  }

  const eventType = event?.event_type as EventType | undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {step === "template" && "Choisir un template"}
            {step === "configure" && "Configurer l'affiche"}
            {step === "generate" && "Votre affiche"}
          </SheetTitle>
          <SheetDescription>
            {step === "template" && "Sélectionnez un modèle d'affiche adapté à votre événement."}
            {step === "configure" && "Remplissez les informations et personnalisez le prompt."}
            {step === "generate" && "Prévisualisez, téléchargez ou publiez sur l'écran."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-12rem)] px-4">
          <div className="space-y-6 pb-8 pt-4">
            {/* ── Step 1: Template Selection ── */}
            {step === "template" && (
              <>
                {/* Orientation toggle */}
                <div className="flex items-center gap-4">
                  <Label>Format :</Label>
                  <div className="flex rounded-lg border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOrientation("portrait")}
                      className={`px-4 py-2 text-sm transition-colors ${
                        orientation === "portrait"
                          ? "bg-[#C5A55A] text-white"
                          : "hover:bg-muted"
                      }`}
                    >
                      📱 Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation("landscape")}
                      className={`px-4 py-2 text-sm transition-colors ${
                        orientation === "landscape"
                          ? "bg-[#C5A55A] text-white"
                          : "hover:bg-muted"
                      }`}
                    >
                      🖥️ Paysage
                    </button>
                  </div>
                </div>

                <Separator />

                <PosterTemplatePicker
                  templates={templates}
                  selectedId={selectedTemplate?.id || null}
                  onSelect={handleSelectTemplate}
                  eventType={eventType}
                />
              </>
            )}

            {/* ── Step 2: Configure Variables & Prompt ── */}
            {step === "configure" && selectedTemplate && (
              <>
                {/* Back button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("template")}
                >
                  ← Changer de template
                </Button>

                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{selectedTemplate.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {orientation === "portrait" ? "Portrait 1080×1920" : "Paysage 1920×1080"}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Template variables */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Informations</Label>
                  {selectedTemplate.variables.map((v) => (
                    <div key={v.key} className="space-y-1">
                      <Label htmlFor={`var-${v.key}`} className="text-xs text-muted-foreground">
                        {v.label} {v.required && <span className="text-destructive">*</span>}
                      </Label>
                      {v.type === "textarea" ? (
                        <Textarea
                          id={`var-${v.key}`}
                          value={variables[v.key] || ""}
                          onChange={(e) => handleVariableChange(v.key, e.target.value)}
                          placeholder={v.placeholder}
                          rows={2}
                        />
                      ) : (
                        <Input
                          id={`var-${v.key}`}
                          type={v.type === "date" ? "date" : v.type === "time" ? "time" : "text"}
                          value={variables[v.key] || ""}
                          onChange={(e) => handleVariableChange(v.key, e.target.value)}
                          placeholder={v.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Prompt editor */}
                <PosterPromptEditor
                  prompt={prompt}
                  onPromptChange={setPrompt}
                  templateId={selectedTemplate.id}
                  variables={variables}
                  eventType={eventType}
                />

                {error && <p className="text-sm text-destructive">{error}</p>}
              </>
            )}

            {/* ── Step 3: Preview & Actions ── */}
            {step === "generate" && (
              <>
                <PosterPreview
                  imageBase64={imageBase64}
                  imageUrl={null}
                  orientation={orientation}
                  generating={generating}
                />

                {!generating && imageBase64 && (
                  <div className="space-y-3">
                    {successMessage && (
                      <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                        {successMessage}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRegenerate}
                        disabled={generating}
                      >
                        🔄 Régénérer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDownload}
                      >
                        📥 Télécharger
                      </Button>
                    </div>

                    <Button
                      type="button"
                      onClick={handlePushToScreen}
                      disabled={pushingToScreen || !posterId}
                      className="w-full bg-[#C5A55A] text-white hover:bg-[#B08D3A]"
                    >
                      {pushingToScreen ? "Envoi..." : "📺 Afficher sur écran 55\""}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep("configure")}
                      className="w-full"
                    >
                      ← Modifier les paramètres
                    </Button>
                  </div>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer buttons */}
        <div className="border-t px-4 pt-4">
          {step === "configure" && (
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !prompt}
              className="w-full bg-[#C5A55A] text-white hover:bg-[#B08D3A]"
            >
              {generating ? "Génération en cours..." : "✨ Générer l'affiche"}
            </Button>
          )}
          {step === "generate" && !generating && imageBase64 && (
            <Button
              type="button"
              onClick={handleDone}
              className="w-full"
            >
              Terminé
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
