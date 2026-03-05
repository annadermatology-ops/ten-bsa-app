-- ============================================================
-- SJS/TEN BSA Assessment Tool — Per-Assessment Site + Geolocation
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================
-- Adds per-assessment site tracking (patients can transfer between sites).
-- Adds lat/lng to study_sites for geolocation hints.
-- ============================================================

BEGIN;

-- 1. Add latitude/longitude to study_sites for geolocation matching
-- ============================================================
ALTER TABLE study_sites
  ADD COLUMN latitude DOUBLE PRECISION,
  ADD COLUMN longitude DOUBLE PRECISION;

COMMENT ON COLUMN study_sites.latitude IS 'GPS latitude for geolocation matching (e.g. 45.764 for Lyon)';
COMMENT ON COLUMN study_sites.longitude IS 'GPS longitude for geolocation matching (e.g. 4.8357 for Lyon)';

-- Set coordinates for existing sites
UPDATE study_sites SET latitude = 45.764, longitude = 4.8357 WHERE key = 'france';
UPDATE study_sites SET latitude = 51.5074, longitude = -0.1278 WHERE key = 'england';

-- 2. Add site column to assessments
-- ============================================================
ALTER TABLE assessments
  ADD COLUMN site TEXT REFERENCES study_sites(key);

COMMENT ON COLUMN assessments.site IS 'Site where this assessment was performed (may differ from patient.site if transferred)';

-- 3. Backfill existing assessments with the patient''s site
-- ============================================================
UPDATE assessments
  SET site = patients.site
  FROM patients
  WHERE assessments.patient_id = patients.id;

-- 4. Index for querying assessments by site
-- ============================================================
CREATE INDEX idx_assessments_site ON assessments(site);

COMMIT;
