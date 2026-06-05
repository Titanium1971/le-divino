import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site en maintenance — Le Divino",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        backgroundColor: "#0a0a0a",
        color: "#f5f5f5",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
          fontWeight: 300,
          letterSpacing: "0.05em",
          margin: 0,
        }}
      >
        Site en maintenance
      </h1>
      <p
        style={{
          marginTop: "1rem",
          fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
          fontWeight: 200,
          color: "#a3a3a3",
          maxWidth: "32rem",
        }}
      >
        Nous revenons très bientôt. Merci de votre patience.
      </p>
    </main>
  );
}
