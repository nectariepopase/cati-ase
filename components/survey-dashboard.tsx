'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { CUILookup } from '@/components/cui-lookup'
import { SurveyForm } from '@/components/survey-form'
import { type CompanyData } from '@/lib/anaf-api'
import { type SurveyFormData } from '@/lib/validation'
import { supabase } from '@/lib/supabase'

export function SurveyDashboard() {
	const { user, logout } = useAuth()
	const [company, setCompany] = useState<CompanyData | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)

	const handleCompanyFound = (companyData: CompanyData) => {
		setCompany(companyData)
		setSuccessMessage(null)
	}

	const handleSubmit = async (data: SurveyFormData) => {
		if (!user) return

		setIsSubmitting(true)
		try {
			const { error } = await supabase
				.from('survey_responses')
				.insert([
					{
						...data,
						operator: user.username,
						telefon: company?.telefon || null,
						administrator: company?.administrator || null
					}
				])

			if (error) {
				throw error
			}

			// Show success message
			setSuccessMessage(`Date trimise pentru ${company?.nume}`)
			
			// Reset form for next survey
			setCompany(null)
		} catch (error) {
			console.error('Error submitting survey:', error)
			alert('Eroare la trimiterea datelor. Vă rugăm să încercați din nou.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleNewSurvey = () => {
		setSuccessMessage(null)
		setCompany(null)
	}

	const handleRestartWithoutSave = () => {
		setCompany(null)
		setSuccessMessage(null)
	}

	const handleSurveyAbandoned = async (partialData: Partial<SurveyFormData>) => {
		if (!user || !company) return

		setIsSubmitting(true)
		try {
			const payload = {
				cui: company.cui,
				nume_firma: company.nume,
				localitate: company.localitate,
				judet: company.judet,
				cod_caen: company.codCaen,
				este_administrator: true,
				procent_cheltuieli_contabil: partialData.procent_cheltuieli_contabil || 'N/A',
				impediment_contabil_score: partialData.impediment_contabil_score || 0,
				justificare_obligativitate_score: partialData.justificare_obligativitate_score || 0,
				capabil_contabilitate_proprie_score: partialData.capabil_contabilitate_proprie_score || 0,
				influenta_costuri_contabilitate: partialData.influenta_costuri_contabilitate || 'N/A',
				suma_lunara_contabilitate: partialData.suma_lunara_contabilitate || 'N/A',
				operator: user.username,
				telefon: company.telefon || null,
				administrator: company.administrator || null,
				motiv_incheiere: 'Apel închis / abandonat de respondent'
			}

			const { error } = await supabase
				.from('survey_responses')
				.insert([payload])

			if (error) {
				throw error
			}

			setSuccessMessage(`Sondaj abandonat pentru ${company.nume} - Apel închis / abandonat de respondent`)
			setCompany(null)
		} catch (error) {
			console.error('Error saving abandoned survey:', error)
			alert('Eroare la salvarea datelor. Vă rugăm să încercați din nou.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleSurveyEnded = async (motiv: string) => {
		if (!user || !company) return

		setIsSubmitting(true)
		try {
			const { error } = await supabase
				.from('survey_responses')
				.insert([
					{
						cui: company.cui,
						nume_firma: company.nume,
						localitate: company.localitate,
						judet: company.judet,
						cod_caen: company.codCaen,
						este_administrator: false,
						procent_cheltuieli_contabil: 'N/A',
						impediment_contabil_score: 0,
						justificare_obligativitate_score: 0,
						capabil_contabilitate_proprie_score: 0,
						influenta_costuri_contabilitate: 'N/A',
						suma_lunara_contabilitate: 'N/A',
						operator: user.username,
						telefon: company.telefon || null,
						administrator: company.administrator || null,
						motiv_incheiere: motiv
					}
				])

			if (error) {
				throw error
			}

			setSuccessMessage(`Sondaj încheiat pentru ${company.nume} - ${motiv}`)
			setCompany(null)
		} catch (error) {
			console.error('Error saving survey end:', error)
			alert('Eroare la salvarea datelor. Vă rugăm să încercați din nou.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="max-w-4xl mx-auto p-6">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center flex-wrap gap-2">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Sistem CATI - Sondaj Contabilitate
						</h1>
						<p className="text-gray-600">
							Operator: <span className="font-semibold capitalize">{user?.username}</span>
						</p>
					</div>
					<div className="flex gap-2">
						{company && (
							<button
								onClick={handleRestartWithoutSave}
								className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
								title="Resetează sondajul fără să salveze nimic în baza de date"
							>
								Reîncepe sondaj
							</button>
						)}
						<button
							onClick={logout}
							className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
						>
							Deconectare
						</button>
					</div>
				</div>

				{/* Success Message */}
				{successMessage && (
					<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<svg 
									className="w-6 h-6 text-green-600" 
									fill="none" 
									strokeLinecap="round" 
									strokeLinejoin="round" 
									strokeWidth="2" 
									viewBox="0 0 24 24" 
									stroke="currentColor"
								>
									<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
								<p className="text-green-800 font-semibold">{successMessage}</p>
							</div>
							<button
								onClick={handleNewSurvey}
								className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
							>
								Sondaj Nou
							</button>
						</div>
					</div>
				)}

				{/* CUI Lookup or Survey Form */}
				{!company && !successMessage && (
					<CUILookup onCompanyFound={handleCompanyFound} />
				)}

				{company && !successMessage && user && (
					<SurveyForm
						company={company}
						operator={user.username}
						onSubmit={handleSubmit}
						onSurveyEnded={() => handleSurveyEnded('Administrator absent la telefon')}
						onSurveyAbandoned={handleSurveyAbandoned}
						isSubmitting={isSubmitting}
					/>
				)}
			</div>
		</div>
	)
}
