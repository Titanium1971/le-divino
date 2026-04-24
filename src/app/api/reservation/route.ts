import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

// Brevo API for transactional emails
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
  if (!BREVO_API_KEY) {
    console.warn("[reservation] BREVO_API_KEY not set, skipping email");
    return;
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
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
    if (!res.ok) {
      console.error("[reservation] Brevo email error:", await res.text());
    }
  } catch (e) {
    console.error("[reservation] Email send failed:", e);
  }
}

async function sendWhatsApp(to: string, message: string) {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID || !to) {
    console.warn("[reservation] WhatsApp not configured, skipping");
    return;
  }
  try {
    const res = await fetch(
      `https://graph.facebook.com/v22.0/${WA_PHONE_NUMBER_ID}/messages`,
      {
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
      }
    );
    if (!res.ok) {
      console.error("[reservation] WhatsApp error:", await res.text());
    }
  } catch (e) {
    console.error("[reservation] WhatsApp send failed:", e);
  }
}

function buildClientEmailHTML(name: string, date: string, time: string, guests: number, confirmLink: string): string {
  const dateFR = formatDateFR(date);
  return `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 0;">
  <div style="background: #0F0A0A; padding: 30px; text-align: center;">
    <h1 style="color: #C5A55A; font-size: 28px; font-weight: 400; letter-spacing: 3px; margin: 0;">LE DIVINO</h1>
    <p style="color: #FAF6F0; font-size: 12px; letter-spacing: 2px; margin-top: 5px;">CUISINE TRADITIONNELLE FRANÇAISE</p>
  </div>

  <div style="padding: 30px;">
    <h2 style="color: #0F0A0A; font-size: 20px; font-weight: 400; margin-bottom: 20px;">Confirmation de réservation</h2>

    <p style="color: #333; line-height: 1.6;">Bonjour ${name},</p>
    <p style="color: #333; line-height: 1.6;">Nous avons bien reçu votre demande de réservation et nous vous en remercions.</p>

    <div style="background: #0F0A0A; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #C5A55A; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px;">Détails de votre réservation</p>
      <p style="color: #FAF6F0; margin: 8px 0;"><strong>📅 Date :</strong> ${dateFR}</p>
      <p style="color: #FAF6F0; margin: 8px 0;"><strong>🕐 Heure :</strong> ${time}</p>
      <p style="color: #FAF6F0; margin: 8px 0;"><strong>👥 Convives :</strong> ${guests} personne${guests > 1 ? "s" : ""}</p>
      <p style="color: #FAF6F0; margin: 8px 0;"><strong>📍 Adresse :</strong> 5 place Jean Jaurès, 34300 Agde</p>
    </div>

    <p style="color: #333; line-height: 1.6;">Votre réservation est en attente de confirmation. Vous pouvez la confirmer en cliquant sur le bouton ci-dessous :</p>

    <div style="text-align: center; margin: 25px 0;">
      <a href="${confirmLink}" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 1px;">&#9989; Confirmer ma réservation</a>
    </div>

    <p style="color: #333; line-height: 1.6;">Pour toute modification ou annulation, contactez-nous au <strong>04 48 17 78 75</strong> ou répondez à cet email.</p>

    <p style="color: #333; line-height: 1.6; margin-top: 25px;">À très bientôt,<br><strong>L'équipe du Divino</strong></p>
  </div>

  <div style="background: #0F0A0A; padding: 20px; text-align: center;">
    <p style="color: #FAF6F0; font-size: 11px; margin: 0;">Le Divino — 5 place Jean Jaurès, 34300 Agde</p>
    <p style="color: #C5A55A; font-size: 11px; margin: 5px 0 0;">04 48 17 78 75 · contact@ledivino-agde.fr</p>
  </div>
</div>`;
}

function buildOwnerEmailHTML(
  name: string, email: string, phone: string,
  date: string, time: string, guests: number, message: string | null
): string {
  const dateFR = formatDateFR(date);
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #6B1A2A; padding: 20px; text-align: center;">
    <h1 style="color: white; font-size: 20px; margin: 0;">🔔 Nouvelle réservation</h1>
  </div>

  <div style="padding: 20px; background: #f9f9f9;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px; font-weight: bold; width: 120px;">Nom</td><td style="padding: 8px;">${name}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Téléphone</td><td style="padding: 8px;"><a href="tel:${phone}">${phone}</a></td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Date</td><td style="padding: 8px;">${dateFR}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Heure</td><td style="padding: 8px;">${time}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Convives</td><td style="padding: 8px;">${guests}</td></tr>
      ${message ? `<tr><td style="padding: 8px; font-weight: bold;">Message</td><td style="padding: 8px;">${message}</td></tr>` : ""}
    </table>
  </div>

  <div style="padding: 15px; text-align: center;">
    <a href="https://www.ledivino-agde.fr/admin" style="background: #6B1A2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Voir dans l'admin</a>
  </div>
</div>`;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, phone, date, time, guests, message } = body as Record<string, string>;

  if (!name || !email || !phone || !date || !time || !guests) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (!DATE_REGEX.test(date)) {
    return NextResponse.json(
      { error: "Invalid date format. Expected YYYY-MM-DD." },
      { status: 400 },
    );
  }

  if (!TIME_REGEX.test(time)) {
    return NextResponse.json(
      { error: "Invalid time format. Expected HH:MM." },
      { status: 400 },
    );
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Anti-duplicate: check if same email+date+time exists within last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("reservations")
      .select("id")
      .eq("email", email)
      .eq("date", date)
      .eq("time", time)
      .gte("created_at", fiveMinAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, id: existing[0].id, duplicate: true });
    }

    const insertData = {
      name,
      email,
      phone,
      date,
      time,
      guests: Number(guests),
      message: (message as string) ?? null,
      status: "pending" as const,
    };

    const { data: row, error: dbError } = await supabase
      .from("reservations")
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error("[reservation] Supabase error:", JSON.stringify(dbError));
      return NextResponse.json(
        { error: "Database error", details: dbError.message },
        { status: 500 },
      );
    }

    // Upsert client in chat_clients for CRM tracking
    const { data: existingClient } = await supabase
      .from("chat_clients")
      .select("id, visit_count")
      .eq("email", email)
      .single();

    if (existingClient) {
      await supabase
        .from("chat_clients")
        .update({
          name,
          phone,
          visit_count: (existingClient.visit_count || 0) + 1,
          last_visit_date: date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingClient.id);
    } else {
      await supabase.from("chat_clients").insert({
        email,
        name,
        phone,
        visit_count: 1,
        last_visit_date: date,
        gdpr_consent: true,
        gdpr_consent_date: new Date().toISOString(),
      });
    }

    // Send notifications in parallel (fire-and-forget, don't block the response)
    const guestsNum = Number(guests);
    const msgStr = (message as string) || null;

    // Build confirmation link with token (first 8 chars of ID)
    const token = String(row.id).substring(0, 8);
    const confirmLink = `https://www.ledivino-agde.fr/api/reservation/confirm?id=${row.id}&token=${token}`;

    const results = await Promise.allSettled([
      // Email to client
      sendBrevoEmail(
        email,
        name,
        `Confirmation de réservation — Le Divino (${formatDateFR(date)})`,
        buildClientEmailHTML(name, date, time, guestsNum, confirmLink)
      ),
      // Email to owner
      sendBrevoEmail(
        OWNER_EMAIL,
        "Le Divino",
        `🔔 Nouvelle réservation : ${name} — ${formatDateFR(date)} à ${time} (${guestsNum} pers.)`,
        buildOwnerEmailHTML(name, email, phone, date, time, guestsNum, msgStr)
      ),
      // WhatsApp to owner
      sendWhatsApp(
        OWNER_WHATSAPP,
        `🔔 Nouvelle réservation !\n\n👤 ${name}\n📅 ${formatDateFR(date)}\n🕐 ${time}\n👥 ${guestsNum} personne${guestsNum > 1 ? "s" : ""}\n📞 ${phone}\n📧 ${email}${msgStr ? "\n💬 " + msgStr : ""}\n\n→ Confirme dans l'admin`
      ),
    ]);
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`[reservation] Notification ${i} failed:`, r.reason);
      }
    });

    return NextResponse.json({ success: true, id: row.id });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[reservation] Failed:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create reservation", details: errorMessage },
      { status: 500 },
    );
  }
}
