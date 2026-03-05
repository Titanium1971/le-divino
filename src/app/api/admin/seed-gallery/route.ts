import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFile } from "fs/promises";
import { join } from "path";

const SEED_IMAGES = [
  { file: "salle-bord-eau.jpg", caption: "Salle au bord de l'eau", tag: "restaurant" },
  { file: "bar-divino.jpg", caption: "Le bar", tag: "ambiance" },
  { file: "interieur-salle-bar.jpg", caption: "Intérieur et bar", tag: "ambiance" },
  { file: "salle-bar-divino.jpg", caption: "Salle de restaurant", tag: "restaurant" },
  { file: "exterior-terrace.jpg", caption: "Terrasse extérieure", tag: "restaurant" },
];

export async function POST() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Delete existing seed gallery rows (ones with paths that aren't uuid-based)
    const { data: existing } = await supabase
      .from("gallery")
      .select("id, image_path");

    if (existing) {
      for (const row of existing) {
        // Seed rows have paths like "restaurant/xxx.jpg", uploaded ones have "uuid.ext"
        if (row.image_path.includes("/") || !row.image_path) {
          // Try to delete from storage (may not exist)
          await supabase.storage.from("gallery").remove([row.image_path]);
          await supabase.from("gallery").delete().eq("id", row.id);
        }
      }
    }

    // 2. Upload local images and create gallery rows
    const results = [];
    for (let i = 0; i < SEED_IMAGES.length; i++) {
      const { file, caption, tag } = SEED_IMAGES[i];
      const filePath = join(process.cwd(), "public", "images", file);

      const buffer = await readFile(filePath);

      // Create gallery row first
      const { data: item, error: insertError } = await supabase
        .from("gallery")
        .insert({
          image_path: "",
          caption: { fr: caption, en: "", it: "", es: "", de: "" },
          tag,
          sort_order: i,
          published: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Upload to storage
      const storagePath = `${item.id}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(storagePath, buffer, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      // Update image_path
      await supabase
        .from("gallery")
        .update({ image_path: storagePath })
        .eq("id", item.id);

      results.push({ id: item.id, path: storagePath, caption });
    }

    return NextResponse.json({ success: true, uploaded: results });
  } catch (err) {
    console.error("Seed gallery error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
