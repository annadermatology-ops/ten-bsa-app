-- ============================================================
-- SJS/TEN BSA Assessment Tool — Add notes translation support
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Add columns for original language tracking and AI translation
-- The existing `notes` column continues to hold the original text.
-- ============================================================
ALTER TABLE assessments
  ADD COLUMN notes_language TEXT CHECK (notes_language IS NULL OR notes_language IN ('en', 'fr')),
  ADD COLUMN notes_translation TEXT;

COMMENT ON COLUMN assessments.notes_language IS 'ISO 639-1 language code of the original notes text (en or fr)';
COMMENT ON COLUMN assessments.notes_translation IS 'AI-generated translation of notes into the other study language';
