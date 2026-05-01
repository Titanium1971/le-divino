"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { ScreenSlide } from "@/lib/types/database";

export default function DisplayScreen() {
  const supabase = createClient();
  const [slides, setSlides] = useState<ScreenSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSlides = useCallback(async () => {
    const { data } = await supabase
      .from("screen_slides")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (data) setSlides(data as ScreenSlide[]);
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Realtime subscription — fallback to polling if WebSocket is blocked
  // (iOS Safari Lockdown Mode throws "WebSocket not available: The operation is insecure").
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    try {
      channel = supabase
        .channel("screen-slides-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "screen_slides" },
          () => {
            fetchSlides();
          },
        )
        .subscribe();
    } catch {
      pollTimer = setInterval(fetchSlides, 10000);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // Ignore — channel may already be torn down.
        }
      }
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [supabase, fetchSlides]);

  // Filter slides by current time schedule
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const scheduledSlides = slides.filter((slide) => {
    if (!slide.schedule_start || !slide.schedule_end) return true;
    const start = slide.schedule_start.slice(0, 5);
    const end = slide.schedule_end.slice(0, 5);
    return currentTime >= start && currentTime <= end;
  });

  // Auto-rotate slides
  useEffect(() => {
    if (scheduledSlides.length === 0) return;

    // Ensure index is within bounds
    const safeIndex = currentIndex % scheduledSlides.length;
    if (safeIndex !== currentIndex) {
      setCurrentIndex(safeIndex);
      return;
    }

    const slide = scheduledSlides[safeIndex];
    if (!slide) return;

    // Transition: fade out → change → fade in
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % scheduledSlides.length);
        setVisible(true);
      }, 800); // fade-out duration
    }, slide.duration_ms);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, scheduledSlides]);

  // Nothing to show
  if (scheduledSlides.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-extralight tracking-[0.3em] text-white/90">LE DIVINO</h1>
          <div className="mx-auto mt-4 h-px w-16 bg-[#c5962c]" />
          <p className="mt-4 text-lg font-light tracking-widest text-white/50">
            Cuisine traditionnelle française
          </p>
        </div>
      </div>
    );
  }

  const slide = scheduledSlides[currentIndex % scheduledSlides.length];
  if (!slide) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className={`absolute inset-0 transition-opacity duration-800 ease-in-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <SlideRenderer slide={slide} supabase={supabase} />
      </div>
    </div>
  );
}

// ── Slide renderer by type ──

function SlideRenderer({
  slide,
  supabase,
}: {
  slide: ScreenSlide;
  supabase: ReturnType<typeof createClient>;
}) {
  switch (slide.type) {
    case "daily_special":
    case "dish":
      return <DailySpecialSlide slide={slide} supabase={supabase} />;
    case "menu":
      return <MenuSlide slide={slide} />;
    case "event":
      return <EventSlide slide={slide} supabase={supabase} />;
    case "gallery":
    case "image":
      return <GallerySlide slide={slide} supabase={supabase} />;
    case "poster":
      return <PosterSlide slide={slide} supabase={supabase} />;
    case "custom":
    default:
      return <CustomSlide slide={slide} />;
  }
}

// ── Custom / text slide ──
function CustomSlide({ slide }: { slide: ScreenSlide }) {
  const body = (slide.content as Record<string, string>)?.body;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#1a0a0a] via-[#2a1010] to-[#1a0a0a] p-16">
      <div className="text-center">
        {slide.title && (
          <h1 className="text-6xl font-extralight tracking-[0.3em] text-[#f5f0eb] uppercase">
            {slide.title}
          </h1>
        )}
        <div className="mx-auto mt-6 h-px w-24 bg-[#c5962c]" />
        {slide.subtitle && (
          <p className="mt-6 text-2xl font-light tracking-widest text-[#c5962c]">
            {slide.subtitle}
          </p>
        )}
        {body && (
          <p className="mt-8 max-w-2xl text-xl font-light leading-relaxed text-white/70">
            {body}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Daily special / dish slide ──
function DailySpecialSlide({
  slide,
  supabase,
}: {
  slide: ScreenSlide;
  supabase: ReturnType<typeof createClient>;
}) {
  const imageUrl = slide.image_path
    ? supabase.storage.from("dishes").getPublicUrl(slide.image_path).data.publicUrl
    : null;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#1a0a0a] via-[#2a1010] to-[#1a0a0a] p-16">
      {imageUrl && (
        <div className="relative mb-10 h-[40%] w-[60%] overflow-hidden rounded-2xl">
          <Image
            src={imageUrl}
            alt={slide.title ?? ""}
            fill
            className="object-cover"
            sizes="60vw"
            unoptimized
          />
        </div>
      )}
      <div className="text-center">
        <p className="text-sm font-light tracking-[0.3em] uppercase text-[#c5962c]">
          Plat du jour
        </p>
        {slide.title && (
          <h1 className="mt-4 text-5xl font-extralight tracking-wider text-[#f5f0eb]">
            {slide.title}
          </h1>
        )}
        {slide.subtitle && (
          <p className="mt-4 text-3xl font-light text-[#c5962c]">{slide.subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ── Menu / formule slide ──
function MenuSlide({ slide }: { slide: ScreenSlide }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#1a0a0a] via-[#2a1010] to-[#1a0a0a] p-16">
      <div className="text-center">
        <p className="text-sm font-light tracking-[0.3em] uppercase text-[#c5962c]">
          Notre formule
        </p>
        <div className="mx-auto mt-4 h-px w-16 bg-[#c5962c]/50" />
        {slide.title && (
          <h1 className="mt-6 text-5xl font-extralight tracking-wider text-[#f5f0eb]">
            {slide.title}
          </h1>
        )}
        {slide.subtitle && (
          <p className="mt-6 text-2xl font-light leading-relaxed text-white/70">
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Event slide ──
function EventSlide({
  slide,
  supabase,
}: {
  slide: ScreenSlide;
  supabase: ReturnType<typeof createClient>;
}) {
  const imageUrl = slide.image_path
    ? supabase.storage.from("events").getPublicUrl(slide.image_path).data.publicUrl
    : null;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt={slide.title ?? ""}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/60" />
        </>
      )}
      {!imageUrl && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0a] via-[#2a1010] to-[#1a0a0a]" />
      )}
      <div className="relative z-10 text-center px-16">
        <p className="text-sm font-light tracking-[0.3em] uppercase text-[#c5962c]">
          Événement
        </p>
        <div className="mx-auto mt-4 h-px w-16 bg-[#c5962c]/50" />
        {slide.title && (
          <h1 className="mt-6 text-5xl font-extralight tracking-wider text-[#f5f0eb]">
            {slide.title}
          </h1>
        )}
        {slide.subtitle && (
          <p className="mt-6 text-2xl font-light text-white/80">{slide.subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ── Gallery / image slide ──
function GallerySlide({
  slide,
  supabase,
}: {
  slide: ScreenSlide;
  supabase: ReturnType<typeof createClient>;
}) {
  const imageUrl = slide.image_path
    ? supabase.storage.from("gallery").getPublicUrl(slide.image_path).data.publicUrl
    : null;

  return (
    <div className="relative h-full w-full">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={slide.title ?? ""}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
      )}
      {/* Subtle gradient overlay at bottom for text */}
      {(slide.title || slide.subtitle) && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-16 text-center">
            {slide.title && (
              <h1 className="text-4xl font-extralight tracking-wider text-white">
                {slide.title}
              </h1>
            )}
            {slide.subtitle && (
              <p className="mt-3 text-xl font-light text-white/70">{slide.subtitle}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Poster slide (full-screen image) ──
function PosterSlide({
  slide,
  supabase,
}: {
  slide: ScreenSlide;
  supabase: ReturnType<typeof createClient>;
}) {
  const imageUrl = slide.image_path
    ? supabase.storage.from("posters").getPublicUrl(slide.image_path).data.publicUrl
    : null;

  return (
    <div className="relative h-full w-full">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={slide.title ?? ""}
          fill
          className="object-contain"
          sizes="100vw"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#1a0a0a]">
          <p className="text-2xl font-light text-white/50">Affiche non disponible</p>
        </div>
      )}
    </div>
  );
}
