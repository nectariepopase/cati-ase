'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { surveySchema, type SurveyFormData } from '@/lib/validation'
import { type CompanyData } from '@/lib/anaf-api'

type SurveyFormProps = {
	company: CompanyData
	operator: string
	onSubmit: (data: SurveyFormData) => Promise<void>
	onSurveyEnded?: () => void
	onSurveyAbandoned?: (partialData: Partial<SurveyFormData>) => void
	isSubmitting: boolean
}

export function SurveyForm({ company, operator, onSubmit, onSurveyEnded, onSurveyAbandoned, isSubmitting }: SurveyFormProps) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		formState: { errors }
	} = useForm<SurveyFormData>({
		resolver: zodResolver(surveySchema),
		defaultValues: {
			cui: company.cui,
			nume_firma: company.nume,
			localitate: company.localitate,
			judet: company.judet,
			cod_caen: company.codCaen,
			este_administrator: false,
			procent_cheltuieli_contabil: '',
			impediment_contabil_score: 0,
			justificare_obligativitate_score: 0,
			capabil_contabilitate_proprie_score: 0,
			influenta_costuri_contabilitate: '',
			suma_lunara_contabilitate: ''
		}
	})

	const esteAdministrator = watch('este_administrator')

	if (!esteAdministrator) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md">
				<div className="mb-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Date Firmă
					</h2>
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
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Întrebarea 1
					</h3>
					<p className="text-gray-700 mb-4">
						Sunteți administratorul societății {company.nume}?
					</p>
					
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

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					Date Firmă
				</h2>
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

			<div className="space-y-8 border-t pt-6">
				{/* Question 2 */}
				<div className="space-y-3">
					<h3 className="text-lg font-semibold text-gray-900">
						Întrebarea 2
					</h3>
					<p className="text-gray-700">
						Aproximativ, ce procent din cheltuielile lunare actuale ale firmei este reprezentat de onorariul contabilului?
					</p>
					<div className="grid grid-cols-5 gap-2">
						{['0-10%', '10-20%', '20-30%', '30-40%', '40-50%', '50-60%', '60-70%', '70-80%', '80-90%', '90-100%'].map((option) => (
							<button
								key={option}
								type="button"
								onClick={() => setValue('procent_cheltuieli_contabil', option, { shouldValidate: true })}
								className={`px-3 py-3 border rounded-md transition-colors text-sm font-medium ${
									watch('procent_cheltuieli_contabil') === option
										? 'bg-indigo-600 text-white border-indigo-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}
							>
								{option}
							</button>
						))}
					</div>
					{errors.procent_cheltuieli_contabil && (
						<p className="text-red-600 text-sm">{errors.procent_cheltuieli_contabil.message}</p>
					)}
				</div>

				{/* Question 3 */}
				<div className="space-y-3">
					<h3 className="text-lg font-semibold text-gray-900">
						Întrebarea 3
					</h3>
					<p className="text-gray-700">
						Pe o scară de la 1 la 5 (1 - deloc, 5 - foarte mult), în ce măsură obligativitatea de a avea un contabil autorizat a reprezentat un impediment în decizia de a porni afacerea?
					</p>
					<div className="flex gap-2 justify-between">
						{[1, 2, 3, 4, 5].map((score) => (
							<button
								key={score}
								type="button"
								onClick={() => setValue('impediment_contabil_score', score, { shouldValidate: true })}
								className={`flex-1 px-4 py-3 border rounded-md transition-colors font-semibold ${
									watch('impediment_contabil_score') === score
										? 'bg-indigo-600 text-white border-indigo-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}
							>
								{score}
							</button>
						))}
					</div>
					<div className="flex justify-between text-xs text-gray-500">
						<span>1 - Deloc</span>
						<span>5 - Foarte mult</span>
					</div>
					{errors.impediment_contabil_score && (
						<p className="text-red-600 text-sm">{errors.impediment_contabil_score.message}</p>
					)}
				</div>

				{/* Question 4 */}
				<div className="space-y-3">
					<h3 className="text-lg font-semibold text-gray-900">
						Întrebarea 4
					</h3>
					<p className="text-gray-700">
						Pe o scară de la 1 la 5, cât de justificată considerați obligativitatea legală de a semna situațiile financiare exclusiv prin contabil autorizat/expert pentru microîntreprinderi în România?
					</p>
					<div className="flex gap-2 justify-between">
						{[1, 2, 3, 4, 5].map((score) => (
							<button
								key={score}
								type="button"
								onClick={() => setValue('justificare_obligativitate_score', score, { shouldValidate: true })}
								className={`flex-1 px-4 py-3 border rounded-md transition-colors font-semibold ${
									watch('justificare_obligativitate_score') === score
										? 'bg-indigo-600 text-white border-indigo-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}
							>
								{score}
							</button>
						))}
					</div>
					<div className="flex justify-between text-xs text-gray-500">
						<span>1 - Deloc justificată</span>
						<span>5 - Foarte justificată</span>
					</div>
					{errors.justificare_obligativitate_score && (
						<p className="text-red-600 text-sm">{errors.justificare_obligativitate_score.message}</p>
					)}
				</div>

				{/* Question 5 */}
				<div className="space-y-3">
					<h3 className="text-lg font-semibold text-gray-900">
						Întrebarea 5
					</h3>
					<p className="text-gray-700">
						Pe o scară de la 1 la 5, cât de capabil v-ați simți să vă țineți contabilitatea în regim propriu și să depuneți singur declarațiile fiscale (fără contabil), dacă legea ar permite acest lucru? (de exemplu cu ajutorul e-Factura/e-TVA)
					</p>
					<div className="flex gap-2 justify-between">
						{[1, 2, 3, 4, 5].map((score) => (
							<button
								key={score}
								type="button"
								onClick={() => setValue('capabil_contabilitate_proprie_score', score, { shouldValidate: true })}
								className={`flex-1 px-4 py-3 border rounded-md transition-colors font-semibold ${
									watch('capabil_contabilitate_proprie_score') === score
										? 'bg-indigo-600 text-white border-indigo-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}
							>
								{score}
							</button>
						))}
					</div>
					<div className="flex justify-between text-xs text-gray-500">
						<span>1 - Deloc capabil</span>
						<span>5 - Foarte capabil</span>
					</div>
					{errors.capabil_contabilitate_proprie_score && (
						<p className="text-red-600 text-sm">{errors.capabil_contabilitate_proprie_score.message}</p>
					)}
				</div>

				{/* Question 6 */}
				<div className="space-y-3">
					<h3 className="text-lg font-semibold text-gray-900">
						Întrebarea 6
					</h3>
					<p className="text-gray-700">
						În ce măsură considerați că nivelul costurilor cu serviciile de contabilitate influențează bugetul disponibil pentru alte direcții? (de exemplu marketing, stocuri etc)
					</p>
					<div className="flex gap-2 justify-between">
						{[1, 2, 3, 4, 5].map((score) => (
							<button
								key={score}
								type="button"
								onClick={() => setValue('influenta_costuri_contabilitate', score.toString(), { shouldValidate: true })}
								className={`flex-1 px-4 py-3 border rounded-md transition-colors font-semibold ${
									watch('influenta_costuri_contabilitate') === score.toString()
										? 'bg-indigo-600 text-white border-indigo-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}
							>
								{score}
							</button>
						))}
					</div>
					<div className="flex justify-between text-xs text-gray-500">
						<span>1 - Deloc</span>
						<span>5 - Foarte mult</span>
					</div>
					{errors.influenta_costuri_contabilitate && (
						<p className="text-red-600 text-sm">{errors.influenta_costuri_contabilitate.message}</p>
					)}
				</div>

				{/* Question 7 */}
				<div className="space-y-3">
					<h3 className="text-lg font-semibold text-gray-900">
						Întrebarea 7
					</h3>
					<p className="text-gray-700">
						Ce sumă medie lunară plătiți pentru contabilitate?
					</p>
					<div className="grid grid-cols-6 gap-2">
						{['0-100', '100-200', '200-300', '300-400', '400-500', '500-600', '600-700', '700-800', '800-900', '900-1000', '1000+'].map((option) => (
							<button
								key={option}
								type="button"
								onClick={() => setValue('suma_lunara_contabilitate', option, { shouldValidate: true })}
								className={`px-3 py-3 border rounded-md transition-colors text-sm font-medium ${
									watch('suma_lunara_contabilitate') === option
										? 'bg-indigo-600 text-white border-indigo-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}
							>
								{option} RON
							</button>
						))}
					</div>
					{errors.suma_lunara_contabilitate && (
						<p className="text-red-600 text-sm">{errors.suma_lunara_contabilitate.message}</p>
					)}
				</div>

				{/* Submit & Abandon Buttons */}
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
			</div>
		</form>
	)
}
