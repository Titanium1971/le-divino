"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("╔══ DASHBOARD ERROR BOUNDARY ══╗");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Digest:", error.digest);
    console.error("╚══════════════════════════════╝");
  }, [error]);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-red-600">Erreur Dashboard</h2>
      <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-sm text-gray-800">
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      <button
        onClick={reset}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Réessayer
      </button>
    </div>
  );
}
