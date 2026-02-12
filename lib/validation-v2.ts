import { z } from 'zod'

export const surveySchemaV2 = z.object({
	cui: z.string().min(1, 'CUI este obligatoriu'),
	nume_firma: z.string().min(1, 'Nume firmă este obligatoriu'),
	localitate: z.string().min(1, 'Localitate este obligatorie'),
	judet: z.string().min(1, 'Județ este obligatoriu'),
	cod_caen: z.string().min(1, 'Cod CAEN este obligatoriu'),
	este_administrator: z.boolean(),

	q2_procent_cheltuieli: z.string().min(1, 'Vă rugăm să selectați un răspuns'),
	q3_relatie_contabil: z.string().min(1, 'Vă rugăm să selectați un răspuns'),
	q4_obligatie_intemeiata: z.enum(['da', 'nu', 'nu_stiu'], { message: 'Vă rugăm să selectați un răspuns' }),
	q4_motive_option_ids: z.array(z.number()).optional(),

	q5_capabil_score: z.number().min(-1).max(5).refine((v) => v >= 0, { message: 'Vă rugăm să selectați un răspuns' }),
	q5_capabil_motive: z.string().optional(),

	q6_motiv_automatizat: z.string().min(1, 'Vă rugăm să selectați un răspuns'),
	q7_suma_lunara: z.string().min(1, 'Suma lunară este obligatorie'),
	q8_de_ce_contabil: z.string().min(1, 'Vă rugăm să selectați un răspuns'),
	q9_renunta_contabil: z.enum(['da', 'nu', 'nu_stiu'], { message: 'Vă rugăm să selectați un răspuns' }),
	q9_motive_option_ids: z.array(z.number()).optional(),

	q10_varsta: z.string().min(1, 'Vă rugăm să completați vârsta'),
	q11_nivel_studii: z.string().min(1, 'Vă rugăm să selectați nivelul de studii')
})

export type SurveyFormDataV2 = z.infer<typeof surveySchemaV2>
