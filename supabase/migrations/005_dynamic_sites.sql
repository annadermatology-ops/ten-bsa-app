-- ============================================================
-- SJS/TEN BSA Assessment Tool — Dynamic Study Sites
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================
-- Replaces the hardcoded study_site ENUM ('france', 'england')
-- with a flexible study_sites table. Supports 5 languages.
-- ============================================================

BEGIN;

-- 1. Create study_sites table
-- ============================================================
CREATE TABLE study_sites (
  key             TEXT PRIMARY KEY CHECK (key ~ '^[a-z][a-z0-9\-]*$'),
  display_names   JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_language TEXT NOT NULL DEFAULT 'en'
    CHECK (default_language IN ('en', 'fr', 'de', 'es', 'it')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE study_sites IS 'Study sites (hospitals/centres). Display names are JSONB keyed by locale.';
COMMENT ON COLUMN study_sites.display_names IS 'e.g. {"en": "Lyon, France", "fr": "Lyon, France", "de": "Lyon, Frankreich"}';

ALTER TABLE study_sites ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active sites
CREATE POLICY "Sites are viewable by authenticated users"
  ON study_sites FOR SELECT
  TO authenticated
  USING (true);

-- Only admin/PI can insert sites
CREATE POLICY "Admins can insert sites"
  ON study_sites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND role IN ('admin', 'pi') AND is_active = true
    )
  );

-- Only admin/PI can update sites
CREATE POLICY "Admins can update sites"
  ON study_sites FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinicians
      WHERE id = auth.uid() AND role IN ('admin', 'pi') AND is_active = true
    )
  );

-- No deletes — use is_active flag
CREATE POLICY "No deletes on study_sites"
  ON study_sites FOR DELETE
  TO authenticated
  USING (false);

-- 2. Seed with existing sites
-- ============================================================
INSERT INTO study_sites (key, display_names, default_language, sort_order) VALUES
  ('france', '{"en": "Lyon, France", "fr": "Lyon, France", "de": "Lyon, Frankreich", "es": "Lyon, Francia", "it": "Lione, Francia"}'::jsonb, 'fr', 1),
  ('england', '{"en": "London, England", "fr": "Londres, Angleterre", "de": "London, England", "es": "Londres, Inglaterra", "it": "Londra, Inghilterra"}'::jsonb, 'en', 2);

-- 3. Convert clinicians.site from ENUM to TEXT
-- ============================================================
ALTER TABLE clinicians
  ALTER COLUMN site TYPE TEXT USING site::TEXT;

-- 4. Convert patients.site from ENUM to TEXT
-- ============================================================
ALTER TABLE patients
  ALTER COLUMN site TYPE TEXT USING site::TEXT;

-- 5. Drop the old ENUM type
-- ============================================================
DROP TYPE study_site;

-- 6. Add foreign key constraints
-- ============================================================
ALTER TABLE clinicians
  ADD CONSTRAINT fk_clinicians_site FOREIGN KEY (site) REFERENCES study_sites(key);

ALTER TABLE patients
  ADD CONSTRAINT fk_patients_site FOREIGN KEY (site) REFERENCES study_sites(key);

-- 7. Widen notes_language CHECK to support all 5 languages
-- ============================================================
ALTER TABLE assessments
  DROP CONSTRAINT IF EXISTS assessments_notes_language_check;

ALTER TABLE assessments
  ADD CONSTRAINT assessments_notes_language_check
  CHECK (notes_language IS NULL OR notes_language IN ('en', 'fr', 'de', 'es', 'it'));

-- 8. Updated_at trigger for study_sites
-- ============================================================
CREATE TRIGGER set_updated_at_study_sites
  BEFORE UPDATE ON study_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. Audit trigger for study_sites (uses key instead of id)
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_study_sites_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.key, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.key, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, performed_by)
    VALUES (TG_TABLE_NAME, OLD.key, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_study_sites
  AFTER INSERT OR UPDATE OR DELETE ON study_sites
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_study_sites_func();

-- 10. Index
-- ============================================================
CREATE INDEX idx_study_sites_sort ON study_sites(sort_order, key);

COMMIT;
