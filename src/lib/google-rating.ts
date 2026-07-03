/**
 * Server-side utility to fetch the restaurant's aggregate rating
 * from the Google Places API (New).
 *
 * Results are cached in-memory for 24 hours so the Places API is not
 * called on every page render.
 */

const CACHE_TTL_MS = 86400 * 1000; // 24 hours

interface RatingData {
  ratingValue: string;
  ratingCount: string;
}

const FALLBACK: RatingData = {
  ratingValue: "4.9",
  ratingCount: "76",
};

let cached: { data: RatingData; ts: number } | null = null;

export async function getGoogleRating(): Promise<RatingData> {
  // Return from cache if still fresh
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return FALLBACK;
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=fr`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount",
        },
        next: { revalidate: 86400 },
      },
    );

    if (!res.ok) {
      console.error("Google Places rating fetch error:", res.status);
      return FALLBACK;
    }

    const data = await res.json();

    const result: RatingData = {
      ratingValue: String(data.rating ?? FALLBACK.ratingValue),
      ratingCount: String(data.userRatingCount ?? FALLBACK.ratingCount),
    };

    cached = { data: result, ts: Date.now() };
    return result;
  } catch (err) {
    console.error("Google rating fetch error:", err);
    return FALLBACK;
  }
}
