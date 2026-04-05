"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  createGalleryItem,
  updateGalleryItem,
  uploadGalleryImage,
  getGalleryImageUrl,
} from "@/lib/supabase/gallery";
import { logActivity } from "@/lib/supabase/activity-log";
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
  /** Used for create mode — next sort_order */
  nextSortOrder?: number;
};

export function GalleryEditSheet({ open, onOpenChange, item, onSaved, nextSortOrder = 0 }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!item;

  const [caption, setCaption] = useState<I18nField>(emptyI18n());
  const [tag, setTag] = useState<GalleryTag>("restaurant");
  const [isFeatured, setIsFeatured] = useState(false);
  const [showOnScreen, setShowOnScreen] = useState(false);
  const [published, setPublished] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayImage = localPreview ?? remoteUrl;

  useEffect(() => {
    if (item) {
      setCaption(item.caption ?? emptyI18n());
      setTag(item.tag);
      setIsFeatured(item.is_featured ?? false);
      setShowOnScreen(item.show_on_screen ?? false);
      setPublished(item.published);
      setImageFile(null);
      setLocalPreview(null);
      setRemoteUrl(item.image_path ? getGalleryImageUrl(supabase, item.image_path) : null);
    } else {
      setCaption(emptyI18n());
      setTag("restaurant");
      setIsFeatured(false);
      setShowOnScreen(false);
      setPublished(true);
      setImageFile(null);
      setLocalPreview(null);
      setRemoteUrl(null);
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setLocalPreview(URL.createObjectURL(file));
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-gallery-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hint: caption.fr || "", tag }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de génération");

      if (data.caption_fr) {
        setCaption((prev) => ({ ...prev, fr: data.caption_fr }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération IA.");
    } finally {
      setGenerating(false);
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

    if (!isEdit && !imageFile) {
      setError("Ajoutez une photo pour créer un élément de galerie.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let savedItem: GalleryItem;

      if (isEdit) {
        savedItem = await updateGalleryItem(supabase, item.id, {
          caption,
          tag,
          is_featured: isFeatured,
          show_on_screen: showOnScreen,
          published,
        });
      } else {
        savedItem = await createGalleryItem(supabase, {
          image_path: "",
          caption,
          tag,
          sort_order: nextSortOrder,
          is_featured: isFeatured,
          show_on_screen: showOnScreen,
          published,
        });
      }

      if (imageFile) {
        const path = await uploadGalleryImage(supabase, imageFile, savedItem.id);
        await updateGalleryItem(supabase, savedItem.id, { image_path: path });
      }

      await logActivity(supabase, {
        action: isEdit ? "UPDATE" : "CREATE",
        entityType: "gallery",
        entityId: savedItem.id,
        entityName: caption.fr || "Photo",
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
          <SheetTitle>{isEdit ? "Modifier la photo" : "Ajouter une photo"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez la légende, le tag et les options de cette photo."
              : "Ajoutez une photo avec sa légende et ses options."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-12rem)] px-4">
          <form id="gallery-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            {/* Image preview + upload */}
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-start gap-4">
                <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg border bg-muted sm:w-52">
                  {displayImage ? (
                    <Image
                      src={displayImage}
                      alt={caption.fr || ""}
                      fill
                      className="object-cover"
                      sizes="208px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      Aucune image
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    {displayImage ? "Changer la photo" : "Choisir une photo"}
                  </Button>
                  {!isEdit && !imageFile && (
                    <p className="text-xs text-muted-foreground">
                      Requis pour ajouter une photo.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tag */}
            <div className="space-y-2">
              <Label>Catégorie</Label>
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

            {/* AI Generation */}
            <div className="flex items-center justify-between rounded-md border border-dashed border-amber-500/50 bg-amber-50/50 p-3">
              <div className="flex-1 pr-3">
                <p className="text-sm font-medium text-amber-900">Générer avec IA</p>
                <p className="text-xs text-amber-700">
                  Légende élégante pour la galerie.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={generating}
                className="shrink-0 border-amber-500 text-amber-700 hover:bg-amber-100"
              >
                {generating ? "Génération..." : "Générer"}
              </Button>
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

            {/* Translate button */}
            <div className="flex items-center justify-between rounded-md border border-dashed p-3">
              <p className="text-xs text-muted-foreground">
                Traduire la légende automatiquement.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={translating || !caption.fr}
              >
                {translating ? "Traduction..." : "Traduire FR \u2192 EN/IT/ES/DE"}
              </Button>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Publiée</Label>
                <Switch checked={published} onCheckedChange={setPublished} />
              </div>
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
          <Button type="submit" form="gallery-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Sauvegarder" : "Ajouter la photo"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
