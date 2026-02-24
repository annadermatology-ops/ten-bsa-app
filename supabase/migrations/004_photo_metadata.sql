-- ============================================================
-- SJS/TEN BSA Assessment Tool — Add EXIF metadata to photos
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

ALTER TABLE assessment_photos
  ADD COLUMN metadata JSONB;

COMMENT ON COLUMN assessment_photos.metadata IS 'EXIF metadata extracted from the original photo (camera model, dimensions, date taken, etc.)';
