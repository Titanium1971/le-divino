"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCategory, updateCategory } from "@/lib/supabase/dishes";
import type { Category, CategoryFormData } from "@/lib/types/database";
import { slugify } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSaved: () => Promise<void>;
};

export function CategoryFormDialog({ open, onOpenChange, category, onSaved }: Props) {
  const supabase = createClient();
  const isEdit = !!category;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description ?? "");
      setVisible(category.visible);
      setSlugManual(true);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setVisible(true);
      setSlugManual(false);
    }
    setError(null);
  }, [category, open]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setSlug(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug) {
      setError("Nom et slug sont obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData: CategoryFormData = { name, slug, description, visible };

      if (isEdit) {
        await updateCategory(supabase, category.id, formData);
      } else {
        await createCategory(supabase, formData);
      }

      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier la catégorie" : "Ajouter une catégorie"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifiez les informations de la catégorie."
              : "Créez une nouvelle catégorie pour organiser vos plats."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nom</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex : Entrées"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="Ex : entrees"
              required
            />
            <p className="text-xs text-muted-foreground">
              Identifiant URL, généré automatiquement depuis le nom.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-description">Description</Label>
            <Input
              id="cat-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brève description (optionnel)"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="cat-visible">Visible sur la carte</Label>
            <Switch id="cat-visible" checked={visible} onCheckedChange={setVisible} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Enregistrement..."
                : isEdit
                  ? "Mettre à jour"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
