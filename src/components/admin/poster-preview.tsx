"use client";

import type { PosterOrientation } from "@/lib/poster-templates/types";

type Props = {
  imageBase64: string | null;
  imageUrl: string | null;
  orientation: PosterOrientation;
  generating: boolean;
};

export function PosterPreview({ imageBase64, imageUrl, orientation, generating }: Props) {
  const src = imageBase64
    ? `data:image/png;base64,${imageBase64}`
    : imageUrl;

  const isPortrait = orientation === "portrait";
  const containerClass = isPortrait
    ? "aspect-[9/16] max-h-[500px]"
    : "aspect-[16/9] max-h-[350px]";

  if (generating) {
    return (
      <div className={`${containerClass} mx-auto flex w-full max-w-sm items-center justify-center rounded-lg border-2 border-dashed border-[#C5A55A]/30 bg-muted/30`}>
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#C5A55A] border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Génération en cours...</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Cela peut prendre 10-30 secondes</p>
        </div>
      </div>
    );
  }

  if (!src) {
    return (
      <div className={`${containerClass} mx-auto flex w-full max-w-sm items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/20`}>
        <div className="text-center px-4">
          <p className="text-3xl mb-2">🖼️</p>
          <p className="text-sm text-muted-foreground">
            Aperçu de l&apos;affiche
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Remplissez les champs et cliquez sur &quot;Générer&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerClass} mx-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg`}>
      <img
        src={src}
        alt="Aperçu de l'affiche"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
