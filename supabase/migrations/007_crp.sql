-- Add CRP (C-reactive protein) level to assessments
ALTER TABLE assessments
  ADD COLUMN crp_level DECIMAL(6,2) CHECK (crp_level IS NULL OR (crp_level >= 0 AND crp_level <= 1000));

COMMENT ON COLUMN assessments.crp_level IS 'C-reactive protein level in mg/L at time of assessment';
