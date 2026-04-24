import { NextRequest, NextResponse } from "next/server";

const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "contact@ledivino-agde.fr";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Le Divino";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "contact@ledivino-agde.fr";

async function sendBrevoEmail(to: string, toName: string, subject: string, htmlContent: string) {
  if (!BREVO_API_KEY) {
    console.warn("[contact] BREVO_API_KEY not set, skipping email");
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
      console.error("[contact] Brevo email error:", await res.text());
    }
  } catch (e) {
    console.error("[contact] Email send failed:", e);
  }
}

function buildOwnerNotificationHTML(name: string, email: string, subject: string, message: string): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0F0A0A; padding: 20px; text-align: center;">
    <h1 style="color: #C5A55A; font-size: 20px; margin: 0;">📩 Nouveau message de contact</h1>
  </div>

  <div style="padding: 20px; background: #FAF6F0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px; font-weight: bold; width: 100px; color: #0F0A0A;">Nom</td><td style="padding: 8px; color: #333;">${name}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold; color: #0F0A0A;">Email</td><td style="padding: 8px;"><a href="mailto:${email}" style="color: #C5A55A;">${email}</a></td></tr>
      <tr><td style="padding: 8px; font-weight: bold; color: #0F0A0A;">Sujet</td><td style="padding: 8px; color: #333;">${subject}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold; color: #0F0A0A; vertical-align: top;">Message</td><td style="padding: 8px; color: #333; white-space: pre-wrap;">${message}</td></tr>
    </table>
  </div>

  <div style="padding: 15px; text-align: center; background: #0F0A0A;">
    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="background: #C5A55A; color: #0F0A0A; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Répondre</a>
  </div>
</div>`;
}

function buildVisitorConfirmationHTML(name: string): string {
  return `
<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; padding: 0;">
  <div style="background: #0F0A0A; padding: 30px; text-align: center;">
    <h1 style="color: #C5A55A; font-size: 28px; font-weight: 400; letter-spacing: 3px; margin: 0;">LE DIVINO</h1>
    <p style="color: #FAF6F0; font-size: 12px; letter-spacing: 2px; margin-top: 5px;">CUISINE TRADITIONNELLE FRANÇAISE</p>
  </div>

  <div style="padding: 30px;">
    <h2 style="color: #0F0A0A; font-size: 20px; font-weight: 400; margin-bottom: 20px;">Message bien reçu</h2>

    <p style="color: #333; line-height: 1.6;">Bonjour ${name},</p>
    <p style="color: #333; line-height: 1.6;">Nous avons bien reçu votre message et nous vous en remercions.</p>

    <div style="background: #0F0A0A; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #FAF6F0; line-height: 1.6; margin: 0;">Notre équipe vous répondra dans les plus brefs délais. Si votre demande est urgente, n'hésitez pas à nous contacter directement par téléphone.</p>
    </div>

    <p style="color: #333; line-height: 1.6;">Pour toute question complémentaire, contactez-nous au <strong>04 48 17 78 75</strong> ou répondez à cet email.</p>

    <p style="color: #333; line-height: 1.6; margin-top: 25px;">À très bientôt,<br><strong>L'équipe du Divino</strong></p>
  </div>

  <div style="background: #0F0A0A; padding: 20px; text-align: center;">
    <p style="color: #FAF6F0; font-size: 11px; margin: 0;">Le Divino — 5 place Jean Jaurès, 34300 Agde</p>
    <p style="color: #C5A55A; font-size: 11px; margin: 5px 0 0;">04 48 17 78 75 · contact@ledivino-agde.fr</p>
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

  const { name, email, subject, message } = body as Record<string, string>;

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, subject, message" },
      { status: 400 },
    );
  }

  try {
    // Send both emails in parallel
    await Promise.allSettled([
      // Email to owner
      sendBrevoEmail(
        OWNER_EMAIL,
        "Le Divino",
        `📩 Nouveau message : ${subject} — ${name}`,
        buildOwnerNotificationHTML(name, email, subject, message),
      ),
      // Confirmation email to visitor
      sendBrevoEmail(
        email,
        name,
        "Nous avons bien reçu votre message — Le Divino",
        buildVisitorConfirmationHTML(name),
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[contact] Failed:", errorMessage);
    return NextResponse.json(
      { error: "Failed to send message", details: errorMessage },
      { status: 500 },
    );
  }
}
