-- ============================================================
-- Migration 029 — Correction urgente sécurité RLS
-- Supabase Security Alert : tables sans Row Level Security
-- Tables concernées : blog_posts, faq_items, seasonal_content, testimonials
-- Date : 2026-04-01
-- ============================================================

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- (idempotent : sans effet si déjà activé)
-- ============================================================

ALTER TABLE public.blog_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials     ENABLE ROW LEVEL SECURITY;

-- Belt-and-suspenders : vérification des tables des migrations précédentes
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_slides    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wines            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drinks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poster_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_dishes      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- blog_posts — Table de contenu public (articles du blog)
-- Lecture publique / Écriture admin uniquement
-- ============================================================

DROP POLICY IF EXISTS "blog_posts_select_public"  ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_write_auth"      ON public.blog_posts;

CREATE POLICY "blog_posts_select_public"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "blog_posts_write_auth"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- faq_items — FAQ publique (doublon de la table faq)
-- Lecture publique / Écriture admin uniquement
-- ============================================================

DROP POLICY IF EXISTS "faq_items_select_public"   ON public.faq_items;
DROP POLICY IF EXISTS "faq_items_write_auth"       ON public.faq_items;

CREATE POLICY "faq_items_select_public"
  ON public.faq_items
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "faq_items_write_auth"
  ON public.faq_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- seasonal_content — Contenu saisonnier public
-- Lecture publique (actif uniquement) / Écriture admin uniquement
-- ============================================================

DROP POLICY IF EXISTS "seasonal_content_select_public" ON public.seasonal_content;
DROP POLICY IF EXISTS "seasonal_content_write_auth"     ON public.seasonal_content;

CREATE POLICY "seasonal_content_select_public"
  ON public.seasonal_content
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "seasonal_content_write_auth"
  ON public.seasonal_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- testimonials — Avis clients publics
-- Lecture publique (publiés uniquement) / Écriture admin uniquement
-- ============================================================

DROP POLICY IF EXISTS "testimonials_select_public" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_write_auth"     ON public.testimonials;

CREATE POLICY "testimonials_select_public"
  ON public.testimonials
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "testimonials_write_auth"
  ON public.testimonials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
