import OpenAI from "openai";

const SUPABASE_URL = "https://spncxhvqcytxdruevfrz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwbmN4aHZxY3l0eGRydWV2ZnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjMwNjIsImV4cCI6MjA4Nzk5OTA2Mn0.ucepZrqA-0394F7-wEW3oWmX0FL6gtgZiopjHuIs63Y";

const openai = new OpenAI();

// Fetch all drinks
const res = await fetch(`${SUPABASE_URL}/rest/v1/drinks?select=id,name,name_fr&order=sort_order`, {
  headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
});
const drinks = await res.json();
console.log(`${drinks.length} boissons à traduire\n`);

// Build the prompt with all drink names
const names = drinks.map((d) => d.name_fr || d.name);

const prompt = `Translate these French drink/beverage names to English, Italian, Spanish, and German.

Rules:
- Brand names stay IDENTICAL (Coca-Cola, Heineken, Red Bull, Perrier, San Pellegrino, Evian, etc.)
- Generic drink names get translated (Thé vert → Green tea, Chocolat chaud → Hot chocolate, etc.)
- Keep the same capitalization style as the original
- For drinks like "JUS DE FRUIT FRAÎCHEUR" keep the all-caps style in translations
- Return a JSON array with objects: { "fr": "original name", "en": "...", "it": "...", "es": "...", "de": "..." }

French drink names:
${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}`;

console.log("Traduction via OpenAI...");

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: prompt }],
  response_format: { type: "json_object" },
  temperature: 0.2,
});

const result = JSON.parse(completion.choices[0].message.content);
const translations = result.translations || result.drinks || result.items || Object.values(result)[0];

if (!Array.isArray(translations) || translations.length !== drinks.length) {
  console.error(`Erreur: attendu ${drinks.length} traductions, reçu ${translations?.length}`);
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}

// Update each drink in Supabase
console.log("\nMise à jour en base...\n");
let updated = 0;
let skipped = 0;

for (let i = 0; i < drinks.length; i++) {
  const drink = drinks[i];
  const t = translations[i];

  const body = {
    name_en: t.en || null,
    name_it: t.it || null,
    name_es: t.es || null,
    name_de: t.de || null,
  };

  const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/drinks?id=eq.${drink.id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });

  if (updateRes.ok) {
    const changed = t.en !== (drink.name_fr || drink.name);
    console.log(`✓ ${drink.name_fr || drink.name} → EN: ${t.en}${changed ? "" : " (identique)"}`);
    updated++;
  } else {
    console.log(`✗ ${drink.name} — ${updateRes.status}`);
    skipped++;
  }
}

console.log(`\n${updated} mises à jour, ${skipped} échecs`);
