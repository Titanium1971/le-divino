"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getFaqs, deleteFaq } from "@/lib/supabase/faqs";
import { logActivity } from "@/lib/supabase/activity-log";
import type { Faq } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FaqFormSheet } from "./faq-form-sheet";

type Props = {
  initialFaqs: Faq[];
};

export function FaqsManager({ initialFaqs }: Props) {
  const supabase = createClient();
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getFaqs(supabase);
    setFaqs(data);
  }, [supabase]);

  function handleAdd() {
    setEditingFaq(null);
    setSheetOpen(true);
  }

  function handleEdit(faq: Faq) {
    setEditingFaq(faq);
    setSheetOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFaq(supabase, deleteTarget.id);
      await logActivity(supabase, {
        action: "DELETE",
        entityType: "faq",
        entityId: deleteTarget.id,
        entityName: deleteTarget.question_fr,
      });
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide sm:text-2xl">Questions fr&eacute;quentes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {faqs.length} question{faqs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto">+ Ajouter une question</Button>
      </div>

      <Separator className="my-6" />

      {/* FAQ list */}
      <div className="space-y-2">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className={`rounded-lg border p-3 transition-colors ${
              !faq.published ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Sort order */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                {faq.sort_order}
              </div>

              {/* Question preview */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{faq.question_fr}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {faq.answer_fr}
                </p>
              </div>

              {/* Published badge */}
              <Badge variant={faq.published ? "default" : "outline"} className="shrink-0">
                {faq.published ? "Publi\u00e9e" : "Brouillon"}
              </Badge>
            </div>

            {/* Actions */}
            <div className="mt-2 flex flex-wrap gap-1 sm:mt-0 sm:justify-end">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(faq)}>
                Modifier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setDeleteTarget(faq)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
      </div>

      {faqs.length === 0 && (
        <p className="py-12 text-center text-sm italic text-muted-foreground">
          Aucune question trouv&eacute;e.
        </p>
      )}

      {/* Add/Edit Sheet */}
      <FaqFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        faq={editingFaq}
        onSaved={async () => {
          setSheetOpen(false);
          await refresh();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
            <AlertDialogDescription>
              &laquo;&nbsp;{deleteTarget?.question_fr}&nbsp;&raquo; sera supprim&eacute;e d&eacute;finitivement. Cette action est
              irr&eacute;versible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
