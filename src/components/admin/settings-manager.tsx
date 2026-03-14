"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import { createClient } from "@/lib/supabase/client";
import { setSetting } from "@/lib/supabase/settings";
import { logActivity } from "@/lib/supabase/activity-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Horaires, DayHoraires } from "@/lib/supabase/horaires";

// ── Types ──

type RestaurantInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
};

type SocialLinks = {
  instagram: string;
  facebook: string;
  tripadvisor: string;
  google_maps: string;
};

type ReservationConfig = {
  min_delay_hours: number;
  max_group_size: number;
  confirmation_message: string;
};

const DAYS: { key: keyof Horaires; label: string }[] = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

// Generate time options from 00:00 to 23:30 in 30-min steps
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

type Props = {
  initialPin: string;
  initialRestaurantInfo: RestaurantInfo;
  initialHoraires: Horaires;
  initialSocialLinks: SocialLinks;
  initialReservationConfig: ReservationConfig;
};

export function SettingsManager({
  initialPin,
  initialRestaurantInfo,
  initialHoraires,
  initialSocialLinks,
  initialReservationConfig,
}: Props) {
  const supabase = createClient();
  const qrRef = useRef<HTMLDivElement>(null);

  // ── State ──
  const [info, setInfo] = useState<RestaurantInfo>(initialRestaurantInfo);
  const [horaires, setHoraires] = useState<Horaires>(initialHoraires);
  const [social, setSocial] = useState<SocialLinks>(initialSocialLinks);
  const [reservation, setReservation] = useState<ReservationConfig>(initialReservationConfig);
  const [pin, setPin] = useState(initialPin);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── QR code ──
  const qrUrl = "https://www.ledivino-agde.fr/fr/qr";
  const [pdfSize, setPdfSize] = useState<"7x7" | "10x10" | "a4">("10x10");

  const handleDownloadSVG = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgData = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = "qr-le-divino.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  /** Convert the SVG QR to a canvas at the given pixel size */
  const qrToCanvas = useCallback((size: number): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const svg = qrRef.current?.querySelector("svg");
      if (!svg) return reject(new Error("SVG not found"));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context failed"));

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    try {
      const canvas = await qrToCanvas(600);
      const qrDataUrl = canvas.toDataURL("image/png");

      // Page dimensions in mm
      const sizes: Record<string, { w: number; h: number }> = {
        "7x7": { w: 70, h: 85 },
        "10x10": { w: 100, h: 120 },
        a4: { w: 210, h: 297 },
      };
      const { w: pageW, h: pageH } = sizes[pdfSize];

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pageW, pageH],
      });

      // QR size: fill most of the width with margin
      const margin = pdfSize === "a4" ? 30 : 8;
      const qrSize = pageW - margin * 2;
      const qrX = margin;
      const qrY = pdfSize === "a4" ? 40 : 5;

      pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

      // "Le Divino" text below QR
      pdf.setFont("helvetica", "normal");
      const fontSize = pdfSize === "a4" ? 12 : pdfSize === "10x10" ? 9 : 7;
      pdf.setFontSize(fontSize);
      pdf.setTextColor(60, 60, 60);
      pdf.text("Le Divino", pageW / 2, qrY + qrSize + (pdfSize === "a4" ? 15 : 7), {
        align: "center",
      });

      pdf.save(`qr-le-divino-${pdfSize}.pdf`);
    } catch {
      /* ignore */
    }
  }, [qrToCanvas, pdfSize]);

  // ── Helpers for horaires ──
  function toggleDay(day: keyof Horaires) {
    setHoraires((prev) => ({
      ...prev,
      [day]: { ...prev[day], ouvert: !prev[day].ouvert },
    }));
  }

  function updateDay(day: keyof Horaires, field: keyof DayHoraires, value: string | boolean) {
    setHoraires((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  // ── Save all ──
  async function handleSaveAll() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await Promise.all([
        setSetting(supabase, "restaurant_info", info),
        setSetting(supabase, "horaires", horaires),
        setSetting(supabase, "social_links", social),
        setSetting(supabase, "reservation_config", reservation),
        setSetting(supabase, "service_pin", pin),
      ]);
      await logActivity(supabase, {
        action: "UPDATE",
        entityType: "settings",
        entityName: "Paramètres généraux",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-light tracking-wide">Paramètres</h1>
      <p className="mt-1 text-sm text-muted-foreground">Configuration générale du restaurant.</p>

      <Separator className="my-6" />

      {/* ══════════════════════════════════════════════
          Section 1: Informations restaurant
          ══════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Informations du restaurant</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="info-name">Nom</Label>
            <Input
              id="info-name"
              value={info.name}
              onChange={(e) => setInfo((p) => ({ ...p, name: e.target.value }))}
              placeholder="Le Divino"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="info-address">Adresse</Label>
            <Input
              id="info-address"
              value={info.address}
              onChange={(e) => setInfo((p) => ({ ...p, address: e.target.value }))}
              placeholder="5 Place Jean Jaurès, 34300 Agde"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="info-phone">Téléphone</Label>
            <Input
              id="info-phone"
              value={info.phone}
              onChange={(e) => setInfo((p) => ({ ...p, phone: e.target.value }))}
              placeholder="04 48 17 78 75"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="info-email">Email</Label>
            <Input
              id="info-email"
              type="email"
              value={info.email}
              onChange={(e) => setInfo((p) => ({ ...p, email: e.target.value }))}
              placeholder="contact@ledivino-agde.fr"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="info-website">Site web</Label>
            <Input
              id="info-website"
              value={info.website}
              onChange={(e) => setInfo((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://ledivino-agde.fr"
            />
          </div>
        </div>
      </section>

      <Separator className="my-6" />

      {/* ══════════════════════════════════════════════
          Section 2: Horaires d'ouverture
          ══════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Horaires d&apos;ouverture</h2>
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const day = horaires[key];
            return (
              <div
                key={key}
                className={`flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center ${
                  !day.ouvert ? "opacity-50" : ""
                }`}
              >
                <div className="flex w-28 shrink-0 items-center gap-2">
                  <Switch
                    checked={day.ouvert}
                    onCheckedChange={() => toggleDay(key)}
                    aria-label={`${label} ouvert`}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </div>

                {day.ouvert ? (
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Ouverture</Label>
                      <Select
                        value={day.debut}
                        onValueChange={(v) => updateDay(key, "debut", v)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Heure" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Fermeture</Label>
                      <Select
                        value={day.fin}
                        onValueChange={(v) => updateDay(key, "fin", v)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Heure" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm italic text-muted-foreground">Fermé</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="my-6" />

      {/* ══════════════════════════════════════════════
          Section 3: Réseaux sociaux
          ══════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Réseaux sociaux</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="social-instagram">Instagram</Label>
            <Input
              id="social-instagram"
              value={social.instagram}
              onChange={(e) => setSocial((p) => ({ ...p, instagram: e.target.value }))}
              placeholder="https://instagram.com/ledivino"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-facebook">Facebook</Label>
            <Input
              id="social-facebook"
              value={social.facebook}
              onChange={(e) => setSocial((p) => ({ ...p, facebook: e.target.value }))}
              placeholder="https://facebook.com/ledivino"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-tripadvisor">TripAdvisor</Label>
            <Input
              id="social-tripadvisor"
              value={social.tripadvisor}
              onChange={(e) => setSocial((p) => ({ ...p, tripadvisor: e.target.value }))}
              placeholder="https://tripadvisor.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-gmaps">Google Maps</Label>
            <Input
              id="social-gmaps"
              value={social.google_maps}
              onChange={(e) => setSocial((p) => ({ ...p, google_maps: e.target.value }))}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </section>

      <Separator className="my-6" />

      {/* ══════════════════════════════════════════════
          Section 4: Configuration réservations
          ══════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Configuration des réservations</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="res-delay">Délai minimum (heures)</Label>
            <Input
              id="res-delay"
              type="number"
              min={0}
              value={reservation.min_delay_hours}
              onChange={(e) =>
                setReservation((p) => ({ ...p, min_delay_hours: parseInt(e.target.value) || 0 }))
              }
              placeholder="2"
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Nombre d&apos;heures minimum avant une réservation.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="res-max">Taille max du groupe</Label>
            <Input
              id="res-max"
              type="number"
              min={1}
              value={reservation.max_group_size}
              onChange={(e) =>
                setReservation((p) => ({ ...p, max_group_size: parseInt(e.target.value) || 1 }))
              }
              placeholder="20"
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Au-delà, demander de contacter le restaurant.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="res-message">Message de confirmation</Label>
            <Textarea
              id="res-message"
              value={reservation.confirmation_message}
              onChange={(e) =>
                setReservation((p) => ({ ...p, confirmation_message: e.target.value }))
              }
              placeholder="Merci pour votre réservation ! Nous avons hâte de vous accueillir au Divino."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Message personnalisé affiché après confirmation d&apos;une réservation.
            </p>
          </div>
        </div>
      </section>

      <Separator className="my-6" />

      {/* ══════════════════════════════════════════════
          Section 5: PIN Service
          ══════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">PIN — Page service</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Code PIN utilisé pour accéder à la page /service (vue cuisine).
        </p>
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
      </section>

      <Separator className="my-6" />

      {/* ══════════════════════════════════════════════
          Section 6: QR Code Menu
          ══════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">QR Code — Menu en salle</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Imprimez ce QR code pour permettre aux clients de consulter la carte, les menus, les vins et les boissons depuis leur téléphone.
        </p>
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-start">
          <div ref={qrRef} className="rounded-lg border bg-white p-4">
            <QRCodeSVG value={qrUrl} size={200} level="H" />
          </div>
          <div className="space-y-4">
            <p className="text-sm">
              <span className="font-medium">URL :</span>{" "}
              <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {qrUrl}
              </a>
            </p>

            {/* SVG download */}
            <div>
              <Button variant="outline" size="sm" onClick={handleDownloadSVG}>
                Télécharger SVG (vectoriel)
              </Button>
            </div>

            {/* PDF download with size selector */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  Télécharger PDF
                </Button>
                <div className="flex items-center gap-1 rounded-md border px-1">
                  {(["7x7", "10x10", "a4"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setPdfSize(size)}
                      className={`rounded px-2 py-1 text-xs transition-colors ${
                        pdfSize === size
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {size === "a4" ? "A4" : `${size}cm`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Note for printer */}
            <p className="text-xs text-muted-foreground italic">
              Pour l&apos;imprimeur : privilégiez le format SVG.
              Précisez la taille souhaitée (ex: 8×8cm).
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          Global save button
          ══════════════════════════════════════════════ */}
      <div className="sticky bottom-0 border-t bg-background py-4">
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        <Button onClick={handleSaveAll} disabled={saving} className="w-full sm:w-auto">
          {saving ? "Enregistrement..." : saved ? "Enregistré ✓" : "Sauvegarder tous les paramètres"}
        </Button>
      </div>
    </div>
  );
}
