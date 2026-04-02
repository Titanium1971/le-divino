import { createClient } from "@supabase/supabase-js";
import {
  getOrCreateClient,
  updateClientPreferences,
  getClientReservations,
} from "@/lib/supabase/chat";
import { getUpcomingEvents } from "@/lib/supabase/events";
import { getRestaurantContext } from "./context-loader";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ledivino-agde.fr";
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "contact@ledivino-agde.fr";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Le Divino";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "contact@ledivino-agde.fr";
const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP || "";
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID || "";
const WA_TOKEN = process.env.WA_TOKEN || "";

function formatDateFR(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function sendBrevoEmail(to: string, toName: string, subject: string, htmlContent: string) {
  if (!BREVO_API_KEY) return;
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent,
      }),
    });
  } catch (e) {
    console.error("[chat] Email send failed:", e);
  }
}

async function sendWhatsApp(to: string, message: string) {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID || !to) return;
  try {
    await fetch(`https://graph.facebook.com/v22.0/${WA_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });
  } catch (e) {
    console.error("[chat] WhatsApp send failed:", e);
  }
}

function buildCancellationClientEmail(name: string, date: string, time: string, guests: number): string {
  const dateFR = formatDateFR(date);
  return `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 0;">
  <div style="background: #0F0A0A; padding: 30px; text-align: center;">
    <h1 style="color: #C5A55A; font-size: 28px; font-weight: 400; letter-spacing: 3px; margin: 0;">LE DIVINO</h1>
    <p style="color: #FAF6F0; font-size: 12px; letter-spacing: 2px; margin-top: 5px;">CUISINE TRADITIONNELLE FRANÇAISE</p>
  </div>
  <div style="padding: 30px;">
    <h2 style="color: #0F0A0A; font-size: 20px; font-weight: 400; margin-bottom: 20px;">Annulation de réservation</h2>
    <p style="color: #333; line-height: 1.6;">Bonjour ${name},</p>
    <p style="color: #333; line-height: 1.6;">Nous vous confirmons l'annulation de votre réservation.</p>
    <div style="background: #0F0A0A; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #C5A55A; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px;">Réservation annulée</p>
      <p style="color: #FAF6F0; margin: 8px 0;">📅 Date : ${dateFR}</p>
      <p style="color: #FAF6F0; margin: 8px 0;">🕐 Heure : ${time}</p>
      <p style="color: #FAF6F0; margin: 8px 0;">👥 Convives : ${guests} personne${guests > 1 ? "s" : ""}</p>
    </div>
    <p style="color: #333; line-height: 1.6;">Nous espérons vous accueillir prochainement. N'hésitez pas à effectuer une nouvelle réservation quand vous le souhaitez.</p>
    <p style="color: #333; line-height: 1.6; margin-top: 25px;">À bientôt,<br><strong>L'équipe du Divino</strong></p>
  </div>
  <div style="background: #0F0A0A; padding: 20px; text-align: center;">
    <p style="color: #FAF6F0; font-size: 11px; margin: 0;">Le Divino — 5 place Jean Jaurès, 34300 Agde</p>
    <p style="color: #C5A55A; font-size: 11px; margin: 5px 0 0;">04 48 17 78 75 · contact@ledivino-agde.fr</p>
  </div>
</div>`;
}

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

function localize(row: Record<string, unknown>, locale: string, fields: string[]): Record<string, unknown> {
  const result = { ...row };
  for (const field of fields) {
    const localized = row[`${field}_${locale}`] || row[`${field}_fr`] || "";
    result[field] = localized;
    // Clean up locale-specific fields
    for (const l of ["fr", "en", "it", "es", "de"]) {
      delete result[`${field}_${l}`];
    }
  }
  return result;
}

export async function handleToolCall(
  toolName: string,
  input: Record<string, unknown>,
  locale: string,
): Promise<string> {
  const supabase = getSupabase();

  switch (toolName) {
    case "get_menu": {
      let query = supabase
        .from("dishes")
        .select("*")
        .eq("available", true)
        .order("sort_order");

      if (input.category) query = query.eq("category", input.category);
      if (input.source) query = query.eq("source", input.source);

      const { data, error } = await query;
      if (error) return JSON.stringify({ error: error.message });

      const dishes = (data ?? []).map((d) =>
        localize(d, locale, ["name", "description"]),
      );

      // Also get formulas/menus
      const { data: menus } = await supabase
        .from("menus")
        .select("*")
        .eq("active", true)
        .order("price");

      const formulas = (menus ?? []).map((m) =>
        localize(m, locale, ["name", "description"]),
      );

      return JSON.stringify({ dishes, formulas });
    }

    case "get_wines": {
      let query = supabase
        .from("wines")
        .select("*")
        .eq("available", true)
        .order("sort_order");

      if (input.color) query = query.eq("color", input.color);

      const { data, error } = await query;
      if (error) return JSON.stringify({ error: error.message });

      const wines = (data ?? []).map((w) =>
        localize(w, locale, ["description"]),
      );
      return JSON.stringify({ wines });
    }

    case "get_drinks": {
      let query = supabase
        .from("drinks")
        .select("*")
        .eq("available", true)
        .order("sort_order");

      if (input.category) query = query.eq("category", input.category);

      const { data, error } = await query;
      if (error) return JSON.stringify({ error: error.message });

      const drinks = (data ?? []).map((d) =>
        localize(d, locale, ["name", "description"]),
      );
      return JSON.stringify({ drinks });
    }

    case "get_events": {
      const events = await getUpcomingEvents(supabase);
      const localized = events.map((e) => ({
        title: e.title[locale as keyof typeof e.title] || e.title.fr,
        description: e.description[locale as keyof typeof e.description] || e.description.fr,
        date: e.event_date,
        time: e.event_time,
        end_time: e.end_time,
        type: e.event_type,
      }));
      return JSON.stringify({ events: localized });
    }

    case "get_hours": {
      const ctx = await getRestaurantContext();
      return JSON.stringify({
        hours: ctx.hours,
        conges: ctx.conges,
      });
    }

    case "create_reservation": {
      try {
        const res = await fetch(`${SITE_URL}/api/reservation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: input.name,
            email: input.email,
            phone: input.phone,
            date: input.date,
            time: input.time,
            guests: input.guests,
            message: input.message || null,
          }),
        });
        const result = await res.json();
        if (result.success) {
          return JSON.stringify({
            success: true,
            message: "Réservation créée avec succès. Un email de confirmation a été envoyé.",
          });
        }
        return JSON.stringify({ success: false, error: result.error || "Erreur lors de la réservation" });
      } catch (e) {
        return JSON.stringify({ success: false, error: `Erreur: ${e}` });
      }
    }

    case "get_client_profile": {
      const email = input.email as string;
      try {
        const client = await getOrCreateClient(supabase, email, undefined, locale);
        const reservations = await getClientReservations(supabase, email);
        return JSON.stringify({ client, past_reservations: reservations });
      } catch {
        return JSON.stringify({ error: "Client non trouvé" });
      }
    }

    case "update_client_preferences": {
      const email = input.email as string;
      try {
        await updateClientPreferences(supabase, email, {
          allergies: input.allergies as string[] | undefined,
          dietary_preferences: input.dietary_preferences as string[] | undefined,
          taste_notes: input.taste_notes as string | undefined,
        });
        return JSON.stringify({ success: true, message: "Préférences mises à jour" });
      } catch {
        return JSON.stringify({ error: "Erreur lors de la mise à jour" });
      }
    }

    case "get_reservations": {
      const email = input.email as string;
      const { data, error } = await supabase
        .from("reservations")
        .select("id, name, email, phone, date, time, guests, message, status, created_at")
        .eq("email", email)
        .in("status", ["pending", "confirmed"])
        .order("date", { ascending: true });

      if (error) return JSON.stringify({ error: error.message });
      if (!data || data.length === 0) {
        return JSON.stringify({ reservations: [], message: "Aucune réservation trouvée pour cet email." });
      }
      return JSON.stringify({ reservations: data });
    }

    case "cancel_reservation": {
      const id = input.reservation_id as string;

      // Vérifier que la réservation existe avec toutes les infos
      const { data: existing, error: fetchErr } = await supabase
        .from("reservations")
        .select("id, name, email, phone, date, time, guests, status")
        .eq("id", id)
        .single();

      if (fetchErr || !existing) {
        return JSON.stringify({ success: false, error: "Réservation introuvable." });
      }
      if (existing.status === "cancelled") {
        return JSON.stringify({ success: false, error: "Cette réservation est déjà annulée." });
      }

      const { error: updateErr } = await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (updateErr) return JSON.stringify({ success: false, error: updateErr.message });

      const dateFR = formatDateFR(existing.date);

      // Envoyer les notifications d'annulation en parallèle
      await Promise.allSettled([
        // Email au client
        sendBrevoEmail(
          existing.email,
          existing.name,
          `Annulation de réservation — Le Divino (${dateFR})`,
          buildCancellationClientEmail(existing.name, existing.date, existing.time, existing.guests),
        ),
        // Email au propriétaire
        sendBrevoEmail(
          OWNER_EMAIL,
          "Le Divino",
          `❌ Annulation : ${existing.name} — ${dateFR} à ${existing.time} (${existing.guests} pers.)`,
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; padding: 20px; text-align: center;">
              <h1 style="color: white; font-size: 20px; margin: 0;">❌ Réservation annulée</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold; width: 120px;">Nom</td><td style="padding: 8px;">${existing.name}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${existing.email}">${existing.email}</a></td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Téléphone</td><td style="padding: 8px;"><a href="tel:${existing.phone}">${existing.phone}</a></td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Date</td><td style="padding: 8px;">${dateFR}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Heure</td><td style="padding: 8px;">${existing.time}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Convives</td><td style="padding: 8px;">${existing.guests}</td></tr>
              </table>
            </div>
          </div>`,
        ),
        // WhatsApp au propriétaire
        sendWhatsApp(
          OWNER_WHATSAPP,
          `❌ Annulation de réservation\n\n👤 ${existing.name}\n📅 ${dateFR}\n🕐 ${existing.time}\n👥 ${existing.guests} personne${existing.guests > 1 ? "s" : ""}\n📞 ${existing.phone}\n📧 ${existing.email}`,
        ),
      ]);

      return JSON.stringify({
        success: true,
        message: `Réservation de ${existing.name} le ${existing.date} à ${existing.time} annulée. Un email de confirmation d'annulation a été envoyé.`,
      });
    }

    case "modify_reservation": {
      const oldId = input.old_reservation_id as string;

      // 1. Vérifier et annuler l'ancienne réservation
      const { data: oldRes, error: oldErr } = await supabase
        .from("reservations")
        .select("id, name, email, phone, date, time, guests, status")
        .eq("id", oldId)
        .single();

      if (oldErr || !oldRes) {
        return JSON.stringify({ success: false, error: "Ancienne réservation introuvable." });
      }

      if (oldRes.status !== "cancelled") {
        await supabase
          .from("reservations")
          .update({ status: "cancelled" })
          .eq("id", oldId);

        const oldDateFR = formatDateFR(oldRes.date);

        // Notifications d'annulation
        await Promise.allSettled([
          sendBrevoEmail(
            oldRes.email,
            oldRes.name,
            `Annulation de réservation — Le Divino (${oldDateFR})`,
            buildCancellationClientEmail(oldRes.name, oldRes.date, oldRes.time, oldRes.guests),
          ),
          sendBrevoEmail(
            OWNER_EMAIL,
            "Le Divino",
            `❌ Annulation (modification) : ${oldRes.name} — ${oldDateFR} à ${oldRes.time}`,
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #dc2626; padding: 20px; text-align: center;">
                <h1 style="color: white; font-size: 20px; margin: 0;">❌ Réservation modifiée (ancienne annulée)</h1>
              </div>
              <div style="padding: 20px; background: #f9f9f9;">
                <p><strong>${oldRes.name}</strong> a modifié sa réservation du ${oldDateFR} à ${oldRes.time}.</p>
                <p>Une nouvelle réservation a été créée.</p>
              </div>
            </div>`,
          ),
          sendWhatsApp(
            OWNER_WHATSAPP,
            `🔄 Modification de réservation\n\n👤 ${oldRes.name}\n❌ Ancienne : ${oldDateFR} à ${oldRes.time}\n\nUne nouvelle réservation suit.`,
          ),
        ]);
      }

      // 2. Créer la nouvelle réservation
      try {
        const res = await fetch(`${SITE_URL}/api/reservation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: input.name,
            email: input.email,
            phone: input.phone,
            date: input.date,
            time: input.time,
            guests: input.guests,
            message: input.message || null,
          }),
        });
        const result = await res.json();
        if (result.success) {
          const newDateFR = formatDateFR(input.date as string);
          return JSON.stringify({
            success: true,
            message: `Réservation modifiée avec succès. Ancienne réservation annulée, nouvelle réservation le ${newDateFR} à ${input.time} pour ${input.guests} convives. Emails de confirmation envoyés.`,
          });
        }
        return JSON.stringify({ success: false, error: result.error || "Erreur lors de la création de la nouvelle réservation" });
      } catch (e) {
        return JSON.stringify({ success: false, error: `Erreur: ${e}` });
      }
    }

    case "get_google_reviews": {
      try {
        const res = await fetch(`${SITE_URL}/api/google-reviews?lang=${locale}`);
        if (!res.ok) return JSON.stringify({ error: "Impossible de récupérer les avis" });
        const data = await res.json();
        return JSON.stringify({
          rating: data.rating,
          totalReviews: data.totalReviews,
          reviews: (data.reviews ?? []).map((r: { author: string; rating: number; text: string; relativeTime: string }) => ({
            author: r.author,
            rating: r.rating,
            text: r.text,
            relativeTime: r.relativeTime,
          })),
        });
      } catch {
        return JSON.stringify({ error: "Erreur lors de la récupération des avis" });
      }
    }

    default:
      return JSON.stringify({ error: `Outil inconnu: ${toolName}` });
  }
}
