"use client";

import { useState, useEffect } from "react";
import { getAllTemplates } from "@/lib/poster-templates";
import { assemblePrompt } from "@/lib/gemini";
import { renderPosterComposite } from "@/lib/poster-canvas-renderer";
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
import { PosterFontPicker } from "./poster-font-picker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSaved?: () => Promise<void>;
  onPosterSelected?: (imageBase64: string) => void;
};

type Step = "template" | "configure" | "generate";
type GenerationMode = "canvas" | "full";

export function PosterGeneratorSheet({ open, onOpenChange, event, onSaved, onPosterSelected }: Props) {
  const templates = getAllTemplates();

  const [step, setStep] = useState<Step>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplate | null>(null);
  const [orientation, setOrientation] = useState<PosterOrientation>("portrait");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("canvas");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState("");
  const [fontId, setFontId] = useState("playfair-display");
  const [generating, setGenerating] = useState(false);
  const [backgroundBase64, setBackgroundBase64] = useState<string | null>(null);
  const [compositeBase64, setCompositeBase64] = useState<string | null>(null);
  const [posterId, setPosterId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pushingToScreen, setPushingToScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset on open/close
  useEffect(() => {
    if (!open) return;
    setStep("template");
    setSelectedTemplate(null);
    setOrientation("portrait");
    setGenerationMode("canvas");
    setVariables({});
    setPrompt("");
    setFontId("playfair-display");
    setBackgroundBase64(null);
    setCompositeBase64(null);
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
    const vars = event
      ? template.variables.reduce((acc, v) => {
          if (v.defaultFromEvent === "title") acc[v.key] = event.title?.fr || "";
          if (v.defaultFromEvent === "event_date") acc[v.key] = event.event_date || "";
          return acc;
        }, {} as Record<string, string>)
      : {};
    setPrompt(assemblePrompt(template.aiPromptTemplate, vars));
    setStep("configure");
  }

  function handleVariableChange(key: string, value: string) {
    const updated = { ...variables, [key]: value };
    setVariables(updated);
    if (selectedTemplate) {
      setPrompt(assemblePrompt(selectedTemplate.aiPromptTemplate, updated));
    }
  }

  // Generate background only (no text)
  async function handleGenerate() {
    if (!selectedTemplate || !prompt) return;
    setGenerating(true);
    setError(null);
    setBackgroundBase64(null);
    setCompositeBase64(null);
    setPosterId(null);
    setStep("generate");

    try {
      const res = await fetch("/api/admin/generate-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          orientation,
          prompt,
          mode: generationMode,
          variables: generationMode === "full" ? variables : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de génération");

      setBackgroundBase64(data.backgroundBase64);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setStep("configure");
    } finally {
      setGenerating(false);
    }
  }

  // Finalize: composite at full resolution + save to Supabase
  async function handleFinalize() {
    if (!backgroundBase64 || !selectedTemplate) return;
    setSaving(true);
    setError(null);

    try {
      // Render full-resolution composite
      const fullComposite = await renderPosterComposite({
        backgroundBase64,
        variables,
        template: selectedTemplate,
        orientation,
        fontId,
        scale: 1,
      });

      setCompositeBase64(fullComposite);

      // Save to Supabase
      const res = await fetch("/api/admin/save-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compositeBase64: fullComposite,
          templateId: selectedTemplate.id,
          orientation,
          variables,
          prompt,
          eventId: event?.id || null,
          fontId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de sauvegarde");

      setPosterId(data.posterId);
      setSuccessMessage("Affiche finalisée et sauvegardée !");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  // Finalize for "full" mode: image is already complete, just save it
  async function handleFinalizeFull() {
    if (!backgroundBase64 || !selectedTemplate) return;
    setSaving(true);
    setError(null);

    try {
      setCompositeBase64(backgroundBase64);

      const res = await fetch("/api/admin/save-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compositeBase64: backgroundBase64,
          templateId: selectedTemplate.id,
          orientation,
          variables,
          prompt,
          eventId: event?.id || null,
          fontId: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de sauvegarde");

      setPosterId(data.posterId);
      setSuccessMessage("Affiche finalisée et sauvegardée !");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
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
    const base64 = compositeBase64 || backgroundBase64;
    if (!base64) return;

    let downloadBase64 = base64;
    // In canvas mode, render full resolution composite if not finalized yet
    if (generationMode === "canvas" && !compositeBase64 && selectedTemplate) {
      downloadBase64 = await renderPosterComposite({
        backgroundBase64: backgroundBase64!,
        variables,
        template: selectedTemplate,
        orientation,
        fontId,
        scale: 1,
      });
    }

    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${downloadBase64}`;
    const name = variables.eventName || variables.title || "affiche";
    link.download = `Le_Divino_${name.replace(/\s+/g, "_")}_${orientation}.jpg`;
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
            {step === "generate" && "Ajustez la police et le texte, puis finalisez."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-12rem)] px-4">
          <div className="space-y-6 pb-8 pt-4">
            {/* ── Step 1: Template Selection ── */}
            {step === "template" && (
              <>
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

                {/* Generation mode selector */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Mode de génération</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGenerationMode("canvas")}
                      className={`rounded-lg border-2 p-3 text-left transition-all ${
                        generationMode === "canvas"
                          ? "border-[#C5A55A] bg-[#C5A55A]/10"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                    >
                      <span className="block text-sm font-medium">Fond + Texte</span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        IA génère le fond, texte ajouté avec police au choix
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode("full")}
                      className={`rounded-lg border-2 p-3 text-left transition-all ${
                        generationMode === "full"
                          ? "border-[#C5A55A] bg-[#C5A55A]/10"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                    >
                      <span className="block text-sm font-medium">Complète (IA)</span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        IA génère l&apos;affiche entière avec les textes
                      </span>
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Font picker — only for canvas mode */}
                {generationMode === "canvas" && (
                  <>
                    <PosterFontPicker selectedFontId={fontId} onFontChange={setFontId} />
                    <Separator />
                  </>
                )}

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
                {generationMode === "canvas" ? (
                  <PosterPreview
                    backgroundBase64={backgroundBase64}
                    compositeBase64={compositeBase64}
                    orientation={orientation}
                    generating={generating}
                    template={selectedTemplate}
                    variables={variables}
                    fontId={fontId}
                  />
                ) : (
                  <PosterPreview
                    backgroundBase64={null}
                    compositeBase64={backgroundBase64}
                    orientation={orientation}
                    generating={generating}
                    template={null}
                    variables={{}}
                    fontId={fontId}
                  />
                )}

                {!generating && backgroundBase64 && (
                  <div className="space-y-3">
                    {successMessage && (
                      <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                        {successMessage}
                      </p>
                    )}

                    {/* Font picker in generate step — only for canvas mode */}
                    {generationMode === "canvas" && !compositeBase64 && (
                      <>
                        <PosterFontPicker selectedFontId={fontId} onFontChange={(id) => {
                          setFontId(id);
                          setCompositeBase64(null); // reset composite to re-preview
                        }} />
                        <Separator />
                      </>
                    )}

                    {/* Variable editing for text adjustments — only for canvas mode */}
                    {generationMode === "canvas" && !compositeBase64 && selectedTemplate && (
                      <details className="rounded-lg border p-3">
                        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                          Modifier les textes
                        </summary>
                        <div className="mt-3 space-y-2">
                          {selectedTemplate.variables.map((v) => (
                            <div key={v.key} className="space-y-1">
                              <Label htmlFor={`gen-var-${v.key}`} className="text-xs text-muted-foreground">
                                {v.label}
                              </Label>
                              <Input
                                id={`gen-var-${v.key}`}
                                type={v.type === "date" ? "date" : v.type === "time" ? "time" : "text"}
                                value={variables[v.key] || ""}
                                onChange={(e) => {
                                  setVariables((prev) => ({ ...prev, [v.key]: e.target.value }));
                                  setCompositeBase64(null);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerate}
                        disabled={generating}
                      >
                        {generationMode === "full" ? "🔄 Régénérer" : "🔄 Nouveau fond"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDownload}
                      >
                        📥 Télécharger
                      </Button>
                    </div>

                    {/* Finalize button */}
                    {!posterId && (
                      <Button
                        type="button"
                        onClick={generationMode === "full" ? handleFinalizeFull : handleFinalize}
                        disabled={saving}
                        className="w-full bg-[#C5A55A] text-white hover:bg-[#B08D3A]"
                      >
                        {saving ? "Finalisation..." : "Finaliser et sauvegarder"}
                      </Button>
                    )}

                    {/* Post-finalize actions */}
                    {posterId && (
                      <>
                        {onPosterSelected && (
                          <Button
                            type="button"
                            onClick={() => {
                              const finalBase64 = compositeBase64 || backgroundBase64;
                              if (finalBase64) {
                                onPosterSelected(finalBase64);
                                onOpenChange(false);
                              }
                            }}
                            className="w-full bg-green-600 text-white hover:bg-green-700"
                          >
                            Utiliser comme image de l&apos;événement
                          </Button>
                        )}

                        <Button
                          type="button"
                          onClick={handlePushToScreen}
                          disabled={pushingToScreen || !posterId}
                          className="w-full bg-[#C5A55A] text-white hover:bg-[#B08D3A]"
                        >
                          {pushingToScreen ? "Envoi..." : "📺 Afficher sur écran 55\""}
                        </Button>
                      </>
                    )}

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
              {generating ? "Génération en cours..." : generationMode === "full" ? "✨ Générer l'affiche" : "✨ Générer le fond"}
            </Button>
          )}
          {step === "generate" && !generating && posterId && (
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
