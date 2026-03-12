"use client";

import { useState } from "react";
import type { ActivityLog, ActivityAction, ActivityEntityType } from "@/lib/supabase/activity-log";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTION_STYLES: Record<ActivityAction, { label: string; className: string }> = {
  CREATE: { label: "Création", className: "bg-green-100 text-green-700 border-green-200" },
  UPDATE: { label: "Modification", className: "bg-orange-100 text-orange-700 border-orange-200" },
  DELETE: { label: "Suppression", className: "bg-red-100 text-red-700 border-red-200" },
};

const ENTITY_LABELS: Record<string, string> = {
  dish: "Plat",
  menu: "Menu",
  wine: "Vin",
  drink: "Boisson",
  reservation: "Réservation",
  event: "Événement",
  gallery: "Galerie",
  settings: "Paramètres",
  conges: "Congés",
};

const PAGE_SIZE = 20;

type Props = {
  logs: ActivityLog[];
  users: string[];
  entityTypes: string[];
};

export function ActivityClient({ logs, users, entityTypes }: Props) {
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [page, setPage] = useState(0);

  const filtered = logs.filter((log) => {
    if (filterUser !== "all" && log.user_email !== filterUser) return false;
    if (filterEntity !== "all" && log.entity_type !== filterEntity) return false;
    if (filterAction !== "all" && log.action !== filterAction) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-light tracking-wide">Journal d&apos;activité</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {filtered.length} action{filtered.length !== 1 ? "s" : ""} enregistrée{filtered.length !== 1 ? "s" : ""}
      </p>

      <Separator className="my-6" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 pb-6">
        <Select value={filterAction} onValueChange={(v) => { setFilterAction(v); setPage(0); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les actions</SelectItem>
            <SelectItem value="CREATE">Création</SelectItem>
            <SelectItem value="UPDATE">Modification</SelectItem>
            <SelectItem value="DELETE">Suppression</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterEntity} onValueChange={(v) => { setFilterEntity(v); setPage(0); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {entityTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {ENTITY_LABELS[t] || t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {users.length > 1 && (
          <Select value={filterUser} onValueChange={(v) => { setFilterUser(v); setPage(0); }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Utilisateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              {users.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Logs list */}
      {paginated.length === 0 ? (
        <p className="py-12 text-center text-sm italic text-muted-foreground">
          Aucune activité enregistrée.
        </p>
      ) : (
        <div className="space-y-2">
          {paginated.map((log) => {
            const actionStyle = ACTION_STYLES[log.action as ActivityAction] ?? ACTION_STYLES.UPDATE;
            const entityLabel = ENTITY_LABELS[log.entity_type as ActivityEntityType] || log.entity_type;

            return (
              <div
                key={log.id}
                className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4"
              >
                {/* Date */}
                <span className="shrink-0 text-xs text-muted-foreground sm:w-36">
                  {formatDate(log.created_at)}
                </span>

                {/* Action badge */}
                <Badge variant="outline" className={`shrink-0 text-[10px] ${actionStyle.className}`}>
                  {actionStyle.label}
                </Badge>

                {/* Entity type */}
                <span className="shrink-0 text-xs font-medium text-muted-foreground sm:w-24">
                  {entityLabel}
                </span>

                {/* Entity name */}
                <span className="min-w-0 flex-1 truncate text-sm">
                  {log.entity_name || "—"}
                </span>

                {/* User */}
                <span className="shrink-0 text-xs text-muted-foreground">
                  {log.user_email || "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
