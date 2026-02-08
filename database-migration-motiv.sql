-- Migration: Add motiv_incheiere and allow 0 for scores (non-response)
-- Run this if you already have survey_responses table

-- Add motiv_incheiere column
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS motiv_incheiere TEXT;

-- Drop old CHECK constraints and add new ones allowing 0
ALTER TABLE survey_responses DROP CONSTRAINT IF EXISTS survey_responses_impediment_contabil_score_check;
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_impediment_contabil_score_check 
  CHECK (impediment_contabil_score BETWEEN 0 AND 5);

ALTER TABLE survey_responses DROP CONSTRAINT IF EXISTS survey_responses_justificare_obligativitate_score_check;
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_justificare_obligativitate_score_check 
  CHECK (justificare_obligativitate_score BETWEEN 0 AND 5);

ALTER TABLE survey_responses DROP CONSTRAINT IF EXISTS survey_responses_capabil_contabilitate_proprie_score_check;
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_capabil_contabilitate_proprie_score_check 
  CHECK (capabil_contabilitate_proprie_score BETWEEN 0 AND 5);

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_survey_responses_motiv ON survey_responses(motiv_incheiere);

-- Add telefon and administrator columns
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS telefon TEXT;
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS administrator TEXT;
