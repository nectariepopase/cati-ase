export type CompanyData = {
	cui: string
	nume: string
	adresa: string
	localitate: string
	judet: string
	codCaen: string
	telefon?: string
	administrator?: string
}

export async function fetchCompanyByCUI(cui: string): Promise<CompanyData | null> {
	try {
		// Call our server-side API route to avoid CORS issues
		const response = await fetch('/api/lookup-cui', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ cui })
		})

		if (!response.ok) {
			console.error('API response not ok:', response.status)
			return null
		}

		const data = await response.json()
		
		if (data.error) {
			console.error('API returned error:', data.error)
			return null
		}
		
		return data
	} catch (error) {
		console.error('Error fetching company data:', error)
		return null
	}
}
