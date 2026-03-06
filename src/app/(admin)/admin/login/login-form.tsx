"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A0A0E]">
      <div className="w-full max-w-sm space-y-8 px-6">
        {/* Logo / Title */}
        <div className="text-center">
          <h1 className="text-3xl font-extralight tracking-[0.3em] text-[#FAF6F0]">
            LE DIVINO
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-[#C5A55A]" />
          <p className="mt-3 text-sm font-light tracking-wider text-[#FAF6F0]/50">
            Administration
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-card space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium tracking-wider text-[#FAF6F0]/60">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="border-[#C5A55A]/15 bg-[#1A0A0E]/50 text-[#FAF6F0] placeholder:text-[#FAF6F0]/25 focus-visible:ring-[#C5A55A]/50"
              placeholder="admin@ledivino-agde.fr"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-medium tracking-wider text-[#FAF6F0]/60"
            >
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border-[#C5A55A]/15 bg-[#1A0A0E]/50 text-[#FAF6F0] placeholder:text-[#FAF6F0]/25 focus-visible:ring-[#C5A55A]/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="admin-btn w-full bg-[#C5A55A] text-[#1A0A0E] font-semibold hover:bg-[#d4b368] disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className="text-center text-xs text-[#FAF6F0]/25">
          Accès réservé au personnel autorisé
        </p>
      </div>
    </div>
  );
}
