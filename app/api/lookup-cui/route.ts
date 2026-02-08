import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const { cui } = await request.json()
		
		if (!cui) {
			return NextResponse.json(
				{ error: 'CUI is required' },
				{ status: 400 }
			)
		}

		// Clean the CUI (remove spaces, special characters)
		const cleanCUI = cui.replace(/\D/g, '')
		
		// Try ANAF OpenAPI endpoint
		const anafResponse = await fetch(
			'https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify([{ cui: cleanCUI }])
			}
		)

		if (anafResponse.ok) {
			const data = await anafResponse.json()
			
			if (data.found && data.found[0]) {
				const company = data.found[0]
				
				return NextResponse.json({
					cui: cleanCUI,
					nume: company.denumire || '',
					adresa: company.adresa || '',
					localitate: extractLocalitate(company.adresa || ''),
					judet: extractJudet(company.adresa || ''),
					codCaen: company.codCaen || ''
				})
			}
		}

		// Try alternative endpoint - OpenAPI.ro
		try {
			const openApiResponse = await fetch(
				`https://api.openapi.ro/api/companies/${cleanCUI}`,
				{
					headers: {
						'x-api-key': 'demo'
					}
				}
			)

			if (openApiResponse.ok) {
				const data = await openApiResponse.json()
				
				return NextResponse.json({
					cui: cleanCUI,
					nume: data.denumire || data.name || '',
					adresa: data.adresa || data.address || '',
					localitate: data.localitate || data.city || '',
					judet: data.judet || data.county || '',
					codCaen: data.cod_caen || data.caen || ''
				})
			}
		} catch (error) {
			console.error('OpenAPI.ro error:', error)
		}

		return NextResponse.json(
			{ error: 'Company not found' },
			{ status: 404 }
		)
	} catch (error) {
		console.error('API error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

function extractLocalitate(adresa: string): string {
	const parts = adresa.split(',')
	for (const part of parts) {
		const trimmed = part.trim()
		if (trimmed.toLowerCase().startsWith('oras ') || 
				trimmed.toLowerCase().startsWith('municipiul ') ||
				trimmed.toLowerCase().startsWith('comuna ')) {
			return trimmed.replace(/^(oras |municipiul |comuna )/i, '')
		}
	}
	return parts[0]?.trim() || ''
}

function extractJudet(adresa: string): string {
	const parts = adresa.split(',')
	for (const part of parts) {
		const trimmed = part.trim()
		if (trimmed.toLowerCase().startsWith('judet ') || 
				trimmed.toLowerCase().startsWith('jud. ')) {
			return trimmed.replace(/^(judet |jud\. )/i, '')
		}
	}
	return parts[parts.length - 1]?.trim() || ''
}
