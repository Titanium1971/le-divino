"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import { createClient } from "@/lib/supabase/client";
import { setSetting } from "@/lib/supabase/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// ── Types ──

type RestaurantInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
};

type DayHours = { midi: string; soir: string } | null;

type OpeningHours = {
  lundi: DayHours;
  mardi: DayHours;
  mercredi: DayHours;
  jeudi: DayHours;
  vendredi: DayHours;
  samedi: DayHours;
  dimanche: DayHours;
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

const DAYS: { key: keyof OpeningHours; label: string }[] = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

type Props = {
  initialPin: string;
  initialRestaurantInfo: RestaurantInfo;
  initialOpeningHours: OpeningHours;
  initialSocialLinks: SocialLinks;
  initialReservationConfig: ReservationConfig;
};

export function SettingsManager({
  initialPin,
  initialRestaurantInfo,
  initialOpeningHours,
  initialSocialLinks,
  initialReservationConfig,
}: Props) {
  const supabase = createClient();
  const qrRef = useRef<HTMLDivElement>(null);

  // ── State ──
  const [info, setInfo] = useState<RestaurantInfo>(initialRestaurantInfo);
  const [hours, setHours] = useState<OpeningHours>(initialOpeningHours);
  const [social, setSocial] = useState<SocialLinks>(initialSocialLinks);
  const [reservation, setReservation] = useState<ReservationConfig>(initialReservationConfig);
  const [pin, setPin] = useState(initialPin);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── QR code ──
  const qrUrl = "https://ledivino-agde.fr/fr/qr";

  /** Convert the SVG QR to a PNG data URL at the given size */
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

  const handleDownloadPNG = useCallback(async () => {
    try {
      const canvas = await qrToCanvas(256);
      const link = document.createElement("a");
      link.download = "qr-menu-le-divino.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      /* ignore */
    }
  }, [qrToCanvas]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      const canvas = await qrToCanvas(600);
      const qrDataUrl = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;

      // Background beige
      pdf.setFillColor(245, 240, 230);
      pdf.rect(0, 0, 210, 297, "F");

      // Top decorative line
      pdf.setDrawColor(180, 140, 80);
      pdf.setLineWidth(0.5);
      pdf.line(30, 35, 180, 35);

      // Title "LE DIVINO"
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(32);
      pdf.setTextColor(45, 25, 15);
      pdf.text("LE DIVINO", pageW / 2, 55, { align: "center" });

      // Subtitle
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(140, 100, 60);
      pdf.text("RESTAURANT \u2022 AGDE", pageW / 2, 65, { align: "center" });

      // Decorative line under title
      pdf.line(80, 72, 130, 72);

      // QR Code centered — 120x120mm
      const qrSize = 120;
      const qrX = (pageW - qrSize) / 2;
      const qrY = 85;

      // White background for QR
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 3, 3, "F");

      // Border around QR
      pdf.setDrawColor(180, 140, 80);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 3, 3, "S");

      pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

      // Text under QR
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.setTextColor(45, 25, 15);
      pdf.text("Scannez pour consulter notre carte", pageW / 2, qrY + qrSize + 20, {
        align: "center",
      });

      // Decorative line
      pdf.setDrawColor(180, 140, 80);
      pdf.line(60, qrY + qrSize + 28, 150, qrY + qrSize + 28);

      // URL
      pdf.setFontSize(9);
      pdf.setTextColor(140, 100, 60);
      pdf.text(qrUrl, pageW / 2, qrY + qrSize + 36, { align: "center" });

      // Bottom address
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 80, 60);
      pdf.text("5 place Jean Jaur\u00e8s, 34300 Agde", pageW / 2, 270, { align: "center" });
      pdf.setFontSize(9);
      pdf.text("04 48 17 78 75  \u2022  ledivino-agde.fr", pageW / 2, 277, { align: "center" });

      // Bottom decorative line
      pdf.line(30, 284, 180, 284);

      pdf.save("qr-menu-le-divino.pdf");
    } catch {
      /* ignore */
    }
  }, [qrToCanvas, qrUrl]);

  // ── Helpers for hours ──
  function toggleDay(day: keyof OpeningHours) {
    setHours((prev) => ({
      ...prev,
      [day]: prev[day] ? null : { midi: "12:00–14:30", soir: "19:00–22:30" },
    }));
  }

  function updateDayHours(day: keyof OpeningHours, service: "midi" | "soir", value: string) {
    setHours((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return { ...prev, [day]: { ...current, [service]: value } };
    });
  }

  // ── Save all ──
  async function handleSaveAll() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await Promise.all([
        setSetting(supabase, "restaurant_info", info),
        setSetting(supabase, "opening_hours", hours),
        setSetting(supabase, "social_links", social),
        setSetting(supabase, "reservation_config", reservation),
        setSetting(supabase, "service_pin", pin),
      ]);
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
            const isOpen = hours[key] !== null;
            return (
              <div
                key={key}
                className={`flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center ${
                  !isOpen ? "opacity-50" : ""
                }`}
              >
                <div className="flex w-28 shrink-0 items-center gap-2">
                  <Switch
                    checked={isOpen}
                    onCheckedChange={() => toggleDay(key)}
                    aria-label={`${label} ouvert`}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </div>

                {isOpen && hours[key] && (
                  <div className="flex flex-1 gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Midi</Label>
                      <Input
                        value={hours[key]!.midi}
                        onChange={(e) => updateDayHours(key, "midi", e.target.value)}
                        placeholder="12:00–14:30"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Soir</Label>
                      <Input
                        value={hours[key]!.soir}
                        onChange={(e) => updateDayHours(key, "soir", e.target.value)}
                        placeholder="19:00–22:30"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                )}

                {!isOpen && (
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
          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-medium">URL :</span>{" "}
              <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {qrUrl}
              </a>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
                Télécharger PNG (256×256)
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                Télécharger PDF (A4)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Le PDF contient un design prêt à imprimer avec le logo et les coordonnées du restaurant.
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
