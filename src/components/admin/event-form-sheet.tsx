"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createEvent, updateEvent, uploadEventImage, getEventImageUrl } from "@/lib/supabase/events";
import type { Event, EventFormData, I18nField, Locale, EventType } from "@/lib/types/database";
import { EVENT_TYPES } from "@/lib/types/database";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const LOCALES: { key: Locale; label: string }[] = [
  { key: "fr", label: "FR" },
  { key: "en", label: "EN" },
  { key: "it", label: "IT" },
  { key: "es", label: "ES" },
  { key: "de", label: "DE" },
];

const emptyI18n = (): I18nField => ({ fr: "", en: "", it: "", es: "", de: "" });

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onSaved: () => Promise<void>;
};

export function EventFormSheet({ open, onOpenChange, event, onSaved }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!event;

  const [title, setTitle] = useState<I18nField>(emptyI18n());
  const [description, setDescription] = useState<I18nField>(emptyI18n());
  const [type, setType] = useState<EventType>("concert");
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [showOnScreen, setShowOnScreen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setTitle(event.title ?? emptyI18n());
      setDescription(event.description ?? emptyI18n());
      setType(event.event_type);
      setDate(event.event_date);
      setTimeStart(event.event_time ?? "");
      setTimeEnd(event.end_time ?? "");
      setIsFeatured(event.is_featured);
      setShowOnScreen(event.show_on_screen);
      setIsActive(event.is_active);
      setImageFile(null);
      setImagePreview(event.image_path ? getEventImageUrl(supabase, event.image_path) : null);
    } else {
      setTitle(emptyI18n());
      setDescription(emptyI18n());
      setType("concert");
      setDate("");
      setTimeStart("");
      setTimeEnd("");
      setIsFeatured(false);
      setShowOnScreen(false);
      setIsActive(true);
      setImageFile(null);
      setImagePreview(null);
    }
    setGeneratedImageBase64(null);
    setError(null);
  }, [event, open, supabase]);

  function updateI18n(
    setter: React.Dispatch<React.SetStateAction<I18nField>>,
    locale: Locale,
    value: string,
  ) {
    setter((prev) => ({ ...prev, [locale]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setGeneratedImageBase64(null);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleGenerate() {
    if (!title.fr) {
      setError("Saisissez un titre avant de générer.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-event-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title.fr, eventType: type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de génération");

      if (data.name) setTitle((prev) => ({ ...prev, fr: data.name }));
      if (data.description_fr) setDescription((prev) => ({ ...prev, fr: data.description_fr }));
      if (data.imageBase64) {
        setGeneratedImageBase64(data.imageBase64);
        setImageFile(null);
        setImagePreview(`data:image/png;base64,${data.imageBase64}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération IA.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleTranslate() {
    if (!title.fr) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title.fr, description: description.fr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      const newTitle: I18nField = {
        ...title,
        en: data.name?.en || title.en,
        it: data.name?.it || title.it,
        es: data.name?.es || title.es,
        de: data.name?.de || title.de,
      };
      const newDesc: I18nField = {
        ...description,
        en: data.description?.en || description.en,
        it: data.description?.it || description.it,
        es: data.description?.es || description.es,
        de: data.description?.de || description.de,
      };

      setTitle(newTitle);
      setDescription(newDesc);

      // Auto-save translations to DB when editing
      if (isEdit && event) {
        await updateEvent(supabase, event.id, { title: newTitle, description: newDesc });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la traduction automatique.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.fr || !date || !timeStart || !timeEnd) {
      setError("Titre (FR), date et horaires sont obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const slug = title.fr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const formData: EventFormData = {
        title,
        slug,
        description,
        event_type: type,
        event_date: date,
        event_time: timeStart,
        end_time: timeEnd,
        location: "",
        is_featured: isFeatured,
        show_on_screen: showOnScreen,
        is_active: isActive,
      };

      let saved: Event;
      if (isEdit) {
        saved = await updateEvent(supabase, event.id, formData);
      } else {
        saved = await createEvent(supabase, formData);
      }

      if (generatedImageBase64) {
        try {
          const byteArray = Uint8Array.from(atob(generatedImageBase64), (c) => c.charCodeAt(0));
          const blob = new Blob([byteArray], { type: "image/png" });
          const file = new File([blob], `${saved.id}.png`, { type: "image/png" });
          const path = await uploadEventImage(supabase, file, saved.id);
          await updateEvent(supabase, saved.id, { image_path: path });
          setGeneratedImageBase64(null);
        } catch (imgErr) {
          console.error("Upload generated image failed:", imgErr);
        }
      } else if (imageFile) {
        const path = await uploadEventImage(supabase, imageFile, saved.id);
        await updateEvent(supabase, saved.id, { image_path: path });
      }

      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier l'événement" : "Ajouter un événement"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations de l'événement."
              : "Remplissez les informations du nouvel événement."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-12rem)] px-4">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            {/* ── Type & Date ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type d&apos;événement</Label>
                <Select value={type} onValueChange={(v) => setType(v as EventType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ── Times ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time-start">Heure début</Label>
                <Input
                  id="time-start"
                  type="time"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-end">Heure fin</Label>
                <Input
                  id="time-end"
                  type="time"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ── AI Generation ── */}
            <div className="flex items-center justify-between rounded-md border border-dashed border-amber-500/50 bg-amber-50/50 p-3">
              <div className="flex-1 pr-3">
                <p className="text-sm font-medium text-amber-900">Générer avec IA</p>
                <p className="text-xs text-amber-700">
                  Description engageante et affiche événement.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={generating || !title.fr}
                className="shrink-0 border-amber-500 text-amber-700 hover:bg-amber-100"
              >
                {generating ? "Génération..." : "Générer"}
              </Button>
            </div>

            {/* ── Translate button ── */}
            <div className="flex items-center justify-between rounded-md border border-dashed p-3">
              <p className="text-xs text-muted-foreground">
                Remplissez le français, puis traduisez automatiquement.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={translating || !title.fr}
              >
                {translating ? "Traduction..." : "Traduire FR \u2192 EN/IT/ES/DE"}
              </Button>
            </div>

            {/* ── Title i18n ── */}
            <div className="space-y-2">
              <Label>Titre</Label>
              <Tabs defaultValue="fr">
                <TabsList className="w-full">
                  {LOCALES.map((l) => (
                    <TabsTrigger key={l.key} value={l.key} className="flex-1">
                      {l.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LOCALES.map((l) => (
                  <TabsContent key={l.key} value={l.key}>
                    <Input
                      value={title[l.key]}
                      onChange={(e) => updateI18n(setTitle, l.key, e.target.value)}
                      placeholder={`Titre (${l.label})`}
                      required={l.key === "fr"}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* ── Description i18n ── */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Tabs defaultValue="fr">
                <TabsList className="w-full">
                  {LOCALES.map((l) => (
                    <TabsTrigger key={l.key} value={l.key} className="flex-1">
                      {l.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LOCALES.map((l) => (
                  <TabsContent key={l.key} value={l.key}>
                    <Textarea
                      value={description[l.key]}
                      onChange={(e) => updateI18n(setDescription, l.key, e.target.value)}
                      placeholder={`Description (${l.label})`}
                      rows={3}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* ── Photo ── */}
            <div className="space-y-2">
              <Label>Photo / Affiche</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {imagePreview && (
                    <Image
                      src={imagePreview}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized={imagePreview.startsWith("blob:")}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    {imagePreview ? "Changer la photo" : "Ajouter une photo"}
                  </Button>
                  {generatedImageBase64 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        setGeneratedImageBase64(null);
                        setImagePreview(null);
                      }}
                    >
                      Retirer l&apos;image IA
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Toggles ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Mise en avant</Label>
                  <p className="text-xs text-muted-foreground">Afficher en haut de la page</p>
                </div>
                <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="screen">Écran 55&quot;</Label>
                  <p className="text-xs text-muted-foreground">Afficher sur l&apos;écran du restaurant</p>
                </div>
                <Switch id="screen" checked={showOnScreen} onCheckedChange={setShowOnScreen} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Actif</Label>
                <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            {/* ── Error ── */}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        {/* ── Submit ── */}
        <div className="border-t px-4 pt-4">
          <Button type="submit" form="event-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'événement"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
