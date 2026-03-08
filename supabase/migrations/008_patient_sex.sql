-- Add sex column to patients
ALTER TABLE patients
  ADD COLUMN sex TEXT CHECK (sex IS NULL OR sex IN ('M', 'F'));

COMMENT ON COLUMN patients.sex IS 'Patient sex: M (male) or F (female)';
