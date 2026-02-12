-- Survey V2: new questions, new table. Old survey_responses unchanged (no RLS).
-- Statistici vechi: read from survey_responses. Statistici noi: read from survey_responses_v2.

-- Motive options for DA/NU questions (Q4 întemeiată obligația, Q9 renunța la contabil).
-- Same pattern as mobile_research_options: predefined + operator can add permanent custom.
CREATE TABLE IF NOT EXISTS survey_motive_options (
	id BIGSERIAL PRIMARY KEY,
	category TEXT NOT NULL CHECK (category IN ('obligatie_intemeiata', 'renunta_contabil')),
	label TEXT NOT NULL,
	is_custom BOOLEAN NOT NULL DEFAULT false,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_survey_motive_options_category_label
	ON survey_motive_options(category, label);
CREATE INDEX IF NOT EXISTS idx_survey_motive_options_category ON survey_motive_options(category);

-- Main table: one row per completed/abandoned survey (v2).
CREATE TABLE IF NOT EXISTS survey_responses_v2 (
	id BIGSERIAL PRIMARY KEY,
	cui TEXT NOT NULL,
	nume_firma TEXT NOT NULL,
	localitate TEXT NOT NULL,
	judet TEXT NOT NULL,
	cod_caen TEXT NOT NULL,
	este_administrator BOOLEAN NOT NULL,
	operator TEXT NOT NULL,
	telefon TEXT,
	administrator TEXT,
	motiv_incheiere TEXT,

	-- Q2: procent cheltuieli (0-10%, 11-30%, etc. or Nu știu/Nu răspund)
	q2_procent_cheltuieli TEXT,

	-- Q3: relație contabil (colaborativă, adversitate, obligație legală, ajutor, consultanță business or free text)
	q3_relatie_contabil TEXT,

	-- Q4: întemeiată obligația legală? da / nu / nu_stiu. Motives in survey_response_v2_motives (category obligatie_intemeiata)
	q4_obligatie_intemeiata TEXT,

	-- Q5: scară 1-5 (0 = Nu știu/Nu răspund) + optional motive text
	q5_capabil_score INTEGER CHECK (q5_capabil_score IS NULL OR (q5_capabil_score >= 0 AND q5_capabil_score <= 5)),
	q5_capabil_motive TEXT,

	-- Q6: principal motiv dacă ar fi automatizat (option label or Altul)
	q6_motiv_automatizat TEXT,

	-- Q7: sumă medie lunară
	q7_suma_lunara TEXT,

	-- Q8: de ce folosiți contabil (single: Obligație legală / Lipsă de timp / etc.)
	q8_de_ce_contabil TEXT,

	-- Q9: ANAF pre-completa, renunța la contabil? da / nu / nu_stiu. Motives in survey_response_v2_motives (category renunta_contabil)
	q9_renunta_contabil TEXT,

	-- Q10, Q11
	q10_varsta TEXT,
	q11_nivel_studii TEXT,

	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_v2_operator ON survey_responses_v2(operator);
CREATE INDEX IF NOT EXISTS idx_survey_responses_v2_cui ON survey_responses_v2(cui);
CREATE INDEX IF NOT EXISTS idx_survey_responses_v2_motiv ON survey_responses_v2(motiv_incheiere);

-- Junction: which motive option(s) were selected for a response (Q4 and Q9).
CREATE TABLE IF NOT EXISTS survey_response_v2_motives (
	id BIGSERIAL PRIMARY KEY,
	response_id BIGINT NOT NULL REFERENCES survey_responses_v2(id) ON DELETE CASCADE,
	option_id BIGINT NOT NULL REFERENCES survey_motive_options(id) ON DELETE CASCADE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_survey_response_v2_motives_response ON survey_response_v2_motives(response_id);

-- Seed motive options for Q4 (întemeiată obligația) – generic; operator can add more
INSERT INTO survey_motive_options (category, label, is_custom) VALUES
	('obligatie_intemeiata', 'Protecția investitorilor / transparență', false),
	('obligatie_intemeiata', 'Calitate profesională', false),
	('obligatie_intemeiata', 'Evitarea fraudei', false),
	('obligatie_intemeiata', 'Altele', false)
ON CONFLICT (category, label) DO NOTHING;

-- Seed motive options for Q9 (renunța la contabil)
INSERT INTO survey_motive_options (category, label, is_custom) VALUES
	('renunta_contabil', 'Aveam încredere în declarațiile pre-completate', false),
	('renunta_contabil', 'Reducere costuri', false),
	('renunta_contabil', 'Simplitate', false),
	('renunta_contabil', 'Altele', false)
ON CONFLICT (category, label) DO NOTHING;
