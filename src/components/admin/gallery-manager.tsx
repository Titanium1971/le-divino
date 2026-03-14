"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  deleteGalleryImage,
  uploadGalleryImage,
  getGalleryImageUrl,
  updateGallerySortOrders,
} from "@/lib/supabase/gallery";
import type { GalleryItem, GalleryTag } from "@/lib/types/database";
import { GALLERY_TAGS } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GalleryEditSheet } from "./gallery-edit-sheet";

type Props = {
  initialItems: GalleryItem[];
};

export function GalleryManager({ initialItems }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTag, setActiveTag] = useState<GalleryTag | "all">("all");
  const [dragOver, setDragOver] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getGalleryItems(supabase);
    setItems(data);
  }, [supabase]);

  // ── Upload handler (shared by input + drag & drop) ──

  async function handleUploadFiles(files: FileList) {
    setUploading(true);
    try {
      const maxSort = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) : -1;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const item = await createGalleryItem(supabase, {
          image_path: "",
          sort_order: maxSort + 1 + i,
          tag: "restaurant" as GalleryTag,
          published: true,
        });
        const path = await uploadGalleryImage(supabase, file, item.id);
        await updateGalleryItem(supabase, item.id, { image_path: path });
      }

      await refresh();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleUploadFiles(files);
  }

  // ── Drag & Drop ──

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUploadFiles(files);
    }
  }

  function handleEdit(item: GalleryItem) {
    setEditingItem(item);
    setSheetOpen(true);
  }

  async function handleTogglePublished(item: GalleryItem) {
    await updateGalleryItem(supabase, item.id, { published: !item.published });
    await refresh();
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const current = filteredItems[index];
    const prev = filteredItems[index - 1];
    await updateGallerySortOrders(supabase, [
      { id: current.id, sort_order: prev.sort_order },
      { id: prev.id, sort_order: current.sort_order },
    ]);
    await refresh();
  }

  async function handleMoveDown(index: number) {
    if (index === filteredItems.length - 1) return;
    const current = filteredItems[index];
    const next = filteredItems[index + 1];
    await updateGallerySortOrders(supabase, [
      { id: current.id, sort_order: next.sort_order },
      { id: next.id, sort_order: current.sort_order },
    ]);
    await refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.image_path) {
        await deleteGalleryImage(supabase, deleteTarget.image_path);
      }
      await deleteGalleryItem(supabase, deleteTarget.id);
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const [seeding, setSeeding] = useState(false);

  async function handleSeedGallery() {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed-gallery", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed");
      console.log("[GalleryManager] Seed result:", data);
      await refresh();
    } catch (err) {
      console.error("Seed error:", err);
    } finally {
      setSeeding(false);
    }
  }

  const tagLabel = (tag: GalleryTag) =>
    GALLERY_TAGS.find((t) => t.value === tag)?.label ?? tag;

  const filteredItems = activeTag === "all" ? items : items.filter((i) => i.tag === activeTag);

  // Debug: log generated URLs on mount and when items change
  useEffect(() => {
    if (items.length > 0) {
      console.log("[GalleryManager] Items URLs:");
      items.forEach((item) => {
        const url = item.image_path ? getGalleryImageUrl(supabase, item.image_path) : "(no path)";
        console.log(`  - ${item.id} | path="${item.image_path}" | url=${url}`);
      });
    }
  }, [items, supabase]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide sm:text-2xl">Galerie</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} photo{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesSelected}
            className="hidden"
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full sm:w-auto">
            {uploading ? "Upload en cours..." : "+ Ajouter des photos"}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Tag filter bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTag === "all"
              ? "bg-[#6B1A2A] text-[#FAF6F0]"
              : "bg-[#F0EAE2] text-[#8C7B72] hover:bg-[#E8DDD4]"
          }`}
        >
          Tout ({items.length})
        </button>
        {GALLERY_TAGS.map((t) => {
          const count = items.filter((i) => i.tag === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setActiveTag(t.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTag === t.value
                  ? "bg-[#6B1A2A] text-[#FAF6F0]"
                  : "bg-[#F0EAE2] text-[#8C7B72] hover:bg-[#E8DDD4]"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Drag & Drop upload zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-6 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? "border-[#C5A55A] bg-[#C5A55A]/5"
            : "border-[#E8DDD4] bg-white hover:border-[#C5A55A]/50"
        }`}
        onClick={() => fileRef.current?.click()}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-[#2D1219]">
            {uploading ? "Upload en cours..." : "Glissez des photos ici ou cliquez pour parcourir"}
          </p>
          <p className="mt-1 text-xs text-[#8C7B72]">JPG, PNG, WebP acceptés</p>
        </div>
      </div>

      {/* Stale seed data warning */}
      {items.length > 0 && items.some((i) => i.image_path.includes("/")) && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-dashed border-orange-200 bg-orange-50 p-3">
          <p className="flex-1 text-sm text-orange-700">
            Certaines photos utilisent des chemins obsolètes (données de démo). Remplacez-les par de vraies images.
          </p>
          <Button variant="outline" size="sm" onClick={handleSeedGallery} disabled={seeding}>
            {seeding ? "Chargement..." : "Corriger les photos de démo"}
          </Button>
        </div>
      )}

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm italic text-muted-foreground">
            {activeTag === "all"
              ? "Aucune photo dans la galerie. Ajoutez des photos pour commencer."
              : "Aucune photo avec ce filtre."}
          </p>
          {activeTag === "all" && (
            <Button variant="outline" size="sm" onClick={handleSeedGallery} disabled={seeding}>
              {seeding ? "Chargement des photos..." : "Charger les photos de démonstration"}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-lg border border-[#E8DDD4] bg-white transition-opacity ${
                !item.published ? "opacity-50" : ""
              }`}
            >
              {/* Thumbnail with hover overlay */}
              <div className="relative aspect-[4/3] bg-[#F0EAE2]">
                {item.image_path ? (
                  <Image
                    src={getGalleryImageUrl(supabase, item.image_path)}
                    alt={item.caption?.fr || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
                {!item.image_path && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-[#8C7B72]">
                    Pas d&apos;image
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(item)}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-[#2D1219] shadow-sm transition-colors hover:bg-[#F5EFE8]"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="truncate text-xs text-[#8C7B72]">
                  {item.caption?.fr || "Sans légende"}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {tagLabel(item.tag)}
                  </Badge>
                  {item.is_featured && (
                    <Badge variant="secondary" className="text-[10px]">
                      Vedette
                    </Badge>
                  )}
                  {item.show_on_screen && (
                    <Badge variant="secondary" className="text-[10px]">
                      Écran
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-[#E8DDD4] px-2 py-1">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-xs"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    &#9650;
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-xs"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === filteredItems.length - 1}
                  >
                    &#9660;
                  </Button>
                </div>

                <Switch
                  checked={item.published}
                  onCheckedChange={() => handleTogglePublished(item)}
                  aria-label="Publié"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Sheet */}
      <GalleryEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        item={editingItem}
        onSaved={async () => {
          setSheetOpen(false);
          await refresh();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette photo ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette photo sera supprimée définitivement. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
