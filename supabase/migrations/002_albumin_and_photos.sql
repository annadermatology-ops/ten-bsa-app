-- ============================================================
-- SJS/TEN BSA Assessment Tool — Add albumin level and photos
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Add albumin_level column to assessments
-- ============================================================
ALTER TABLE assessments
  ADD COLUMN albumin_level DECIMAL(5,1) CHECK (albumin_level IS NULL OR (albumin_level >= 0 AND albumin_level <= 100));

COMMENT ON COLUMN assessments.albumin_level IS 'Serum albumin level in g/L at time of assessment';

-- 2. Create assessment_photos table
-- ============================================================
CREATE TABLE assessment_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  storage_path TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_size   INTEGER,           -- bytes
  mime_type   TEXT NOT NULL DEFAULT 'image/jpeg',
  caption     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID NOT NULL REFERENCES clinicians(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assessment_photos ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view photos
CREATE POLICY "Assessment photos are viewable by authenticated users"
  ON assessment_photos FOR SELECT
  TO authenticated
  USING (true);

-- Active clinicians can insert photos (only their own uploads)
CREATE POLICY "Active clinicians can insert own photos"
  ON assessment_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Only admin/PI can update photos
CREATE POLICY "Admins can update photos"
  ON assessment_photos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND role IN ('admin', 'pi') AND is_active = true
    )
  );

-- No hard deletes on photos
CREATE POLICY "No deletes on assessment_photos"
  ON assessment_photos FOR DELETE
  TO authenticated
  USING (false);

-- 3. Indexes
-- ============================================================
CREATE INDEX idx_assessment_photos_assessment_id ON assessment_photos(assessment_id);

-- 4. Audit trigger for assessment_photos
-- ============================================================
CREATE TRIGGER audit_assessment_photos
  AFTER INSERT OR UPDATE OR DELETE ON assessment_photos
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
