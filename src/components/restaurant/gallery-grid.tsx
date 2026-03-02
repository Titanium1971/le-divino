export function GalleryGrid() {
  // TODO: Fetch images from Supabase storage
  const placeholders = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {placeholders.map((i) => (
        <div
          key={i}
          className="aspect-square rounded-lg bg-muted"
          aria-label={`Photo ${i + 1}`}
        />
      ))}
    </div>
  );
}
