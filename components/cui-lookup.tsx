'use client'

import { useState } from 'react'
import { type CompanyData } from '@/lib/anaf-api'
import { supabase } from '@/lib/supabase'

type CUILookupProps = {
	onCompanyFound: (company: CompanyData) => void
}

function parseTargetareText(text: string): CompanyData | null {
	try {
		// Extract CUI
		const cuiMatch = text.match(/CUI\s*(\d+)/i)
		const cui = cuiMatch ? cuiMatch[1] : ''
		
		// Extract company name (appears after Targetare.ro and before "Caută")
		const nameMatch = text.match(/Targetare\.ro\s+([A-ZĂÂÎȘȚ\s&.-]+SRL|[A-ZĂÂÎȘȚ\s&.-]+SA)/i)
		const nume = nameMatch ? nameMatch[1].trim() : ''
		
		// Extract CAEN code (format: 6311 - Description)
		const caenMatch = text.match(/CAEN\s*(\d+)\s*-/i)
		const codCaen = caenMatch ? caenMatch[1] : ''
		
		// Extract phone - prioritize "este +40...", then validated line after "Telefon"
		const looksLikePhone = (s: string) => /^\+\d/.test(s.trim()) && /[\d\*]/.test(s)
		let telefon = ''
		const telefonSentenceMatch = text.match(/este\s+(\+\d[\d\s\*\-]+)/i)
		if (telefonSentenceMatch) {
			telefon = telefonSentenceMatch[1].trim()
		}
		if (!telefon) {
			const telefonLineMatch = text.match(/Telefon\s*\n\s*([^\n]+)/i)
			if (telefonLineMatch) {
				const candidate = telefonLineMatch[1].trim()
				if (looksLikePhone(candidate)) {
					telefon = candidate
				}
			}
		}
		if (!telefon) {
			const phoneInContact = text.match(/Date de contact[\s\S]*?(\+\d{2,3}[\d\s\*\-]{8,15})/i)
			if (phoneInContact) {
				telefon = phoneInContact[1].trim()
			}
		}
		
		// Extract administrator (line after "Administrator")
		let administrator = ''
		const adminMatch = text.match(/Administrator\s*\n\s*(?:GDPR\s*\n\s*)?([^\n]+)/i)
		if (adminMatch) {
			administrator = adminMatch[1].trim()
		}
		
		// Extract address (format variabil: Municipiul X, Jud. Y, Sat X Ors./Com. Y, etc.)
		const addressMatch = text.match(/Adresa\s+([\s\S]+?)(?=Top firme|Administrator)/i)
		let localitate = ''
		let judet = ''
		let adresa = ''
		
		if (addressMatch) {
			adresa = addressMatch[1].trim()
			
			// Extract county/sector (Jud. Ilfov, Judet X, Sector 1)
			const judetMatch = adresa.match(/Sector\s+(\d+)|Judet\s+([^,\n]+)|Jud\.\s+([^,\n]+)/i)
			if (judetMatch) {
				judet = (judetMatch[1] || judetMatch[2] || judetMatch[3] || '').trim()
				if (judetMatch[1]) {
					judet = `Sector ${judet}`
				}
			}
			
			// Extract locality: Municipiul/Orasul/Comuna X, sau Sat X Ors./Com. Y (Ilfov etc.)
			const localitateMatch = adresa.match(/(Municipiul|Orasul|Comuna)\s+([^,]+)/i)
			if (localitateMatch) {
				localitate = localitateMatch[2].trim()
			} else {
				// Ilfov format: "Sat Varteju Ors. Magurele" sau "Sat X Com. Y" (Ors./Com. cu punct)
				const satOrsMatch = adresa.match(/Sat\s+([^\s,]+)\s+Ors\.\s+([^,\s]+)/i)
				if (satOrsMatch) {
					localitate = `${satOrsMatch[1].trim()}, ${satOrsMatch[2].trim()}`
				} else {
					const satComMatch = adresa.match(/Sat\s+([^\s,]+)\s+Com\.\s+([^,\s]+)/i)
					if (satComMatch) {
						localitate = `${satComMatch[1].trim()}, ${satComMatch[2].trim()}`
					} else {
						// Ors. X sau Com. X standalone
						const orsMatch = adresa.match(/Ors\.\s+([^,\s]+)/i)
						if (orsMatch) {
							localitate = orsMatch[1].trim()
						} else {
							const comMatch = adresa.match(/Com\.\s+([^,\s]+)/i)
							if (comMatch) {
								localitate = comMatch[1].trim()
							} else {
								const satMatch = adresa.match(/Sat\s+([^,\s]+)/i)
								if (satMatch) {
									localitate = satMatch[1].trim()
								}
							}
						}
					}
				}
			}
		}
		
		if (!cui || !nume) {
			return null
		}
		
		return {
			cui,
			nume,
			adresa,
			localitate: localitate || 'N/A',
			judet: judet || 'N/A',
			codCaen: codCaen || 'N/A',
			telefon: telefon || undefined,
			administrator: administrator || undefined
		}
	} catch (error) {
		console.error('Error parsing text:', error)
		return null
	}
}

export function CUILookup({ onCompanyFound }: CUILookupProps) {
	const [pastedText, setPastedText] = useState('')
	const [extractedData, setExtractedData] = useState<CompanyData | null>(null)
	const [error, setError] = useState('')
	const [isChecking, setIsChecking] = useState(false)

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const text = e.target.value
		setPastedText(text)
		setError('')
		
		if (text.length > 100) {
			const parsed = parseTargetareText(text)
			if (parsed) {
				setExtractedData(parsed)
				setError('')
			} else {
				setExtractedData(null)
				setError('Nu s-au putut extrage datele. Verificați textul copiat.')
			}
		} else {
			setExtractedData(null)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!extractedData) {
			setError('Vă rugăm să lipiți textul copiat din Targetare.ro')
			return
		}

		setIsChecking(true)
		setError('')
		try {
			const { data, error: fetchError } = await supabase
				.from('survey_responses')
				.select('id')
				.eq('cui', extractedData.cui)
				.limit(1)

			if (fetchError) {
				throw fetchError
			}

			if (data && data.length > 0) {
				setError(`Sondaj deja efectuat pentru această firmă (${extractedData.nume}, CUI ${extractedData.cui}). Nu puteți efectua un nou sondaj.`)
				return
			}

			onCompanyFound(extractedData)
		} catch (err) {
			console.error('Error checking existing survey:', err)
			setError('Eroare la verificarea bazei de date. Vă rugăm să încercați din nou.')
		} finally {
			setIsChecking(false)
		}
	}

	const handleClear = () => {
		setPastedText('')
		setExtractedData(null)
		setError('')
	}

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-xl font-semibold text-gray-900 mb-4">
				Date Firmă din Targetare.ro
			</h2>
			
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label 
						htmlFor="pastedText" 
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Lipiți textul copiat (Ctrl+A, Ctrl+C din Targetare.ro, apoi Ctrl+V aici)
					</label>
					<textarea
						id="pastedText"
						value={pastedText}
						onChange={handleTextChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
						placeholder="Accesați https://targetare.ro/CUI/nume-firma&#10;Selectați tot textul (Ctrl+A)&#10;Copiați (Ctrl+C)&#10;Lipiți aici (Ctrl+V)"
						rows={8}
						required
					/>
				</div>

				{error && (
					<div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
						{error}
					</div>
				)}

				{extractedData && (
					<div className="bg-green-50 p-4 rounded-md border border-green-200">
						<h3 className="text-sm font-semibold text-green-900 mb-2">
							✓ Date extrase cu succes:
						</h3>
						<div className="space-y-1 text-sm text-green-800">
							<p><span className="font-medium">CUI:</span> {extractedData.cui}</p>
							<p><span className="font-medium">Nume:</span> {extractedData.nume}</p>
							<p><span className="font-medium">Localitate:</span> {extractedData.localitate}</p>
							<p><span className="font-medium">Județ:</span> {extractedData.judet}</p>
							<p><span className="font-medium">Cod CAEN:</span> {extractedData.codCaen}</p>
							{extractedData.telefon && <p><span className="font-medium">Telefon:</span> {extractedData.telefon}</p>}
							{extractedData.administrator && <p><span className="font-medium">Administrator:</span> {extractedData.administrator}</p>}
						</div>
					</div>
				)}

				<div className="flex gap-3">
					<button
						type="submit"
						disabled={!extractedData || isChecking}
						className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						{isChecking ? 'Se verifică...' : extractedData ? 'Continuă cu sondajul' : 'Lipiți textul mai întâi'}
					</button>
					{pastedText && (
						<button
							type="button"
							onClick={handleClear}
							className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
						>
							Șterge
						</button>
					)}
				</div>
			</form>
		</div>
	)
}
