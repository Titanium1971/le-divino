"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getPosters, deletePoster, toggleFavorite, getPosterImageUrl } from "@/lib/supabase/posters";
import { getTemplate } from "@/lib/poster-templates";
import type { PosterGeneration } from "@/lib/poster-templates/types";
import { Button } from "@/components/ui/button";
import { PosterGeneratorSheet } from "./poster-generator-sheet";

type Props = {
  initialPosters: PosterGeneration[];
};

export function PostersManager({ initialPosters }: Props) {
  const supabase = createClient();
  const [posters, setPosters] = useState<PosterGeneration[]>(initialPosters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  const refresh = useCallback(async () => {
    try {
      const data = await getPosters(supabase);
      setPosters(data);
    } catch {
      // ignore
    }
  }, [supabase]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette affiche ?")) return;
    try {
      await deletePoster(supabase, id);
      setPosters((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  }

  async function handleToggleFavorite(id: string, current: boolean) {
    try {
      await toggleFavorite(supabase, id, !current);
      setPosters((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: !current } : p)),
      );
    } catch {
      // ignore
    }
  }

  async function handleDownload(poster: PosterGeneration) {
    if (!poster.image_path) return;
    const url = getPosterImageUrl(supabase, poster.image_path);
    const link = document.createElement("a");
    link.href = url;
    link.download = `affiche_${poster.template_id}_${poster.orientation}.png`;
    link.target = "_blank";
    link.click();
  }

  const filtered = filter === "favorites"
    ? posters.filter((p) => p.is_favorite)
    : posters;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Affiches</h1>
          <p className="text-sm text-muted-foreground">
            {posters.length} affiche{posters.length !== 1 ? "s" : ""} générée{posters.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setSheetOpen(true)}
          className="bg-[#C5A55A] text-white hover:bg-[#B08D3A]"
        >
          ✨ Créer une affiche
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            filter === "all"
              ? "bg-[#C5A55A] text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter("favorites")}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            filter === "favorites"
              ? "bg-[#C5A55A] text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          ⭐ Favoris
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="text-muted-foreground">
            {filter === "favorites"
              ? "Aucune affiche en favoris"
              : "Aucune affiche générée"}
          </p>
          {filter === "all" && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSheetOpen(true)}
            >
              Créer ma première affiche
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((poster) => {
            const template = getTemplate(poster.template_id);
            const imageUrl = poster.image_path
              ? getPosterImageUrl(supabase, poster.image_path)
              : null;

            return (
              <div
                key={poster.id}
                className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
              >
                {/* Image */}
                <div className={`relative ${poster.orientation === "portrait" ? "aspect-[9/16]" : "aspect-[16/9]"} bg-muted`}>
                  {imageUrl && (
                    <Image
                      src={`${imageUrl}?t=${new Date(poster.created_at).getTime()}`}
                      alt={template?.name || "Affiche"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                    />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex w-full gap-1 p-2">
                      <button
                        onClick={() => handleToggleFavorite(poster.id, poster.is_favorite)}
                        className="rounded bg-white/20 px-2 py-1 text-xs text-white backdrop-blur-sm hover:bg-white/30"
                      >
                        {poster.is_favorite ? "⭐" : "☆"}
                      </button>
                      <button
                        onClick={() => handleDownload(poster)}
                        className="rounded bg-white/20 px-2 py-1 text-xs text-white backdrop-blur-sm hover:bg-white/30"
                      >
                        📥
                      </button>
                      <button
                        onClick={() => handleDelete(poster.id)}
                        className="ml-auto rounded bg-red-500/30 px-2 py-1 text-xs text-white backdrop-blur-sm hover:bg-red-500/50"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  {poster.is_favorite && (
                    <span className="absolute top-2 left-2 rounded-full bg-[#C5A55A] px-1.5 py-0.5 text-[10px] text-white shadow">
                      ⭐
                    </span>
                  )}
                  {poster.pushed_to_screen && (
                    <span className="absolute top-2 right-2 rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] text-white shadow">
                      📺
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium truncate">
                    {template?.icon} {template?.name || poster.template_id}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(poster.created_at).toLocaleDateString("fr-FR")}
                    {" · "}
                    {poster.orientation === "portrait" ? "Portrait" : "Paysage"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PosterGeneratorSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSaved={refresh}
      />
    </div>
  );
}
