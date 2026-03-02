"use client";

import { useEffect, useState } from "react";
import { restaurantConfig } from "@/restaurant.config";

const slides = [
  { title: "Bienvenue au Divino", subtitle: "Cuisine traditionnelle française" },
  { title: "La Carte", subtitle: "Découvrez nos plats du jour" },
  { title: "Réservation", subtitle: "Appelez-nous ou réservez en ligne" },
];

export default function DisplayScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, restaurantConfig.display.slideDurationMs);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-extralight tracking-widest">{slide.title}</h1>
        <p className="mt-4 text-2xl font-light text-white/70">{slide.subtitle}</p>
      </div>
    </div>
  );
}
