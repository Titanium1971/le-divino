"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateGalleryItem, getGalleryImageUrl } from "@/lib/supabase/gallery";
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

  const [caption, setCaption] = useState<I18nField>(emptyI18n());
  const [tag, setTag] = useState<GalleryTag>("restaurant");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setCaption(item.caption ?? emptyI18n());
      setTag(item.tag);
    } else {
      setCaption(emptyI18n());
      setTag("restaurant");
    }
    setError(null);
  }, [item, open]);

  function updateI18n(
    setter: React.Dispatch<React.SetStateAction<I18nField>>,
    locale: Locale,
    value: string,
  ) {
    setter((prev) => ({ ...prev, [locale]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;

    setSaving(true);
    setError(null);

    try {
      await updateGalleryItem(supabase, item.id, { caption, tag });
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  const imageUrl = item?.image_path ? getGalleryImageUrl(supabase, item.image_path) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Modifier la photo</SheetTitle>
          <SheetDescription>Modifiez la légende et le tag de cette photo.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] px-4">
          <form id="gallery-edit-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            {/* Image preview */}
            {imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={imageUrl}
                  alt={caption.fr || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                  unoptimized
                />
              </div>
            )}

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
                  </TabsContent>
                ))}
              </Tabs>
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
