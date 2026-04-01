"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { GalleryTag } from "@/lib/types/database";

type GalleryImage = {
  id: string;
  url: string;
  caption: string;
  tag: GalleryTag;
};

const ALL_TAGS: GalleryTag[] = ["restaurant", "dishes", "events", "team", "ambiance"];

export function GalleryClient({ images }: { images: GalleryImage[] }) {
  const t = useTranslations("gallery");
  const [activeTag, setActiveTag] = useState<GalleryTag | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  const filtered = activeTag ? images.filter((img) => img.tag === activeTag) : images;
  const availableTags = ALL_TAGS.filter((tag) => images.some((img) => img.tag === tag));

  // Staggered fade-in on mount and filter change
  useEffect(() => {
    setVisibleItems(new Set());
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    filtered.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => {
          setVisibleItems((prev) => new Set(prev).add(i));
        }, 80 * i)
      );
    });
    return () => timeouts.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length, activeTag]);

  // Lightbox keyboard navigation
  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  return (
    <>
      {/* Tag filters */}
      {availableTags.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 pb-12">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-5 py-2 text-[11px] font-light tracking-[0.15em] uppercase transition-all duration-300 ${
              activeTag === null
                ? "bg-brand-bordeaux text-brand-cream"
                : "border border-brand-gold/30 text-brand-gold/70 hover:border-brand-gold hover:text-brand-gold"
            }`}
          >
            {t("all")}
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-5 py-2 text-[11px] font-light tracking-[0.15em] uppercase transition-all duration-300 ${
                activeTag === tag
                  ? "bg-brand-bordeaux text-brand-cream"
                  : "border border-brand-gold/30 text-brand-gold/70 hover:border-brand-gold hover:text-brand-gold"
              }`}
            >
              {t(`tags.${tag}`)}
            </button>
          ))}
        </div>
      )}

      {/* Photo grid */}
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-sm font-light text-brand-cream/60">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((img, i) => (
            <div
              key={img.id}
              onClick={() => setLightboxIndex(i)}
              className={`group cursor-zoom-in overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] ${
                visibleItems.has(i)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
              style={{ transitionProperty: "transform, opacity, box-shadow" }}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={img.url}
                  alt={img.caption ? `${img.caption} — Restaurant Le Divino Agde` : "Photo du restaurant Le Divino à Agde"}
                  fill
                  className="object-cover transition-all duration-300 group-hover:brightness-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Caption overlay on hover */}
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-10">
                      <p className="text-sm font-light leading-relaxed text-brand-cream/90">
                        {img.caption}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-10 text-3xl text-white/70 transition-colors hover:text-white"
            aria-label="Fermer"
          >
            ✕
          </button>

          {/* Previous arrow */}
          {filtered.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white md:left-8"
              aria-label="Photo précédente"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filtered[lightboxIndex].url}
              alt={filtered[lightboxIndex].caption ? `${filtered[lightboxIndex].caption} — Restaurant Le Divino Agde` : "Photo du restaurant Le Divino à Agde"}
              width={1200}
              height={900}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            {filtered[lightboxIndex].caption && (
              <p className="mt-4 text-center text-sm font-light tracking-wide text-brand-cream/80">
                {filtered[lightboxIndex].caption}
              </p>
            )}
            {/* Counter */}
            <p className="mt-2 text-center text-xs text-white/40">
              {lightboxIndex + 1} / {filtered.length}
            </p>
          </div>

          {/* Next arrow */}
          {filtered.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white md:right-8"
              aria-label="Photo suivante"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
