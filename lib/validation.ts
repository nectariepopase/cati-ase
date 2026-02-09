import { z } from 'zod'

export const surveySchema = z.object({
	cui: z.string().min(1, 'CUI este obligatoriu'),
	nume_firma: z.string().min(1, 'Nume firmă este obligatoriu'),
	localitate: z.string().min(1, 'Localitate este obligatorie'),
	judet: z.string().min(1, 'Județ este obligatoriu'),
	cod_caen: z.string().min(1, 'Cod CAEN este obligatoriu'),
	este_administrator: z.boolean(),
	procent_cheltuieli_contabil: z.string().min(1, 'Vă rugăm să selectați un răspuns'),
	impediment_contabil_score: z.number().min(0, 'Vă rugăm să selectați un răspuns').max(5),
	justificare_obligativitate_score: z.number().min(0, 'Vă rugăm să selectați un răspuns').max(5),
	capabil_contabilitate_proprie_score: z.number().min(0, 'Vă rugăm să selectați un răspuns').max(5),
	influenta_costuri_contabilitate: z.string().min(1, 'Vă rugăm să selectați un răspuns'),
	suma_lunara_contabilitate: z.string().min(1, 'Suma lunară este obligatorie')
})

export type SurveyFormData = z.infer<typeof surveySchema>
