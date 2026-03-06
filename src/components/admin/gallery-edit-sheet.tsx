"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateGalleryItem, uploadGalleryImage, getGalleryImageUrl } from "@/lib/supabase/gallery";
import type { GalleryItem, GalleryTag, I18nField, Locale } from "@/lib/types/database";
import { GALLERY_TAGS } from "@/lib/types/database";
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
  item: GalleryItem | null;
  onSaved: () => Promise<void>;
};

export function GalleryEditSheet({ open, onOpenChange, item, onSaved }: Props) {
  const supabase = createClient();
  const changePhotoRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState<I18nField>(emptyI18n());
  const [tag, setTag] = useState<GalleryTag>("restaurant");
  const [isFeatured, setIsFeatured] = useState(false);
  const [showOnScreen, setShowOnScreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setCaption(item.caption ?? emptyI18n());
      setTag(item.tag);
      setIsFeatured(item.is_featured ?? false);
      setShowOnScreen(item.show_on_screen ?? false);
      setPreviewUrl(item.image_path ? getGalleryImageUrl(supabase, item.image_path) : null);
    } else {
      setCaption(emptyI18n());
      setTag("restaurant");
      setIsFeatured(false);
      setShowOnScreen(false);
      setPreviewUrl(null);
    }
    setError(null);
  }, [item, open, supabase]);

  function updateI18n(
    setter: React.Dispatch<React.SetStateAction<I18nField>>,
    locale: Locale,
    value: string,
  ) {
    setter((prev) => ({ ...prev, [locale]: value }));
  }

  async function handleChangePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !item) return;

    setUploadingPhoto(true);
    try {
      const path = await uploadGalleryImage(supabase, file, item.id);
      await updateGalleryItem(supabase, item.id, { image_path: path });
      setPreviewUrl(getGalleryImageUrl(supabase, path));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du changement de photo.");
    } finally {
      setUploadingPhoto(false);
      if (changePhotoRef.current) changePhotoRef.current.value = "";
    }
  }

  async function handleTranslate() {
    if (!caption.fr) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: caption.fr, description: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      setCaption((prev) => ({
        ...prev,
        en: data.name?.en || prev.en,
        it: data.name?.it || prev.it,
        es: data.name?.es || prev.es,
        de: data.name?.de || prev.de,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la traduction automatique.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;

    setSaving(true);
    setError(null);

    try {
      await updateGalleryItem(supabase, item.id, {
        caption,
        tag,
        is_featured: isFeatured,
        show_on_screen: showOnScreen,
      });
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
          <SheetTitle>Modifier la photo</SheetTitle>
          <SheetDescription>Modifiez la légende, le tag et les options de cette photo.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-4">
          <form id="gallery-edit-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            {/* Image preview + change photo */}
            <div className="space-y-2">
              {previewUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={previewUrl}
                    alt={caption.fr || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                    unoptimized
                  />
                </div>
              )}
              <input
                ref={changePhotoRef}
                type="file"
                accept="image/*"
                onChange={handleChangePhoto}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => changePhotoRef.current?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? "Chargement..." : "Changer la photo"}
              </Button>
            </div>

            {/* Tag */}
            <div className="space-y-2">
              <Label>Tag</Label>
              <Select value={tag} onValueChange={(v) => setTag(v as GalleryTag)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_TAGS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Caption i18n */}
            <div className="space-y-2">
              <Label>Légende</Label>
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
                      value={caption[l.key]}
                      onChange={(e) => updateI18n(setCaption, l.key, e.target.value)}
                      placeholder={`Légende (${l.label})`}
                    />
                    {l.key === "fr" && caption.fr.trim() !== "" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleTranslate}
                        disabled={translating}
                      >
                        {translating ? "Traduction..." : "✨ Traduire FR → EN/IT/ES/DE"}
                      </Button>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Photo vedette</Label>
                  <p className="text-xs text-muted-foreground">Mise en avant sur le site</p>
                </div>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Afficher sur l&apos;écran</Label>
                  <p className="text-xs text-muted-foreground">Visible sur l&apos;écran du restaurant</p>
                </div>
                <Switch checked={showOnScreen} onCheckedChange={setShowOnScreen} />
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        {/* Submit */}
        <div className="border-t px-4 pt-4">
          <Button type="submit" form="gallery-edit-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
