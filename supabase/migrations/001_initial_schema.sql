-- ============================================================
-- SJS/TEN BSA Assessment Tool — Initial Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
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
AS $$
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
$$;

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
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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
  USING (false);
