import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SurveyResponse = {
	id?: number
	cui: string
	nume_firma: string
	localitate: string
	judet: string
	cod_caen: string
	este_administrator: boolean
	procent_cheltuieli_contabil: string
	impediment_contabil_score: number
	justificare_obligativitate_score: number
	capabil_contabilitate_proprie_score: number
	influenta_costuri_contabilitate: string
	suma_lunara_contabilitate: string
	operator: string
	telefon?: string | null
	administrator?: string | null
	motiv_incheiere?: string | null
	created_at?: string
}
