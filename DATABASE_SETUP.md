# Database Setup Guide

## Step 1: Access Supabase Dashboard

1. Go to [https://kdwebmvgpglmixbtkbqz.supabase.co](https://kdwebmvgpglmixbtkbqz.supabase.co)
2. Log in to your Supabase account

## Step 2: Open SQL Editor

1. In the left sidebar, click on **SQL Editor**
2. Click the **+ New Query** button

## Step 3: Create the Database Table

Copy and paste the contents of `database-schema.sql` or the following SQL script:

```sql
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
	motiv_incheiere TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_operator ON survey_responses(operator);
CREATE INDEX IF NOT EXISTS idx_survey_responses_cui ON survey_responses(cui);
CREATE INDEX IF NOT EXISTS idx_survey_responses_motiv ON survey_responses(motiv_incheiere);
```

**Dacă aveți deja tabelul creat**, rulați `database-migration-motiv.sql` pentru a adăuga coloana `motiv_incheiere`.

## Step 4: Run the Script

1. Click the **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. You should see a success message: "Success. No rows returned"

## Step 5: Verify the Table

1. In the left sidebar, click on **Table Editor**
2. You should see the `survey_responses` table listed
3. Click on it to view the structure

## Table Structure

| Column Name | Type | Constraints |
|------------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| cui | TEXT | NOT NULL |
| nume_firma | TEXT | NOT NULL |
| localitate | TEXT | NOT NULL |
| judet | TEXT | NOT NULL |
| cod_caen | TEXT | NOT NULL |
| este_administrator | BOOLEAN | NOT NULL |
| procent_cheltuieli_contabil | TEXT | NOT NULL |
| impediment_contabil_score | INTEGER | NOT NULL, 0-5 (0 = non-răspuns) |
| justificare_obligativitate_score | INTEGER | NOT NULL, 0-5 (0 = non-răspuns) |
| capabil_contabilitate_proprie_score | INTEGER | NOT NULL, 0-5 (0 = non-răspuns) |
| influenta_costuri_contabilitate | TEXT | NOT NULL |
| suma_lunara_contabilitate | TEXT | NOT NULL |
| operator | TEXT | NOT NULL |
| motiv_incheiere | TEXT | NULL - setat când sondajul se încheie devreme |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() |

**motiv_incheiere**: Când persoana nu este administrator, se salvează "Administrator absent la telefon" și răspunsurile sunt N/A / 0.

## Important Security Note

As per project requirements, **NO RLS (Row Level Security)** policies are applied. The table is fully accessible using the anonymous key. This is intentional for development purposes.

## Viewing Survey Data

To view all submitted surveys, go to the Table Editor in Supabase and select the `survey_responses` table. You can:

- Filter by operator (alexandra or nectarie)
- Sort by creation date
- Export data to CSV
- View individual responses

## Example Query

To view all surveys from a specific operator:

```sql
SELECT * FROM survey_responses 
WHERE operator = 'alexandra' 
ORDER BY created_at DESC;
```

To get statistics:

```sql
SELECT 
	operator,
	COUNT(*) as total_surveys,
	AVG(impediment_contabil_score) as avg_impediment_score
FROM survey_responses 
GROUP BY operator;
```
