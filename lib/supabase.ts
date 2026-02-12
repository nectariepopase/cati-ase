import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
	if (!_client) {
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL
		const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
		if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
		_client = createClient(url, key)
	}
	return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
	get(_, prop) {
		const client = getSupabase()
		const val = (client as unknown as Record<string | symbol, unknown>)[prop]
		return typeof val === 'function' ? (val as (...args: unknown[]) => unknown).bind(client) : val
	}
})

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

export type SurveyMotiveOption = {
	id: number
	category: string
	label: string
	is_custom: boolean
	created_at?: string
}

export type SurveyResponseV2 = {
	id?: number
	cui: string
	nume_firma: string
	localitate: string
	judet: string
	cod_caen: string
	este_administrator: boolean
	operator: string
	telefon?: string | null
	administrator?: string | null
	motiv_incheiere?: string | null
	q2_procent_cheltuieli?: string | null
	q3_relatie_contabil?: string | null
	q4_obligatie_intemeiata?: string | null
	q5_capabil_score?: number | null
	q5_capabil_motive?: string | null
	q6_motiv_automatizat?: string | null
	q7_suma_lunara?: string | null
	q8_de_ce_contabil?: string | null
	q9_renunta_contabil?: string | null
	q10_varsta?: string | null
	q11_nivel_studii?: string | null
	created_at?: string
}
