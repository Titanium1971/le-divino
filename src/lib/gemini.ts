import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate a poster image using Gemini 2.5 Flash Image via REST API.
 * Returns base64-encoded image data.
 */
export async function generatePosterImage(
  prompt: string,
  aspectRatio: "9:16" | "16:9" = "9:16",
): Promise<string> {
  const model = "gemini-2.5-flash-image";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  // Try with IMAGE only modality (more reliable for poster generation)
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message || "Erreur API Gemini: " + response.status,
    );
  }

  const data = await response.json();

  if (data?.promptFeedback?.blockReason) {
    throw new Error("Prompt bloqué: " + data.promptFeedback.blockReason);
  }

  const candidate = data?.candidates?.[0];
  if (!candidate) {
    throw new Error("Aucun candidat — " + JSON.stringify(data).slice(0, 300));
  }

  if (candidate.finishReason && !["STOP", "IMAGE"].includes(candidate.finishReason)) {
    throw new Error("Génération arrêtée: " + candidate.finishReason);
  }

  const parts = candidate.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("Réponse vide — " + JSON.stringify(candidate).slice(0, 300));
  }

  const imagePart = parts.find(
    (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData,
  );
  if (!imagePart?.inlineData?.data) {
    const texts = parts.map((p: { text?: string }) => p.text || "").join(" ");
    throw new Error("Pas d\'image. Texte: " + texts.slice(0, 200));
  }

  return imagePart.inlineData.data;
}

/**
 * Use Gemini Flash to refine/suggest a poster prompt.
 */
export async function suggestPosterPrompt(
  templatePrompt: string,
  variables: Record<string, string>,
  eventType?: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Replace template variables
  let assembled = templatePrompt;
  for (const [key, value] of Object.entries(variables)) {
    assembled = assembled.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
    const conditionalRegex = new RegExp(
      `\\{\\{${key}\\s*\\?\\s*[^}]+\\}\\}`,
      "g",
    );
    assembled = assembled.replace(conditionalRegex, value ? value : "");
  }
  assembled = assembled.replace(/\{\{[^}]+\}\}/g, "");

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Tu es un expert en création d'affiches pour un restaurant méditerranéen premium "Le Divino" à Agde, France.

Voici un prompt de base pour générer une affiche :
"${assembled}"

${eventType ? "Type d'événement : " + eventType : ""}

Améliore ce prompt pour obtenir une affiche de qualité professionnelle. Le prompt doit :
- Être en anglais (pour Gemini Image Generation)
- Décrire précisément le style visuel, les couleurs, la composition
- Mentionner le restaurant Le Divino et l'ambiance méditerranéenne
- Être concis (max 200 mots)
- Prévoir un espace pour du texte lisible (titre, date, heure) avec une typographie élégante

Réponds UNIQUEMENT avec le prompt amélioré, sans explication ni formatage.`,
          },
        ],
      },
    ],
  });

  return result.response.text().trim();
}

/**
 * Assemble template prompt with variables (simple replacement).
 */
export function assemblePrompt(
  templatePrompt: string,
  variables: Record<string, string>,
): string {
  let assembled = templatePrompt;

  for (const [key, value] of Object.entries(variables)) {
    assembled = assembled.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
    const conditionalRegex = new RegExp(
      `\\{\\{${key}\\s*\\?\\s*([^:]+):\\s*([^}]+)\\}\\}`,
      "g",
    );
    assembled = assembled.replace(conditionalRegex, value ? `$1`.replace(key, value) : "");
  }

  assembled = assembled.replace(/\{\{[^}]+\}\}/g, "").replace(/\s{2,}/g, " ").trim();

  return assembled;
}
