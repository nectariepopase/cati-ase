-- Mobile research (door-to-door exploratory): nevoi / dorinte / probleme contabilitate
-- NO RLS; same hardcoded users via app auth. Results by operator + total.

-- Options per category (predefined + custom "other")
CREATE TABLE IF NOT EXISTS mobile_research_options (
	id BIGSERIAL PRIMARY KEY,
	category TEXT NOT NULL CHECK (category IN ('nevoi', 'dorinte', 'probleme')),
	label TEXT NOT NULL,
	is_custom BOOLEAN NOT NULL DEFAULT false,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Each click = one vote (points). Aggregate by option and optionally by operator.
CREATE TABLE IF NOT EXISTS mobile_research_votes (
	id BIGSERIAL PRIMARY KEY,
	option_id BIGINT NOT NULL REFERENCES mobile_research_options(id) ON DELETE CASCADE,
	operator TEXT NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mobile_research_options_category ON mobile_research_options(category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mobile_options_category_label ON mobile_research_options(category, lower(trim(label)));
CREATE INDEX IF NOT EXISTS idx_mobile_research_votes_option ON mobile_research_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_mobile_research_votes_operator ON mobile_research_votes(operator);

-- Seed predefined options (contabilitate-related). Run once; re-run skips duplicates.
INSERT INTO mobile_research_options (category, label, is_custom) VALUES
	('nevoi', 'Consultanță fiscală', false),
	('nevoi', 'Software contabil accesibil', false),
	('nevoi', 'Formare/ghiduri contabilitate', false),
	('nevoi', 'Suport pentru declarații ANAF', false),
	('nevoi', 'Altele', false),
	('dorinte', 'Simplificare proceduri ANAF', false),
	('dorinte', 'Reducere costuri contabilitate', false),
	('dorinte', 'Contabilitate clară pentru începători', false),
	('dorinte', 'Altele', false),
	('probleme', 'Complexitate legislație', false),
	('probleme', 'Costuri mari contabilitate', false),
	('probleme', 'Timp pierdut cu birocrația', false),
	('probleme', 'Frică de sancțiuni/erori', false),
	('probleme', 'Altele', false)
ON CONFLICT (category, lower(trim(label))) DO NOTHING;

-- Note: "Altele" is a fixed option; custom options added via app get is_custom = true.
-- Same label in same category = same option (unique index). No RLS.
