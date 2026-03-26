"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createFaq, updateFaq } from "@/lib/supabase/faqs";
import { logActivity } from "@/lib/supabase/activity-log";
import type { Faq, FaqFormData } from "@/lib/types/database";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: Faq | null;
  onSaved: () => Promise<void>;
};

export function FaqFormSheet({ open, onOpenChange, faq, onSaved }: Props) {
  const supabase = createClient();
  const isEdit = !!faq;

  // Form state
  const [questionFr, setQuestionFr] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [questionIt, setQuestionIt] = useState("");
  const [questionEs, setQuestionEs] = useState("");
  const [questionDe, setQuestionDe] = useState("");
  const [answerFr, setAnswerFr] = useState("");
  const [answerEn, setAnswerEn] = useState("");
  const [answerIt, setAnswerIt] = useState("");
  const [answerEs, setAnswerEs] = useState("");
  const [answerDe, setAnswerDe] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when faq changes
  useEffect(() => {
    if (faq) {
      setQuestionFr(faq.question_fr ?? "");
      setQuestionEn(faq.question_en ?? "");
      setQuestionIt(faq.question_it ?? "");
      setQuestionEs(faq.question_es ?? "");
      setQuestionDe(faq.question_de ?? "");
      setAnswerFr(faq.answer_fr ?? "");
      setAnswerEn(faq.answer_en ?? "");
      setAnswerIt(faq.answer_it ?? "");
      setAnswerEs(faq.answer_es ?? "");
      setAnswerDe(faq.answer_de ?? "");
      setSortOrder(faq.sort_order);
      setPublished(faq.published);
    } else {
      setQuestionFr("");
      setQuestionEn("");
      setQuestionIt("");
      setQuestionEs("");
      setQuestionDe("");
      setAnswerFr("");
      setAnswerEn("");
      setAnswerIt("");
      setAnswerEs("");
      setAnswerDe("");
      setSortOrder(0);
      setPublished(true);
    }
    setError(null);
  }, [faq, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!questionFr.trim() || !answerFr.trim()) {
      setError("La question (FR) et la r\u00e9ponse (FR) sont obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData: FaqFormData = {
        question_fr: questionFr.trim(),
        question_en: questionEn.trim() || null,
        question_it: questionIt.trim() || null,
        question_es: questionEs.trim() || null,
        question_de: questionDe.trim() || null,
        answer_fr: answerFr.trim(),
        answer_en: answerEn.trim() || null,
        answer_it: answerIt.trim() || null,
        answer_es: answerEs.trim() || null,
        answer_de: answerDe.trim() || null,
        sort_order: sortOrder,
        published,
      };

      let saved: Faq;
      if (isEdit) {
        saved = await updateFaq(supabase, faq.id, formData);
      } else {
        saved = await createFaq(supabase, formData);
      }

      await logActivity(supabase, {
        action: isEdit ? "UPDATE" : "CREATE",
        entityType: "faq",
        entityId: saved.id,
        entityName: questionFr.trim(),
      });

      await onSaved();
    } catch (err) {
      console.error("FAQ save error:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier la question" : "Ajouter une question"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations de la FAQ."
              : "Remplissez les informations de la nouvelle question."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-12rem)] px-4">
          <form id="faq-form" onSubmit={handleSubmit} className="space-y-6 pb-8 pt-4">
            {/* ── Sort order & Published ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Ordre d&apos;affichage</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label htmlFor="published">Publi\u00e9e</Label>
                <Switch id="published" checked={published} onCheckedChange={setPublished} />
              </div>
            </div>

            {/* ── Question fields ── */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Question</Label>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\uddeb\ud83c\uddf7 Fran\u00e7ais (obligatoire)</Label>
                <Input
                  value={questionFr}
                  onChange={(e) => setQuestionFr(e.target.value)}
                  placeholder="Question en fran\u00e7ais"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\uddec\ud83c\udde7 English</Label>
                <Input
                  value={questionEn}
                  onChange={(e) => setQuestionEn(e.target.value)}
                  placeholder="Question in English"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\uddee\ud83c\uddf9 Italiano</Label>
                <Input
                  value={questionIt}
                  onChange={(e) => setQuestionIt(e.target.value)}
                  placeholder="Domanda in italiano"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\uddea\ud83c\uddf8 Espa\u00f1ol</Label>
                <Input
                  value={questionEs}
                  onChange={(e) => setQuestionEs(e.target.value)}
                  placeholder="Pregunta en espa\u00f1ol"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\udde9\ud83c\uddea Deutsch</Label>
                <Input
                  value={questionDe}
                  onChange={(e) => setQuestionDe(e.target.value)}
                  placeholder="Frage auf Deutsch"
                />
              </div>
            </div>

            {/* ── Answer fields ── */}
            <div className="space-y-4">
              <Label className="text-base font-medium">R\u00e9ponse</Label>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\uddeb\ud83c\uddf7 Fran\u00e7ais (obligatoire)</Label>
                <Textarea
                  value={answerFr}
                  onChange={(e) => setAnswerFr(e.target.value)}
                  placeholder="R\u00e9ponse en fran\u00e7ais"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\uddec\ud83c\udde7 English</Label>
                <Textarea
                  value={answerEn}
                  onChange={(e) => setAnswerEn(e.target.value)}
                  placeholder="Answer in English"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\uddee\ud83c\uddf9 Italiano</Label>
                <Textarea
                  value={answerIt}
                  onChange={(e) => setAnswerIt(e.target.value)}
                  placeholder="Risposta in italiano"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\uddea\ud83c\uddf8 Espa\u00f1ol</Label>
                <Textarea
                  value={answerEs}
                  onChange={(e) => setAnswerEs(e.target.value)}
                  placeholder="Respuesta en espa\u00f1ol"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">\ud83c\udde9\ud83c\uddea Deutsch</Label>
                <Textarea
                  value={answerDe}
                  onChange={(e) => setAnswerDe(e.target.value)}
                  placeholder="Antwort auf Deutsch"
                  rows={3}
                />
              </div>
            </div>

            {/* ── Error ── */}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </ScrollArea>

        {/* ── Submit ── */}
        <div className="border-t px-4 pt-4">
          <Button type="submit" form="faq-form" disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : isEdit ? "Mettre \u00e0 jour" : "Cr\u00e9er la question"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
