'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { surveySchemaV2, type SurveyFormDataV2 } from '@/lib/validation-v2'
import { type CompanyData } from '@/lib/anaf-api'
import { type SurveyMotiveOption } from '@/lib/supabase'
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const Q6_OPTIONS = [
	'Siguranța că e făcut corect (expertiză)',
	'Teama de amenzi/controale',
	'Reprezentarea în fața autorităților (să se certe altcineva cu ANAF)',
	'Nu vreau să urmăresc noutățile legislative',
	'Altul'
]

const Q8_OPTIONS = [
	'Obligație legală',
	'Lipsă de timp',
	'Lipsă de cunoștințe',
	'Siguranță în fața controlului',
	'Consultanță fiscală'
]

const VARSTA_OPTIONS = ['18-25', '26-35', '36-45', '46-55', '55+']
const STUDII_OPTIONS = ['Fără studii superioare', 'Studii superioare (licență)', 'Studii superioare (masterat)', 'Doctorat']

type SurveyFormV2Props = {
	company: CompanyData
	operator: string
	motiveOptions: SurveyMotiveOption[]
	onSubmit: (data: SurveyFormDataV2) => Promise<void>
	onSurveyEnded?: () => void
	onSurveyAbandoned?: (partialData: Partial<SurveyFormDataV2>) => void
	isSubmitting: boolean
}

export function SurveyFormV2({
	company,
	operator,
	motiveOptions,
	onSubmit,
	onSurveyEnded,
	onSurveyAbandoned,
	isSubmitting
}: SurveyFormV2Props) {
	const [q6Altul, setQ6Altul] = useState('')
	const [q4OtherText, setQ4OtherText] = useState('')
	const [q9OtherText, setQ9OtherText] = useState('')
	const [addingQ4, setAddingQ4] = useState(false)
	const [addingQ9, setAddingQ9] = useState(false)

	const obligatieOptions = motiveOptions.filter((o) => o.category === 'obligatie_intemeiata')
	const renuntaOptions = motiveOptions.filter((o) => o.category === 'renunta_contabil')

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { errors }
	} = useForm<SurveyFormDataV2>({
		resolver: zodResolver(surveySchemaV2),
		defaultValues: {
			cui: company.cui,
			nume_firma: company.nume,
			localitate: company.localitate,
			judet: company.judet,
			cod_caen: company.codCaen,
			este_administrator: false,
			q2_procent_cheltuieli: '',
			q3_relatie_contabil: '',
			q4_obligatie_intemeiata: undefined,
			q4_motive_option_ids: [],
			q5_capabil_score: -1,
			q5_capabil_motive: '',
			q6_motiv_automatizat: '',
			q7_suma_lunara: '',
			q8_de_ce_contabil: '',
			q9_renunta_contabil: undefined,
			q9_motive_option_ids: [],
			q10_varsta: '',
			q11_nivel_studii: ''
		}
	})

	const esteAdministrator = watch('este_administrator')
	const q4Val = watch('q4_obligatie_intemeiata')
	const q9Val = watch('q9_renunta_contabil')
	const q4MotiveIds = watch('q4_motive_option_ids') ?? []
	const q9MotiveIds = watch('q9_motive_option_ids') ?? []

	const toggleMotive = useCallback(
		(category: 'obligatie_intemeiata' | 'renunta_contabil', optionId: number) => {
			if (category === 'obligatie_intemeiata') {
				const next = q4MotiveIds.includes(optionId)
					? q4MotiveIds.filter((id) => id !== optionId)
					: [...q4MotiveIds, optionId]
				setValue('q4_motive_option_ids', next, { shouldValidate: true })
			} else {
				const next = q9MotiveIds.includes(optionId)
					? q9MotiveIds.filter((id) => id !== optionId)
					: [...q9MotiveIds, optionId]
				setValue('q9_motive_option_ids', next, { shouldValidate: true })
			}
		},
		[q4MotiveIds, q9MotiveIds, setValue]
	)

	const addOtherMotive = useCallback(
		async (category: 'obligatie_intemeiata' | 'renunta_contabil') => {
			const label = category === 'obligatie_intemeiata' ? q4OtherText.trim() : q9OtherText.trim()
			if (!label) return
			if (category === 'obligatie_intemeiata') setAddingQ4(true)
			else setAddingQ9(true)
			try {
				const { data: inserted, error: insertError } = await supabase
					.from('survey_motive_options')
					.insert([{ category, label, is_custom: true }])
					.select('id')
					.single()

				let optionId: number
				if (insertError) {
					if (insertError.code === '23505') {
						const { data: all } = await supabase
							.from('survey_motive_options')
							.select('id, label')
							.eq('category', category)
						const match = (all || []).find(
							(o: { label: string }) => o.label.toLowerCase().trim() === label.toLowerCase().trim()
						)
						optionId = match?.id
						if (optionId == null) throw new Error('Duplicate option but could not find id')
					} else throw insertError
				} else {
					optionId = inserted!.id
				}
				toggleMotive(category, optionId)
				if (category === 'obligatie_intemeiata') setQ4OtherText('')
				else setQ9OtherText('')
			} catch (e) {
				console.error(e)
				alert('Eroare la adăugarea opțiunii.')
			} finally {
				if (category === 'obligatie_intemeiata') setAddingQ4(false)
				else setAddingQ9(false)
			}
		},
		[q4OtherText, q9OtherText, toggleMotive]
	)

	if (!esteAdministrator) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md">
				<div className="mb-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Date Firmă</h2>
					<div className="space-y-1 text-sm text-gray-600">
						<p><span className="font-medium">Nume:</span> {company.nume}</p>
						<p><span className="font-medium">CUI:</span> {company.cui}</p>
						<p><span className="font-medium">Localitate:</span> {company.localitate}</p>
						<p><span className="font-medium">Județ:</span> {company.judet}</p>
						<p><span className="font-medium">Cod CAEN:</span> {company.codCaen}</p>
						{company.telefon && <p><span className="font-medium">Telefon:</span> {company.telefon}</p>}
						{company.administrator && <p><span className="font-medium">Administrator:</span> {company.administrator}</p>}
					</div>
				</div>
				<div className="border-t pt-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Întrebarea 1</h3>
					<p className="text-gray-700 mb-4">Sunteți administratorul societății {company.nume}?</p>
					<div className="flex gap-4">
						<button
							type="button"
							onClick={() => setValue('este_administrator', true)}
							className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-lg"
						>
							DA
						</button>
						<button
							type="button"
							onClick={() => onSurveyEnded?.()}
							disabled={isSubmitting}
							className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							{isSubmitting ? 'Se salvează...' : 'NU (Încheie sondajul)'}
						</button>
					</div>
				</div>
			</div>
		)
	}

	const onFormSubmit = (data: SurveyFormDataV2) => {
		const out = { ...data }
		if (out.q6_motiv_automatizat === 'Altul' && q6Altul.trim()) {
			out.q6_motiv_automatizat = `Altul: ${q6Altul.trim()}`
		}
		return onSubmit(out)
	}

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="bg-white p-6 rounded-lg shadow-md space-y-8">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-2">Date Firmă</h2>
				<div className="space-y-1 text-sm text-gray-600">
					<p><span className="font-medium">Nume:</span> {company.nume}</p>
					<p><span className="font-medium">CUI:</span> {company.cui}</p>
					<p><span className="font-medium">Localitate:</span> {company.localitate}</p>
					<p><span className="font-medium">Județ:</span> {company.judet}</p>
					<p><span className="font-medium">Cod CAEN:</span> {company.codCaen}</p>
					{company.telefon && <p><span className="font-medium">Telefon:</span> {company.telefon}</p>}
					{company.administrator && <p><span className="font-medium">Administrator:</span> {company.administrator}</p>}
					<p><span className="font-medium">Operator:</span> {operator}</p>
				</div>
			</div>

			{/* Q2 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 2</h3>
				<p className="text-gray-700">
					Aproximativ, ce procent din cheltuielile lunare actuale ale firmei este reprezentat de onorariul contabilului?
				</p>
				<div className="flex flex-wrap gap-2">
					{['0-10%', '11-30%', '31-50%', '51-70%', '71-100%'].map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setValue('q2_procent_cheltuieli', opt, { shouldValidate: true })}
							className={`px-3 py-2 border rounded-md text-sm font-medium ${
								watch('q2_procent_cheltuieli') === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'
							}`}
						>
							{opt}
						</button>
					))}
					<button
						type="button"
						onClick={() => setValue('q2_procent_cheltuieli', 'Nu știu/Nu răspund', { shouldValidate: true })}
						className={`px-3 py-2 border rounded-md text-sm font-medium ${
							watch('q2_procent_cheltuieli') === 'Nu știu/Nu răspund' ? 'bg-gray-500 text-white' : 'border-gray-300 hover:bg-gray-50'
						}`}
					>
						Nu știu/Nu răspund
					</button>
				</div>
				{errors.q2_procent_cheltuieli && <p className="text-red-600 text-sm">{errors.q2_procent_cheltuieli.message}</p>}
			</div>

			{/* Q3 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 3</h3>
				<p className="text-gray-700">Cum ați aprecia relația dumneavoastră cu contabilul actual?</p>
				<div className="flex flex-wrap gap-2">
					{['Colaborativă', 'Adversitate', 'Obligație legală', 'Ajutor', 'Consultanță business'].map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setValue('q3_relatie_contabil', opt, { shouldValidate: true })}
							className={`px-3 py-2 border rounded-md text-sm font-medium ${
								watch('q3_relatie_contabil') === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'
							}`}
						>
							{opt}
						</button>
					))}
				</div>
				{errors.q3_relatie_contabil && <p className="text-red-600 text-sm">{errors.q3_relatie_contabil.message}</p>}
			</div>

			{/* Q4 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 4</h3>
				<p className="text-gray-700">Vi se pare întemeiată obligația legală de a colabora cu un contabil autorizat?</p>
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setValue('q4_obligatie_intemeiata', 'da', { shouldValidate: true })}
						className={`px-4 py-2 border rounded-md font-medium ${
							q4Val === 'da' ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 hover:bg-gray-50'
						}`}
					>
						DA
					</button>
					<button
						type="button"
						onClick={() => setValue('q4_obligatie_intemeiata', 'nu', { shouldValidate: true })}
						className={`px-4 py-2 border rounded-md font-medium ${
							q4Val === 'nu' ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 hover:bg-gray-50'
						}`}
					>
						NU
					</button>
					<button
						type="button"
						onClick={() => setValue('q4_obligatie_intemeiata', 'nu_stiu', { shouldValidate: true })}
						className={`px-4 py-2 border rounded-md font-medium ${
							q4Val === 'nu_stiu' ? 'bg-gray-500 text-white' : 'border-gray-300 hover:bg-gray-50'
						}`}
					>
						Nu știu/Nu răspund
					</button>
				</div>
				{(q4Val === 'da' || q4Val === 'nu') && (
					<div className="mt-4 pl-2 border-l-2 border-indigo-200">
						<p className="text-sm font-medium text-gray-700 mb-2">Motive (opțional):</p>
						<div className="flex flex-wrap gap-2 mb-2">
							{obligatieOptions.map((opt) => (
								<button
									key={opt.id}
									type="button"
									onClick={() => toggleMotive('obligatie_intemeiata', opt.id)}
									className={`px-3 py-1.5 rounded text-sm ${
										q4MotiveIds.includes(opt.id) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									{opt.label}
								</button>
							))}
						</div>
						<div className="flex gap-2 flex-wrap items-center">
							<input
								type="text"
								value={q4OtherText}
								onChange={(e) => setQ4OtherText(e.target.value)}
								placeholder="Altele (adaugă opțiune nouă)"
								className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
							<button
								type="button"
								onClick={() => addOtherMotive('obligatie_intemeiata')}
								disabled={!q4OtherText.trim() || addingQ4}
								className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
							>
								{addingQ4 ? '...' : 'Adaugă'}
							</button>
						</div>
					</div>
				)}
				{errors.q4_obligatie_intemeiata && <p className="text-red-600 text-sm">{errors.q4_obligatie_intemeiata.message}</p>}
			</div>

			{/* Q5 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 5</h3>
				<p className="text-gray-700">
					Pe o scară de la 1 la 5, cât de capabil v-ați simți să vă țineți contabilitatea în regim propriu și să depuneți singur declarațiile fiscale (fără contabil), dacă legea ar permite acest lucru?
				</p>
				<div className="flex flex-wrap gap-2">
					{[1, 2, 3, 4, 5].map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => setValue('q5_capabil_score', s, { shouldValidate: true })}
							className={`min-w-[3rem] px-4 py-3 border rounded-md font-semibold ${
								watch('q5_capabil_score') === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'
							}`}
						>
							{s}
						</button>
					))}
					<button
						type="button"
						onClick={() => setValue('q5_capabil_score', 0, { shouldValidate: true })}
						className={`min-w-[3rem] px-4 py-3 border rounded-md font-semibold ${
							watch('q5_capabil_score') === 0 ? 'bg-gray-500 text-white' : 'border-gray-300 hover:bg-gray-50'
						}`}
					>
						Nu știu/Nu răspund
					</button>
				</div>
				<div className="flex justify-between text-xs text-gray-500">
					<span>1 - Deloc capabil</span>
					<span>5 - Foarte capabil</span>
				</div>
				<div className="mt-2">
					<label className="block text-sm text-gray-600 mb-1">Motive (opțional):</label>
					<textarea
						{...register('q5_capabil_motive')}
						className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
						rows={2}
						placeholder="Explicație opțională"
					/>
				</div>
				{errors.q5_capabil_score && <p className="text-red-600 text-sm">{errors.q5_capabil_score.message}</p>}
			</div>

			{/* Q6 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 6</h3>
				<p className="text-gray-700">
					Dar dacă acest proces ar fi automatizat/simplificat și ar dura sub 30 de minute pe lună, care ar fi principalul motiv pentru care ați alege totuși să lucrați cu un contabil?
				</p>
				<div className="space-y-2">
					{Q6_OPTIONS.map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setValue('q6_motiv_automatizat', opt, { shouldValidate: true })}
							className={`w-full text-left px-4 py-2 border rounded-md text-sm ${
								(watch('q6_motiv_automatizat') === opt || (opt === 'Altul' && watch('q6_motiv_automatizat')?.startsWith('Altul')))
									? 'bg-indigo-600 text-white border-indigo-600'
									: 'border-gray-300 hover:bg-gray-50'
							}`}
						>
							{opt}
						</button>
					))}
					{watch('q6_motiv_automatizat')?.startsWith('Altul') && (
						<input
							type="text"
							value={q6Altul}
							onChange={(e) => {
								setQ6Altul(e.target.value)
								setValue('q6_motiv_automatizat', e.target.value ? `Altul: ${e.target.value}` : 'Altul', { shouldValidate: true })
							}}
							placeholder="Specificați..."
							className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm mt-1"
						/>
					)}
				</div>
				{errors.q6_motiv_automatizat && <p className="text-red-600 text-sm">{errors.q6_motiv_automatizat.message}</p>}
			</div>

			{/* Q7 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 7</h3>
				<p className="text-gray-700">Ce sumă medie lunară plătiți pentru contabilitate?</p>
				<div className="flex flex-wrap gap-2">
					{['0-100', '100-200', '200-300', '300-400', '400-500', '500-600', '600-700', '700-800', '800-900', '900-1000', '1000+'].map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setValue('q7_suma_lunara', opt, { shouldValidate: true })}
							className={`px-3 py-2 border rounded-md text-sm font-medium ${
								watch('q7_suma_lunara') === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'
							}`}
						>
							{opt} RON
						</button>
					))}
					<button
						type="button"
						onClick={() => setValue('q7_suma_lunara', 'Nu știu/Nu răspund', { shouldValidate: true })}
						className={`px-3 py-2 border rounded-md text-sm font-medium ${
							watch('q7_suma_lunara') === 'Nu știu/Nu răspund' ? 'bg-gray-500 text-white' : 'border-gray-300 hover:bg-gray-50'
						}`}
					>
						Nu știu/Nu răspund
					</button>
				</div>
				{errors.q7_suma_lunara && <p className="text-red-600 text-sm">{errors.q7_suma_lunara.message}</p>}
			</div>

			{/* Q8 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 8</h3>
				<p className="text-gray-700">De ce folosiți un contabil?</p>
				<div className="flex flex-wrap gap-2">
					{Q8_OPTIONS.map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setValue('q8_de_ce_contabil', opt, { shouldValidate: true })}
							className={`px-3 py-2 border rounded-md text-sm font-medium ${
								watch('q8_de_ce_contabil') === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'
							}`}
						>
							{opt}
						</button>
					))}
				</div>
				{errors.q8_de_ce_contabil && <p className="text-red-600 text-sm">{errors.q8_de_ce_contabil.message}</p>}
			</div>

			{/* Q9 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 9</h3>
				<p className="text-gray-700">Dacă ANAF ar pre-completa toate declarațiile prin e-Factura, ați renunța la contabil?</p>
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setValue('q9_renunta_contabil', 'da', { shouldValidate: true })}
						className={`px-4 py-2 border rounded-md font-medium ${
							q9Val === 'da' ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 hover:bg-gray-50'
						}`}
					>
						DA
					</button>
					<button
						type="button"
						onClick={() => setValue('q9_renunta_contabil', 'nu', { shouldValidate: true })}
						className={`px-4 py-2 border rounded-md font-medium ${
							q9Val === 'nu' ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 hover:bg-gray-50'
						}`}
					>
						NU
					</button>
					<button
						type="button"
						onClick={() => setValue('q9_renunta_contabil', 'nu_stiu', { shouldValidate: true })}
						className={`px-4 py-2 border rounded-md font-medium ${
							q9Val === 'nu_stiu' ? 'bg-gray-500 text-white' : 'border-gray-300 hover:bg-gray-50'
						}`}
					>
						Nu știu/Nu răspund
					</button>
				</div>
				{(q9Val === 'da' || q9Val === 'nu') && (
					<div className="mt-4 pl-2 border-l-2 border-indigo-200">
						<p className="text-sm font-medium text-gray-700 mb-2">Motive (opțional):</p>
						<div className="flex flex-wrap gap-2 mb-2">
							{renuntaOptions.map((opt) => (
								<button
									key={opt.id}
									type="button"
									onClick={() => toggleMotive('renunta_contabil', opt.id)}
									className={`px-3 py-1.5 rounded text-sm ${
										q9MotiveIds.includes(opt.id) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									{opt.label}
								</button>
							))}
						</div>
						<div className="flex gap-2 flex-wrap items-center">
							<input
								type="text"
								value={q9OtherText}
								onChange={(e) => setQ9OtherText(e.target.value)}
								placeholder="Altele (adaugă opțiune nouă)"
								className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
							<button
								type="button"
								onClick={() => addOtherMotive('renunta_contabil')}
								disabled={!q9OtherText.trim() || addingQ9}
								className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
							>
								{addingQ9 ? '...' : 'Adaugă'}
							</button>
						</div>
					</div>
				)}
				{errors.q9_renunta_contabil && <p className="text-red-600 text-sm">{errors.q9_renunta_contabil.message}</p>}
			</div>

			{/* Q10 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 10</h3>
				<p className="text-gray-700">Vârstă</p>
				<div className="flex flex-wrap gap-2">
					{VARSTA_OPTIONS.map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setValue('q10_varsta', opt, { shouldValidate: true })}
							className={`px-3 py-2 border rounded-md text-sm font-medium ${
								watch('q10_varsta') === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'
							}`}
						>
							{opt}
						</button>
					))}
				</div>
				{errors.q10_varsta && <p className="text-red-600 text-sm">{errors.q10_varsta.message}</p>}
			</div>

			{/* Q11 */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold text-gray-900">Întrebarea 11</h3>
				<p className="text-gray-700">Nivel studii</p>
				<div className="flex flex-wrap gap-2">
					{STUDII_OPTIONS.map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setValue('q11_nivel_studii', opt, { shouldValidate: true })}
							className={`px-3 py-2 border rounded-md text-sm font-medium ${
								watch('q11_nivel_studii') === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'
							}`}
						>
							{opt}
						</button>
					))}
				</div>
				{errors.q11_nivel_studii && <p className="text-red-600 text-sm">{errors.q11_nivel_studii.message}</p>}
			</div>

			<div className="pt-6 border-t space-y-3">
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
				>
					{isSubmitting ? 'Se trimite...' : 'Trimite Sondaj'}
				</button>
				<button
					type="button"
					onClick={() => onSurveyAbandoned?.(getValues())}
					disabled={isSubmitting}
					className="w-full px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
				>
					Apel închis / Abandonat de respondent
				</button>
			</div>
		</form>
	)
}
