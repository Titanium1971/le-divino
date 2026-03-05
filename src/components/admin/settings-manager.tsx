"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
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
  const menuUrl = typeof window !== "undefined" ? `${window.location.origin}/menu` : "/menu";

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
        <h2 className="mb-4 text-lg font-medium">QR Code — Carte en ligne</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Imprimez ce QR code pour permettre aux clients de consulter la carte depuis leur téléphone.
        </p>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div ref={qrRef} className="rounded-lg border bg-white p-4">
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
