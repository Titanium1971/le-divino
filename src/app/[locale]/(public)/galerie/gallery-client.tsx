"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { GalleryTag } from "@/lib/types/database";

type GalleryImage = {
  id: string;
  url: string;
  caption: string;
  tag: GalleryTag;
};

// Masonry height patterns — alternates between portrait, landscape, and square
// to create visual rhythm like an editorial spread
const HEIGHT_PATTERNS = [
  "h-[420px]", // tall portrait
  "h-[280px]", // landscape
  "h-[350px]", // medium
  "h-[300px]", // landscape
  "h-[450px]", // tall portrait
  "h-[260px]", // compact landscape
  "h-[380px]", // medium-tall
  "h-[320px]", // medium
  "h-[400px]", // tall
  "h-[270px]", // compact
  "h-[360px]", // medium
  "h-[290px]", // landscape
];

const ALL_TAGS: GalleryTag[] = ["restaurant", "dishes", "events", "team", "ambiance"];

export function GalleryClient({ images }: { images: GalleryImage[] }) {
  const t = useTranslations("gallery");
  const [activeTag, setActiveTag] = useState<GalleryTag | null>(null);

  const filtered = activeTag ? images.filter((img) => img.tag === activeTag) : images;

  // Collect only tags that have images
  const availableTags = ALL_TAGS.filter((tag) => images.some((img) => img.tag === tag));

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

      {/* Masonry grid */}
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-sm font-light text-brand-cream/40">
          {t("empty")}
        </p>
      ) : (
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4 lg:gap-4">
          {filtered.map((img, i) => {
            const heightClass = HEIGHT_PATTERNS[i % HEIGHT_PATTERNS.length];

            return (
              <div
                key={img.id}
                className="gallery-item group relative mb-3 break-inside-avoid overflow-hidden lg:mb-4"
              >
                <div className={`relative w-full ${heightClass}`}>
                  <Image
                    src={img.url}
                    alt={img.caption || "Le Divino"}
                    fill
                    className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />

                  {/* Hover overlay — bordeaux tint */}
                  <div className="pointer-events-none absolute inset-0 bg-brand-bordeaux/0 transition-colors duration-[400ms] ease-out group-hover:bg-brand-bordeaux/15" />

                  {/* Caption overlay — bottom gradient + text */}
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition-all duration-[400ms] ease-out group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-10">
                        <p className="text-sm font-light leading-relaxed text-brand-cream/90">
                          {img.caption}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
