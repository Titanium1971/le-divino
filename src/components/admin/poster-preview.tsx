"use client";

import { useEffect, useRef, useState } from "react";
import type { PosterTemplate, PosterOrientation } from "@/lib/poster-templates/types";
import { renderPosterComposite } from "@/lib/poster-canvas-renderer";

type Props = {
  backgroundBase64: string | null;
  compositeBase64: string | null;
  orientation: PosterOrientation;
  generating: boolean;
  template: PosterTemplate | null;
  variables: Record<string, string>;
  fontId: string;
};

export function PosterPreview({
  backgroundBase64,
  compositeBase64,
  orientation,
  generating,
  template,
  variables,
  fontId,
}: Props) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const renderRef = useRef(0);

  const isPortrait = orientation === "portrait";
  const containerClass = isPortrait
    ? "aspect-[9/16] max-h-[500px]"
    : "aspect-[16/9] max-h-[350px]";

  // Live canvas preview: re-render when background, variables, or font change
  useEffect(() => {
    if (compositeBase64) {
      setPreviewSrc(`data:image/jpeg;base64,${compositeBase64}`);
      return;
    }

    if (!backgroundBase64 || !template) {
      setPreviewSrc(null);
      return;
    }

    const id = ++renderRef.current;

    renderPosterComposite({
      backgroundBase64,
      variables,
      template,
      orientation,
      fontId,
      scale: 0.5,
    })
      .then((base64) => {
        if (renderRef.current === id) {
          setPreviewSrc(`data:image/jpeg;base64,${base64}`);
        }
      })
      .catch((err) => {
        console.error("Preview render error:", err);
      });
  }, [backgroundBase64, compositeBase64, variables, template, orientation, fontId]);

  if (generating) {
    return (
      <div
        className={`${containerClass} mx-auto flex w-full max-w-sm items-center justify-center rounded-lg border-2 border-dashed border-[#C5A55A]/30 bg-muted/30`}
      >
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#C5A55A] border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Génération en cours...</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Cela peut prendre 10-30 secondes</p>
        </div>
      </div>
    );
  }

  if (!previewSrc) {
    return (
      <div
        className={`${containerClass} mx-auto flex w-full max-w-sm items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/20`}
      >
        <div className="text-center px-4">
          <p className="text-3xl mb-2">🖼️</p>
          <p className="text-sm text-muted-foreground">Aperçu de l&apos;affiche</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Remplissez les champs et cliquez sur &quot;Générer&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerClass} mx-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg`}>
      <img src={previewSrc} alt="Aperçu de l'affiche" className="h-full w-full object-cover" />
    </div>
  );
}
