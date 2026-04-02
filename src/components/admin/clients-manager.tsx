"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatClient } from "@/lib/types/chat";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Reservation = {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  message: string | null;
  created_at: string;
};

type Props = {
  initialClients: ChatClient[];
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-gray-100 text-gray-500 border-gray-200",
  no_show: "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
  no_show: "No-show",
};

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ClientsManager({ initialClients }: Props) {
  const supabase = createClient();
  const [clients, setClients] = useState<ChatClient[]>(initialClients);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ChatClient | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || "").includes(q)
    );
  });

  const loadClientHistory = useCallback(
    async (client: ChatClient) => {
      setSelectedClient(client);
      setLoadingHistory(true);

      const { data } = await supabase
        .from("reservations")
        .select("id, date, time, guests, status, message, created_at")
        .eq("email", client.email)
        .order("date", { ascending: false });

      setReservations(data ?? []);
      setLoadingHistory(false);
    },
    [supabase],
  );

  const refreshClients = useCallback(async () => {
    const { data } = await supabase
      .from("chat_clients")
      .select("*")
      .order("last_visit_date", { ascending: false, nullsFirst: false });

    if (data) setClients(data);
  }, [supabase]);

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.visit_count > 1).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#0F0A0A]">
          Clients
        </h1>
        <p className="mt-1 text-sm text-[#0F0A0A]/60">
          {totalClients} client{totalClients > 1 ? "s" : ""} · {activeClients} récurrent{activeClients > 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Client list */}
        <div className="flex-1 space-y-4">
          <Input
            type="text"
            placeholder="Rechercher un client (nom, email, téléphone)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border-[#0F0A0A]/20 text-[#0F0A0A] placeholder:text-[#0F0A0A]/40"
          />

          <div className="space-y-1">
            {filtered.map((client) => (
              <button
                key={client.id}
                onClick={() => loadClientHistory(client)}
                className={`w-full text-left rounded-lg px-4 py-3 transition-colors ${
                  selectedClient?.id === client.id
                    ? "bg-[#6B1A2A]/10 border border-[#6B1A2A]/30"
                    : "bg-white hover:bg-[#0F0A0A]/5 border border-[#0F0A0A]/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0A0A]">
                      {client.name || "Sans nom"}
                    </p>
                    <p className="text-xs text-[#0F0A0A]/60">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-[#6B1A2A]">
                      {client.visit_count} visite{client.visit_count > 1 ? "s" : ""}
                    </p>
                    {client.last_visit_date && (
                      <p className="text-[10px] text-[#0F0A0A]/50">
                        Dernière : {formatDate(client.last_visit_date)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-[#0F0A0A]/40">
                Aucun client trouvé
              </p>
            )}
          </div>
        </div>

        {/* Client detail panel */}
        <div className="w-full lg:w-[420px]">
          {selectedClient ? (
            <div className="rounded-xl border border-[#0F0A0A]/15 bg-white p-5 space-y-5 shadow-sm">
              {/* Client info */}
              <div>
                <h2 className="text-lg font-semibold text-[#0F0A0A]">
                  {selectedClient.name || "Sans nom"}
                </h2>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F0A0A]/50">Email</span>
                    <span className="text-[#0F0A0A] font-medium">{selectedClient.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F0A0A]/50">Téléphone</span>
                    <span className="text-[#0F0A0A] font-medium">
                      {selectedClient.phone ? (
                        <a href={`tel:${selectedClient.phone}`} className="text-[#6B1A2A] hover:underline">
                          {selectedClient.phone}
                        </a>
                      ) : (
                        "Non renseigné"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F0A0A]/50">Visites</span>
                    <span className="text-[#6B1A2A] font-bold">{selectedClient.visit_count}</span>
                  </div>
                  {selectedClient.last_visit_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#0F0A0A]/50">Dernière visite</span>
                      <span className="text-[#0F0A0A] font-medium">{formatDate(selectedClient.last_visit_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F0A0A]/50">Langue</span>
                    <span className="text-[#0F0A0A] font-medium">{selectedClient.preferred_language.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F0A0A]/50">Client depuis</span>
                    <span className="text-[#0F0A0A] font-medium">{formatDate(selectedClient.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Allergies & Preferences */}
              {(selectedClient.allergies.length > 0 ||
                selectedClient.dietary_preferences.length > 0 ||
                selectedClient.taste_notes) && (
                <>
                  <Separator className="bg-[#0F0A0A]/10" />
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B1A2A]">
                      Préférences
                    </h3>
                    {selectedClient.allergies.length > 0 && (
                      <div>
                        <p className="text-xs text-[#0F0A0A]/50 mb-1">Allergies</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedClient.allergies.map((a) => (
                            <Badge key={a} variant="outline" className="text-red-600 border-red-300 bg-red-50 text-[10px]">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedClient.dietary_preferences.length > 0 && (
                      <div>
                        <p className="text-xs text-[#0F0A0A]/50 mb-1">Régime</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedClient.dietary_preferences.map((p) => (
                            <Badge key={p} variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 text-[10px]">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedClient.taste_notes && (
                      <div>
                        <p className="text-xs text-[#0F0A0A]/50 mb-1">Goûts</p>
                        <p className="text-sm text-[#0F0A0A]/80">{selectedClient.taste_notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Reservation history */}
              <Separator className="bg-[#0F0A0A]/10" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B1A2A] mb-3">
                  Historique des réservations
                </h3>

                {loadingHistory ? (
                  <p className="text-sm text-[#0F0A0A]/40">Chargement...</p>
                ) : reservations.length === 0 ? (
                  <p className="text-sm text-[#0F0A0A]/40">Aucune réservation</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {reservations.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-[#0F0A0A]/10 bg-[#F5EFE8] px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#0F0A0A]">
                            {formatDate(r.date)} · {r.time}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${STATUS_STYLE[r.status] || ""}`}
                          >
                            {STATUS_LABEL[r.status] || r.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-[#0F0A0A]/60">
                          {r.guests} convive{r.guests > 1 ? "s" : ""}
                          {r.message ? ` · ${r.message}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[#0F0A0A]/15 bg-white">
              <p className="text-sm text-[#0F0A0A]/40">
                Sélectionnez un client pour voir son profil
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
