"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getWines, getWinesGrouped, deleteWine, deleteWineImage, getWineImageUrl } from "@/lib/supabase/wines";
import { logActivity } from "@/lib/supabase/activity-log";
import type { Wine, WineColor } from "@/lib/types/database";
import { WINE_COLORS } from "@/lib/types/database";
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
import { WineFormSheet } from "./wine-form-sheet";

type Props = {
  initialWines: Wine[];
};

export function WinesManager({ initialWines }: Props) {
  const supabase = createClient();
  const [wines, setWines] = useState<Wine[]>(initialWines);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Wine | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [colorFilter, setColorFilter] = useState<WineColor | "all">("all");
  const [imageTimestamps, setImageTimestamps] = useState<Record<string, number>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!lightboxUrl) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxUrl(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxUrl]);

  const refresh = useCallback(async () => {
    const data = await getWines(supabase);
    setWines(data);
  }, [supabase]);

  function handleAdd() {
    setEditingWine(null);
    setSheetOpen(true);
  }

  function handleEdit(wine: Wine) {
    setEditingWine(wine);
    setSheetOpen(true);
  }

  async function handleToggleAvailable(wine: Wine) {
    await supabase
      .from("wines")
      .update({ available: !wine.available })
      .eq("id", wine.id);
    await logActivity(supabase, {
      action: "UPDATE",
      entityType: "wine",
      entityId: wine.id,
      entityName: wine.name,
      details: { field: "available", value: !wine.available },
    });
    await refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.image_path) {
        await deleteWineImage(supabase, deleteTarget.image_path);
      }
      await deleteWine(supabase, deleteTarget.id);
      await logActivity(supabase, {
        action: "DELETE",
        entityType: "wine",
        entityId: deleteTarget.id,
        entityName: deleteTarget.name,
      });
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const groups = getWinesGrouped(wines);
  const filteredGroups =
    colorFilter === "all"
      ? groups.filter((g) => g.wines.length > 0)
      : groups.filter((g) => g.color === colorFilter && g.wines.length > 0);

  const totalWines = filteredGroups.reduce((sum, g) => sum + g.wines.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Carte des vins</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalWines} vin{totalWines !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleAdd}>+ Ajouter un vin</Button>
      </div>

      {/* Color filter */}
      <div className="mt-4 flex gap-2">
        <Button
          variant={colorFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setColorFilter("all")}
        >
          Tout
        </Button>
        {WINE_COLORS.map((c) => (
          <Button
            key={c.value}
            variant={colorFilter === c.value ? "default" : "outline"}
            size="sm"
            onClick={() => setColorFilter(c.value)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Wine list grouped by color */}
      {filteredGroups.map(({ color, label, wines: groupWines }) => (
        <section key={color} className="mb-8">
          <h2 className="mb-4 text-lg font-medium tracking-wide">{label}</h2>
          <div className="space-y-2">
            {groupWines.map((wine) => (
              <WineRow
                key={wine.id}
                wine={wine}
                imageTs={imageTimestamps[wine.id]}
                onEdit={() => handleEdit(wine)}
                onDelete={() => setDeleteTarget(wine)}
                onToggle={() => handleToggleAvailable(wine)}
                onClickImage={(url) => setLightboxUrl(url)}
                getImageUrl={(path) => getWineImageUrl(supabase, path)}
              />
            ))}
          </div>
        </section>
      ))}

      {filteredGroups.length === 0 && (
        <p className="py-12 text-center text-sm italic text-muted-foreground">
          Aucun vin trouvé.
        </p>
      )}

      {/* Add/Edit Sheet */}
      <WineFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        wine={editingWine}
        onSaved={async () => {
          setSheetOpen(false);
          await refresh();
        }}
        onRefresh={async (wineId?: string) => {
          if (wineId) {
            setImageTimestamps((prev) => ({ ...prev, [wineId]: Date.now() }));
          }
          await refresh();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce vin ?</AlertDialogTitle>
            <AlertDialogDescription>
              «&nbsp;{deleteTarget?.name}&nbsp;» sera supprimé définitivement. Cette action est
              irréversible.
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

      {/* Image Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-3xl text-white/80 hover:text-white"
            aria-label="Fermer"
          >
            &times;
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxUrl}
              alt="Photo du vin"
              width={600}
              height={900}
              className="h-auto max-h-[80vh] w-auto rounded-lg object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Wine row component ──

type WineRowProps = {
  wine: Wine;
  imageTs?: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onClickImage: (url: string) => void;
  getImageUrl: (path: string) => string;
};

function WineRow({ wine, imageTs, onEdit, onDelete, onToggle, onClickImage, getImageUrl }: WineRowProps) {
  const colorLabel = WINE_COLORS.find((c) => c.value === wine.color)?.label;
  const rawUrl = wine.image_path ? getImageUrl(wine.image_path) : null;
  const imageUrl = rawUrl && imageTs ? `${rawUrl}?t=${imageTs}` : rawUrl;

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
        !wine.available ? "opacity-50" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-md bg-muted">
        {imageUrl ? (
          <button
            onClick={() => onClickImage(imageUrl)}
            className="relative h-full w-full cursor-zoom-in"
          >
            <Image
              src={imageUrl}
              alt={wine.name}
              fill
              className="object-cover"
              sizes="32px"
              unoptimized={!!imageTs}
            />
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            —
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{wine.name}</p>
          {colorLabel && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {colorLabel}
            </Badge>
          )}
          {wine.vintage && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {wine.vintage}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {[wine.appellation, wine.region, wine.grape_variety].filter(Boolean).join(" — ")}
        </p>
      </div>

      {/* Prices */}
      <div className="shrink-0 text-right text-sm">
        {wine.price_bottle != null && Number(wine.price_bottle) > 0 && (
          <p className="font-medium">{Number(wine.price_bottle).toFixed(2)} € <span className="text-xs text-muted-foreground">bout.</span></p>
        )}
        {wine.price_glass != null && Number(wine.price_glass) > 0 && (
          <p className="text-xs text-muted-foreground">{Number(wine.price_glass).toFixed(2)} € verre</p>
        )}
      </div>

      {/* Available toggle */}
      <Switch checked={wine.available} onCheckedChange={onToggle} aria-label="Disponible" />

      {/* Actions */}
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Modifier
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}
