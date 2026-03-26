"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

type Review = {
  author: string;
  photoUrl: string;
  rating: number;
  text: string;
  relativeTime: string;
};

type ReviewsData = {
  rating: number | null;
  totalReviews: number;
  reviews: Review[];
};

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#C5A55A" : "rgba(197,165,90,0.2)"}
          width={size}
          height={size}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function GoogleReviews() {
  const locale = useLocale();
  const t = useTranslations("reviews");
  const [data, setData] = useState<ReviewsData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    fetch(`/api/google-reviews?lang=${locale}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.reviews?.length) setData(d);
      })
      .catch(() => {});
  }, [locale]);

  // Auto-rotate reviews every 5s
  const reviewCount = data?.reviews.length ?? 0;
  const advance = useCallback(() => {
    if (reviewCount <= 1) return;
    setFade(false);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % reviewCount);
      setFade(true);
    }, 300);
  }, [reviewCount]);

  useEffect(() => {
    if (reviewCount <= 1) return;
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance, reviewCount]);

  // Don't render anything if no data
  if (!data) return null;

  const review = data.reviews[activeIndex];

  return (
    <section className="bg-brand-dark/90 py-24">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            {/* Google "G" logo */}
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-3xl font-extralight tracking-wide text-brand-cream">
              {data.rating?.toFixed(1)}
            </span>
            <Stars rating={Math.round(data.rating ?? 0)} size={20} />
          </div>
          <p className="mt-2 text-xs font-light tracking-[0.15em] uppercase text-brand-cream/50">
            {data.totalReviews} {t("googleReviews")}
          </p>
          <div className="mx-auto mt-4 h-px w-12 bg-brand-gold/40" />
        </div>

        {/* Review card — glassmorphism */}
        {review && (
          <div className="mx-auto mt-10 max-w-2xl">
            <div
              className={`review-card relative overflow-hidden rounded-2xl p-8 transition-opacity duration-300 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Glassmorphism internal gloss */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]" />

              {/* Quote mark */}
              <div className="absolute top-4 right-6 text-5xl font-serif leading-none text-brand-gold/15">
                &ldquo;
              </div>

              {/* Review text */}
              <p className="relative text-base font-light leading-relaxed text-brand-cream/85 italic">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                {review.photoUrl ? (
                  <Image
                    src={review.photoUrl}
                    alt={review.author}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-bordeaux/40 text-sm font-light text-brand-cream">
                    {review.author.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-normal text-brand-cream/90">
                    {review.author}
                  </p>
                  <div className="flex items-center gap-2">
                    <Stars rating={review.rating} size={12} />
                    <span className="text-[10px] font-light text-brand-cream/40">
                      {review.relativeTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dots indicator */}
            {data.reviews.length > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {data.reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFade(false);
                      setTimeout(() => {
                        setActiveIndex(i);
                        setFade(true);
                      }, 300);
                    }}
                    className={`box-content h-1.5 rounded-full p-3 bg-clip-content transition-all duration-300 ${
                      i === activeIndex
                        ? "w-6 bg-brand-gold"
                        : "w-1.5 bg-brand-cream/20 hover:bg-brand-cream/40"
                    }`}
                    aria-label={`Avis ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
