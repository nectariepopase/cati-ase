'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { SurveyResponse } from '@/lib/supabase'
import {
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe']

function aggregateByField(
	data: SurveyResponse[],
	field: keyof SurveyResponse
): { name: string; value: number }[] {
	const counts: Record<string, number> = {}
	data.forEach((row) => {
		const val = row[field]
		if (val !== undefined && val !== null && val !== '') {
			const key = String(val)
			counts[key] = (counts[key] || 0) + 1
		} else {
			counts['N/A'] = (counts['N/A'] || 0) + 1
		}
	})
	return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function aggregateScore1to5(data: SurveyResponse[], field: keyof SurveyResponse): { score: string; count: number }[] {
	const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
	data.forEach((row) => {
		const val = row[field]
		const num = typeof val === 'string' ? parseInt(val, 10) : val
		if (typeof num === 'number' && !isNaN(num) && num >= 1 && num <= 5) {
			counts[num] = (counts[num] || 0) + 1
		}
	})
	return [1, 2, 3, 4, 5].map((s) => ({ score: String(s), count: counts[s] || 0 }))
}

function aggregateDaNu(data: SurveyResponse[]): { name: string; value: number }[] {
	const da = data.filter((r) => r.este_administrator).length
	const nu = data.filter((r) => !r.este_administrator).length
	return [
		{ name: 'DA', value: da },
		{ name: 'NU', value: nu }
	]
}

export function LiveViewer() {
	const [data, setData] = useState<SurveyResponse[]>([])

	useEffect(() => {
		const fetchData = async () => {
			const { data: rows, error } = await supabase
				.from('survey_responses')
				.select('*')
				.order('created_at', { ascending: true })

			if (!error) {
				setData(rows || [])
			}
		}

		fetchData()
		const interval = setInterval(fetchData, 60 * 1000)

		return () => clearInterval(interval)
	}, [])

	const q2 = aggregateByField(data, 'procent_cheltuieli_contabil')
	const q3 = aggregateScore1to5(data, 'impediment_contabil_score')
	const q4 = aggregateScore1to5(data, 'justificare_obligativitate_score')
	const q5 = aggregateScore1to5(data, 'capabil_contabilitate_proprie_score')
	const q6 = aggregateScore1to5(data, 'influenta_costuri_contabilitate')
	const q7 = aggregateByField(data, 'suma_lunara_contabilitate')
	const daNu = aggregateDaNu(data)

	const total = data.length
	const apeluriRatate = data.filter((r) => r.motiv_incheiere === 'Nu a răspuns la telefon').length
	const refuzat = data.filter((r) => r.motiv_incheiere === 'A răspuns, nu a dorit să vorbească').length
	const rataApeluriRatate = total > 0 ? ((apeluriRatate / total) * 100).toFixed(1) : '0'
	const rataRefuzat = total > 0 ? ((refuzat / total) * 100).toFixed(1) : '0'

	const pieRadius = { inner: 20, outer: 42 }

	return (
		<div
			className="fixed right-0 top-0 z-40 w-[28rem] overflow-y-auto overflow-x-hidden border-l border-gray-200 bg-white shadow-xl flex flex-col"
			style={{ height: '100vh' }}
		>
			<div className="p-2 flex-shrink-0">
				<h3 className="text-sm font-bold text-indigo-600 mb-1">LIVE</h3>
				<p className="text-xs text-gray-500 mb-2">
					n={data.length} | refuzat: {rataRefuzat}% | apeluri ratate: {rataApeluriRatate}%
				</p>
			</div>
			<div className="flex-1 min-h-0 flex flex-col gap-2 px-2 pb-2">
				{/* Q1 + Q2 — două coloane */}
				<div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q1 DA/NU Admin</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={daNu}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
										label={({ name, value }) => `${name}: ${value}`}
									>
										{daNu.map((_, i) => (
											<Cell key={i} fill={i === 0 ? '#22c55e' : '#ef4444'} />
										))}
									</Pie>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q2 % cheltuieli</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={q2}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{q2.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Q3 + Q4 — două coloane */}
				<div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q3 Impediment (1-5)</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={q3} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
									<XAxis type="number" hide />
									<YAxis
										type="category"
										dataKey="score"
										domain={['1', '2', '3', '4', '5']}
										tick={{ fontSize: 11, fontWeight: 600 }}
										width={28}
										axisLine
										tickLine
										interval={0}
									/>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
									<Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q4 Justificare (1-5)</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={q4} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
									<XAxis type="number" hide />
									<YAxis
										type="category"
										dataKey="score"
										domain={['1', '2', '3', '4', '5']}
										tick={{ fontSize: 11, fontWeight: 600 }}
										width={28}
										axisLine
										tickLine
										interval={0}
									/>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
									<Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Q5 + Q6 — două coloane */}
				<div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q5 Capabil (1-5)</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={q5} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
									<XAxis type="number" hide />
									<YAxis
										type="category"
										dataKey="score"
										domain={['1', '2', '3', '4', '5']}
										tick={{ fontSize: 11, fontWeight: 600 }}
										width={28}
										axisLine
										tickLine
										interval={0}
									/>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
									<Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q6 Influență (1-5)</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={q6} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
									<XAxis type="number" hide />
									<YAxis
										type="category"
										dataKey="score"
										domain={['1', '2', '3', '4', '5']}
										tick={{ fontSize: 11, fontWeight: 600 }}
										width={28}
										axisLine
										tickLine
										interval={0}
									/>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
									<Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Q7 — singur pe coloana */}
				<div className="flex-1 min-h-[100px] flex flex-col">
					<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q7 Sumă lunară</p>
					<div className="flex-1 min-h-[80px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={q7}
									cx="50%"
									cy="50%"
									innerRadius={pieRadius.inner}
									outerRadius={pieRadius.outer}
									paddingAngle={2}
									dataKey="value"
								>
									{q7.map((_, i) => (
										<Cell key={i} fill={COLORS[i % COLORS.length]} />
									))}
								</Pie>
								<Tooltip contentStyle={{ fontSize: '11px' }} />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</div>
	)
}
