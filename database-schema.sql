-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
	id BIGSERIAL PRIMARY KEY,
	cui TEXT NOT NULL,
	nume_firma TEXT NOT NULL,
	localitate TEXT NOT NULL,
	judet TEXT NOT NULL,
	cod_caen TEXT NOT NULL,
	este_administrator BOOLEAN NOT NULL,
	procent_cheltuieli_contabil TEXT NOT NULL,
	impediment_contabil_score INTEGER NOT NULL CHECK (impediment_contabil_score BETWEEN 0 AND 5),
	justificare_obligativitate_score INTEGER NOT NULL CHECK (justificare_obligativitate_score BETWEEN 0 AND 5),
	capabil_contabilitate_proprie_score INTEGER NOT NULL CHECK (capabil_contabilitate_proprie_score BETWEEN 0 AND 5),
	influenta_costuri_contabilitate TEXT NOT NULL,
	suma_lunara_contabilitate TEXT NOT NULL,
	operator TEXT NOT NULL,
	telefon TEXT,
	administrator TEXT,
	motiv_incheiere TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by operator
CREATE INDEX IF NOT EXISTS idx_survey_responses_operator ON survey_responses(operator);

-- Create index for CUI lookups
CREATE INDEX IF NOT EXISTS idx_survey_responses_cui ON survey_responses(cui);

-- Create index for filtering by termination reason
CREATE INDEX IF NOT EXISTS idx_survey_responses_motiv ON survey_responses(motiv_incheiere);

-- Note: motiv_incheiere is set when survey ends early (e.g. "Administrator absent la telefon")
-- Score 0 = no response (non-răspuns)
-- Note: NO RLS policies are applied as per requirements
