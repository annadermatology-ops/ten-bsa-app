-- Migration 004: Add SCORTEN score to assessments
--
-- SCORTEN is recorded on the FIRST assessment for each patient only.
-- It consists of 7 binary criteria (each 0 or 1), giving a score 0–7.
-- Two criteria are auto-computed (age ≥40, BSA ≥10%) and five are clinician-entered.
--
-- Fields:
--   scorten_score         INTEGER (0–7) — computed total
--   scorten_age_gte40     BOOLEAN — age ≥ 40 years (auto-computed from patient DOB)
--   scorten_hr_gte120     BOOLEAN — heart rate ≥ 120 bpm
--   scorten_malignancy    BOOLEAN — cancer or haematologic malignancy
--   scorten_bsa_gte10     BOOLEAN — BSA involved ≥ 10% (auto-computed from TBSA)
--   scorten_urea_gt10     BOOLEAN — serum urea > 10 mmol/L (or BUN > 28 mg/dL)
--   scorten_bicarb_lt20   BOOLEAN — serum bicarbonate < 20 mmol/L (mEq/L)
--   scorten_glucose_gt14  BOOLEAN — serum glucose > 14 mmol/L (or > 252 mg/dL)

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
-- can omit SCORTEN data.
