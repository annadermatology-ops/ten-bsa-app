// Keep in sync with supabase/migrations/ — these are embedded for the setup wizard.

export const MIGRATION_001 = `-- ============================================================
-- SJS/TEN BSA Assessment Tool — Initial Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Custom enums
-- ============================================================
CREATE TYPE user_role AS ENUM ('clinician', 'admin', 'pi');
CREATE TYPE study_site AS ENUM ('france', 'england');

-- 2. Clinicians table (extends auth.users)
-- ============================================================
CREATE TABLE clinicians (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'clinician',
  site        study_site NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  consent_given_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clinicians ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all clinicians (study tool)
CREATE POLICY "Clinicians are viewable by authenticated users"
  ON clinicians FOR SELECT
  TO authenticated
  USING (true);

-- Only admin/PI can insert clinicians
CREATE POLICY "Admins can insert clinicians"
  ON clinicians FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND role IN ('admin', 'pi') AND is_active = true
    )
  );

-- Only admin/PI can update clinicians
CREATE POLICY "Admins can update clinicians"
  ON clinicians FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND role IN ('admin', 'pi') AND is_active = true
    )
  );

-- No deletes — we use is_active flag
CREATE POLICY "No deletes on clinicians"
  ON clinicians FOR DELETE
  TO authenticated
  USING (false);

-- 3. Patients table
-- ============================================================
CREATE TABLE patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id    TEXT NOT NULL UNIQUE,
  initials    TEXT NOT NULL CHECK (char_length(initials) BETWEEN 2 AND 4),
  date_of_birth DATE NOT NULL,
  site        study_site NOT NULL,
  created_by  UUID NOT NULL REFERENCES clinicians(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all patients
CREATE POLICY "Patients are viewable by authenticated users"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

-- Active clinicians can create patients
CREATE POLICY "Active clinicians can create patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Only admin/PI can update patients
CREATE POLICY "Admins can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND role IN ('admin', 'pi') AND is_active = true
    )
  );

-- No deletes on patients
CREATE POLICY "No deletes on patients"
  ON patients FOR DELETE
  TO authenticated
  USING (false);

-- 4. Assessments table
-- ============================================================
CREATE TABLE assessments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES patients(id),
  clinician_id UUID NOT NULL REFERENCES clinicians(id),
  tbsa_percent DECIMAL(5,2) NOT NULL CHECK (tbsa_percent >= 0 AND tbsa_percent <= 100),
  dbsa_percent DECIMAL(5,2) NOT NULL CHECK (dbsa_percent >= 0 AND dbsa_percent <= 100),
  tbsa_regions JSONB NOT NULL DEFAULT '{}'::jsonb,
  dbsa_regions JSONB NOT NULL DEFAULT '{}'::jsonb,
  canvas_anterior_tbsa TEXT,   -- Storage path
  canvas_anterior_dbsa TEXT,   -- Storage path
  canvas_posterior_tbsa TEXT,  -- Storage path
  canvas_posterior_dbsa TEXT,  -- Storage path
  canvas_composite TEXT,       -- Storage path
  notes       TEXT,
  assessment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted  BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view non-deleted assessments
CREATE POLICY "Assessments are viewable by authenticated users"
  ON assessments FOR SELECT
  TO authenticated
  USING (is_deleted = false);

-- Active clinicians can insert assessments (only their own)
CREATE POLICY "Active clinicians can insert own assessments"
  ON assessments FOR INSERT
  TO authenticated
  WITH CHECK (
    clinician_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Only admin/PI can update assessments (soft-delete, edit notes)
CREATE POLICY "Admins can update assessments"
  ON assessments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND role IN ('admin', 'pi') AND is_active = true
    )
  );

-- No hard deletes on assessments
CREATE POLICY "No deletes on assessments"
  ON assessments FOR DELETE
  TO authenticated
  USING (false);

-- 5. Audit log table
-- ============================================================
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT NOT NULL,
  record_id   TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    JSONB,
  new_data    JSONB,
  performed_by UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admin/PI can view audit log
CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND role IN ('admin', 'pi') AND is_active = true
    )
  );

-- No direct inserts/updates/deletes — populated by trigger only
CREATE POLICY "No direct inserts on audit_log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No updates on audit_log"
  ON audit_log FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No deletes on audit_log"
  ON audit_log FOR DELETE
  TO authenticated
  USING (false);

-- 6. Audit trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS \\$\\$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.id::text, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.id::text, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, performed_by)
    VALUES (TG_TABLE_NAME, OLD.id::text, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
\\$\\$;

-- 7. Attach audit triggers
-- ============================================================
CREATE TRIGGER audit_clinicians
  AFTER INSERT OR UPDATE OR DELETE ON clinicians
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_assessments
  AFTER INSERT OR UPDATE OR DELETE ON assessments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- 8. Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS \\$\\$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
\\$\\$;

CREATE TRIGGER set_updated_at_clinicians
  BEFORE UPDATE ON clinicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_patients
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. Indexes
-- ============================================================
CREATE INDEX idx_patients_study_id ON patients(study_id);
CREATE INDEX idx_patients_site ON patients(site);
CREATE INDEX idx_assessments_patient_id ON assessments(patient_id);
CREATE INDEX idx_assessments_clinician_id ON assessments(clinician_id);
CREATE INDEX idx_assessments_date ON assessments(assessment_date DESC);
CREATE INDEX idx_assessments_not_deleted ON assessments(patient_id) WHERE is_deleted = false;
CREATE INDEX idx_audit_log_table ON audit_log(table_name, created_at DESC);

-- 10. Storage bucket for canvas images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('canvas-images', 'canvas-images', false);

-- Authenticated users can upload to canvas-images
CREATE POLICY "Authenticated users can upload canvas images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'canvas-images');

-- Authenticated users can view canvas images
CREATE POLICY "Authenticated users can view canvas images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'canvas-images');

-- No deletes on canvas images
CREATE POLICY "No deletes on canvas images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (false);`;

export const MIGRATION_002 = `-- ============================================================
-- SJS/TEN BSA Assessment Tool — Add albumin level and photos
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
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
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();`;

export const MIGRATION_003 = `-- ============================================================
-- SJS/TEN BSA Assessment Tool — Add notes translation support
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Add columns for original language tracking and AI translation
-- The existing \`notes\` column continues to hold the original text.
-- ============================================================
ALTER TABLE assessments
  ADD COLUMN notes_language TEXT CHECK (notes_language IS NULL OR notes_language IN ('en', 'fr')),
  ADD COLUMN notes_translation TEXT;

COMMENT ON COLUMN assessments.notes_language IS 'ISO 639-1 language code of the original notes text (en or fr)';
COMMENT ON COLUMN assessments.notes_translation IS 'AI-generated translation of notes into the other study language';`;

export const MIGRATION_004_METADATA = `-- ============================================================
-- SJS/TEN BSA Assessment Tool — Add EXIF metadata to photos
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

ALTER TABLE assessment_photos
  ADD COLUMN metadata JSONB;

COMMENT ON COLUMN assessment_photos.metadata IS 'EXIF metadata extracted from the original photo (camera model, dimensions, date taken, etc.)';`;

export const MIGRATION_004_SCORTEN = `-- Migration 004: Add SCORTEN score to assessments
--
-- SCORTEN is recorded on the FIRST assessment for each patient only.
-- It consists of 7 binary criteria (each 0 or 1), giving a score 0-7.
-- Two criteria are auto-computed (age >= 40, BSA >= 10%) and five are clinician-entered.

ALTER TABLE assessments
  ADD COLUMN scorten_score        INTEGER CHECK (scorten_score IS NULL OR (scorten_score >= 0 AND scorten_score <= 7)),
  ADD COLUMN scorten_age_gte40    BOOLEAN,
  ADD COLUMN scorten_hr_gte120    BOOLEAN,
  ADD COLUMN scorten_malignancy   BOOLEAN,
  ADD COLUMN scorten_bsa_gte10    BOOLEAN,
  ADD COLUMN scorten_urea_gt10    BOOLEAN,
  ADD COLUMN scorten_bicarb_lt20  BOOLEAN,
  ADD COLUMN scorten_glucose_gt14 BOOLEAN;

-- All columns are nullable so that existing and subsequent (non-first) assessments
-- can omit SCORTEN data.`;

export interface MigrationInfo {
  filename: string;
  descriptionKey: string;
  sql: string;
}

export const MIGRATIONS: MigrationInfo[] = [
  { filename: '001_initial_schema.sql', descriptionKey: 'desc1', sql: MIGRATION_001 },
  { filename: '002_albumin_and_photos.sql', descriptionKey: 'desc2', sql: MIGRATION_002 },
  { filename: '003_notes_translation.sql', descriptionKey: 'desc3', sql: MIGRATION_003 },
  { filename: '004_photo_metadata.sql', descriptionKey: 'desc4', sql: MIGRATION_004_METADATA },
  { filename: '004_scorten.sql', descriptionKey: 'desc5', sql: MIGRATION_004_SCORTEN },
];
