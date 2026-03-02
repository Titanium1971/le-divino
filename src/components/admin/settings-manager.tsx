"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import { setSetting } from "@/lib/supabase/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Props = {
  initialPin: string;
};

export function SettingsManager({ initialPin }: Props) {
  const supabase = createClient();
  const qrRef = useRef<HTMLDivElement>(null);

  // ── PIN state ──
  const [pin, setPin] = useState(initialPin);
  const [pinSaving, setPinSaving] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);

  // ── QR code URL ──
  const menuUrl = typeof window !== "undefined" ? `${window.location.origin}/menu` : "/menu";

  async function handleSavePin() {
    setPinSaving(true);
    setPinSaved(false);
    try {
      await setSetting(supabase, "service_pin", pin);
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
    } finally {
      setPinSaving(false);
    }
  }

  const handleDownloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);

      const link = document.createElement("a");
      link.download = "qr-menu-le-divino.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wide">Paramètres</h1>
      <p className="mt-1 text-sm text-muted-foreground">Configuration générale du restaurant.</p>

      <Separator className="my-6" />

      {/* ── Section 1: QR Code Menu ── */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-medium">QR Code — Carte en ligne</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Imprimez ce QR code pour permettre aux clients de consulter la carte depuis leur téléphone.
        </p>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div
            ref={qrRef}
            className="rounded-lg border bg-white p-4"
          >
            <QRCodeSVG value={menuUrl} size={180} level="H" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">URL : {menuUrl}</p>
            <Button variant="outline" size="sm" onClick={handleDownloadQR}>
              Télécharger PNG (512×512)
            </Button>
          </div>
        </div>
      </section>

      <Separator className="my-6" />

      {/* ── Section 2: Service PIN ── */}
      <section>
        <h2 className="mb-4 text-lg font-medium">PIN — Page service</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Code PIN utilisé pour accéder à la page /service (vue cuisine).
        </p>
        <div className="flex items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="service-pin">Code PIN</Label>
            <Input
              id="service-pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="1234"
              className="w-40"
              maxLength={6}
            />
          </div>
          <Button onClick={handleSavePin} disabled={pinSaving || !pin}>
            {pinSaving ? "Enregistrement..." : pinSaved ? "Enregistré ✓" : "Sauvegarder"}
          </Button>
        </div>
      </section>
    </div>
  );
}
