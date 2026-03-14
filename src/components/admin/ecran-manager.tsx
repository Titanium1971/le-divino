"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getScreenSlides,
  updateScreenSlide,
  deleteScreenSlide,
  updateSlideSortOrders,
} from "@/lib/supabase/screen-slides";
import type { ScreenSlide, SlideType } from "@/lib/types/database";
import { SLIDE_TYPES } from "@/lib/types/database";
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
import { SlideEditSheet } from "./slide-edit-sheet";

type Props = {
  initialSlides: ScreenSlide[];
};

export function EcranManager({ initialSlides }: Props) {
  const supabase = createClient();
  const [slides, setSlides] = useState<ScreenSlide[]>(initialSlides);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<ScreenSlide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScreenSlide | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getScreenSlides(supabase);
    setSlides(data);
  }, [supabase]);

  function handleAdd() {
    setEditingSlide(null);
    setSheetOpen(true);
  }

  function handleEdit(slide: ScreenSlide) {
    setEditingSlide(slide);
    setSheetOpen(true);
  }

  async function handleToggleActive(slide: ScreenSlide) {
    await updateScreenSlide(supabase, slide.id, { active: !slide.active });
    await refresh();
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const current = slides[index];
    const prev = slides[index - 1];
    await updateSlideSortOrders(supabase, [
      { id: current.id, sort_order: prev.sort_order },
      { id: prev.id, sort_order: current.sort_order },
    ]);
    await refresh();
  }

  async function handleMoveDown(index: number) {
    if (index === slides.length - 1) return;
    const current = slides[index];
    const next = slides[index + 1];
    await updateSlideSortOrders(supabase, [
      { id: current.id, sort_order: next.sort_order },
      { id: next.id, sort_order: current.sort_order },
    ]);
    await refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteScreenSlide(supabase, deleteTarget.id);
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const typeLabel = (type: SlideType) =>
    SLIDE_TYPES.find((t) => t.value === type)?.label ?? type;

  const activeCount = slides.filter((s) => s.active).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide sm:text-2xl">Écran 55&quot;</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {slides.length} slide{slides.length !== 1 ? "s" : ""} &middot; {activeCount} actif
            {activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <a href="/ecran" target="_blank" rel="noopener noreferrer">
              Aperçu
            </a>
          </Button>
          <Button onClick={handleAdd} className="flex-1 sm:flex-none">+ Ajouter un slide</Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Slide list */}
      {slides.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">
          Aucun slide configuré. Ajoutez des slides pour l&apos;écran.
        </p>
      ) : (
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`rounded-lg border p-3 transition-opacity ${
                !slide.active ? "opacity-50" : ""
              }`}
            >
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Order controls */}
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-xs"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  &#9650;
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-xs"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === slides.length - 1}
                >
                  &#9660;
                </Button>
              </div>

              {/* Order number */}
              <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {slide.title || "(sans titre)"}
                  </p>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {typeLabel(slide.type)}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {slide.subtitle || "—"}
                </p>
              </div>

              {/* Duration */}
              <span className="shrink-0 text-xs text-muted-foreground">
                {(slide.duration_ms / 1000).toFixed(0)}s
              </span>

              {/* Schedule */}
              {slide.schedule_start && slide.schedule_end && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {slide.schedule_start.slice(0, 5)}–{slide.schedule_end.slice(0, 5)}
                </span>
              )}

              {/* Active toggle */}
              <Switch
                checked={slide.active}
                onCheckedChange={() => handleToggleActive(slide)}
                aria-label="Actif"
              />
            </div>

              {/* Actions */}
              <div className="mt-2 flex flex-wrap gap-1 sm:mt-0 sm:justify-end">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(slide)}>
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setDeleteTarget(slide)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Sheet */}
      <SlideEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        slide={editingSlide}
        onSaved={async () => {
          setSheetOpen(false);
          await refresh();
        }}
        maxSortOrder={slides.length > 0 ? Math.max(...slides.map((s) => s.sort_order)) : -1}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce slide ?</AlertDialogTitle>
            <AlertDialogDescription>
              «&nbsp;{deleteTarget?.title || "Sans titre"}&nbsp;» sera supprimé définitivement.
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
