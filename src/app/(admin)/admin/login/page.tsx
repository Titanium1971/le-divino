"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-[#1a0a0a]">
      <div className="w-full max-w-sm space-y-8 px-6">
        {/* Logo / Title */}
        <div className="text-center">
          <h1 className="text-3xl font-extralight tracking-[0.3em] text-[#f5f0eb]">
            LE DIVINO
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-[#c5962c]" />
          <p className="mt-3 text-sm font-light tracking-wider text-[#f5f0eb]/50">
            Administration
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-light tracking-wider text-[#f5f0eb]/70">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="border-[#f5f0eb]/10 bg-[#f5f0eb]/5 text-[#f5f0eb] placeholder:text-[#f5f0eb]/30 focus-visible:ring-[#c5962c]/50"
              placeholder="admin@ledivino-agde.fr"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-light tracking-wider text-[#f5f0eb]/70"
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
              className="border-[#f5f0eb]/10 bg-[#f5f0eb]/5 text-[#f5f0eb] placeholder:text-[#f5f0eb]/30 focus-visible:ring-[#c5962c]/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6b1a1a] text-[#f5f0eb] hover:bg-[#8b2a2a] disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className="text-center text-xs text-[#f5f0eb]/30">
          Accès réservé au personnel autorisé
        </p>
      </div>
    </div>
  );
}
