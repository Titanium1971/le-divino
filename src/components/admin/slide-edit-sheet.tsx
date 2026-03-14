"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createScreenSlide, updateScreenSlide } from "@/lib/supabase/screen-slides";
import type { ScreenSlide, SlideType } from "@/lib/types/database";
import { SLIDE_TYPES } from "@/lib/types/database";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: ScreenSlide | null;
  onSaved: () => Promise<void>;
  maxSortOrder: number;
};

export function SlideEditSheet({ open, onOpenChange, slide, onSaved, maxSortOrder }: Props) {
  const supabase = createClient();
  const isEdit = !!slide;

  const [type, setType] = useState<SlideType>("custom");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [durationSec, setDurationSec] = useState("15");
  const [active, setActive] = useState(true);
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slide) {
      setType(slide.type);
      setTitle(slide.title ?? "");
      setSubtitle(slide.subtitle ?? "");
      setDurationSec(String(Math.round(slide.duration_ms / 1000)));
      setActive(slide.active);
      setScheduleStart(slide.schedule_start?.slice(0, 5) ?? "");
      setScheduleEnd(slide.schedule_end?.slice(0, 5) ?? "");
      setReferenceId(slide.reference_id ?? "");
      setImagePath(slide.image_path ?? "");
      setCustomBody((slide.content as Record<string, string>)?.body ?? "");
    } else {
      setType("custom");
      setTitle("");
      setSubtitle("");
      setDurationSec("15");
      setActive(true);
      setScheduleStart("");
      setScheduleEnd("");
      setReferenceId("");
      setImagePath("");
      setCustomBody("");
    }
    setError(null);
  }, [slide, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title && type !== "gallery") {
      setError("Le titre est obligatoire.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data: Partial<ScreenSlide> = {
        type,
        title: title || null,
        subtitle: subtitle || null,
        duration_ms: Math.max(1, parseInt(durationSec) || 15) * 1000,
        active,
        schedule_start: scheduleStart || null,
        schedule_end: scheduleEnd || null,
        reference_id: referenceId || null,
        image_path: imagePath || null,
        content: type === "custom" ? { body: customBody } : {},
      };

      if (isEdit) {
        await updateScreenSlide(supabase, slide.id, data);
      } else {
        await createScreenSlide(supabase, { ...data, sort_order: maxSortOrder + 1 });
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
          <SheetTitle>{isEdit ? "Modifier le slide" : "Ajouter un slide"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les paramètres de ce slide."
              : "Configurez le nouveau slide pour l'écran."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-12rem)] px-4">
          <form id="slide-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            {/* Type */}
            <div className="space-y-2">
              <Label>Type de slide</Label>
              <Select value={type} onValueChange={(v) => setType(v as SlideType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLIDE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slide-title">Titre</Label>
                <Input
                  id="slide-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre affiché sur le slide"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slide-subtitle">Sous-titre</Label>
                <Input
                  id="slide-subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Description courte"
                />
              </div>
            </div>

            {/* Duration & Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slide-duration">Durée (sec)</Label>
                <Input
                  id="slide-duration"
                  type="number"
                  min={1}
                  max={120}
                  value={durationSec}
                  onChange={(e) => setDurationSec(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slide-start">Afficher dès</Label>
                <Input
                  id="slide-start"
                  type="time"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slide-end">Jusqu&apos;à</Label>
                <Input
                  id="slide-end"
                  type="time"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                />
              </div>
            </div>

            {/* Reference ID (for event, daily_special, menu, gallery) */}
            {["event", "daily_special", "menu", "gallery"].includes(type) && (
              <div className="space-y-2">
                <Label htmlFor="slide-ref">ID de référence (UUID)</Label>
                <Input
                  id="slide-ref"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="UUID du plat, menu, événement ou photo"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Optionnel. Pointez vers un élément existant pour afficher ses données automatiquement.
                </p>
              </div>
            )}

            {/* Image path (for poster, event) */}
            {["poster", "event", "daily_special"].includes(type) && (
              <div className="space-y-2">
                <Label htmlFor="slide-image">Chemin image (Storage)</Label>
                <Input
                  id="slide-image"
                  value={imagePath}
                  onChange={(e) => setImagePath(e.target.value)}
                  placeholder="ex: poster-soiree.jpg"
                  className="font-mono text-xs"
                />
              </div>
            )}

            {/* Custom body text */}
            {type === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="slide-body">Contenu texte</Label>
                <Textarea
                  id="slide-body"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Texte libre affiché sur le slide..."
                  rows={4}
                />
              </div>
            )}

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="slide-active">Actif</Label>
              <Switch id="slide-active" checked={active} onCheckedChange={setActive} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        <div className="border-t px-4 pt-4">
          <Button type="submit" form="slide-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le slide"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
