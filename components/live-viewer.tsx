'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { SurveyResponseV2 } from '@/lib/supabase'
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
import Link from 'next/link'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe']

function aggregateByField(
	data: SurveyResponseV2[],
	field: keyof SurveyResponseV2
): { name: string; value: number }[] {
	const counts: Record<string, number> = {}
	data.forEach((row) => {
		const val = row[field]
		if (val !== undefined && val !== null && val !== '') {
			const key = String(val)
			counts[key] = (counts[key] || 0) + 1
		}
	})
	return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function aggregateScore1to5(data: SurveyResponseV2[], field: 'q5_capabil_score'): { score: string; count: number }[] {
	const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
	data.forEach((row) => {
		const val = row[field]
		if (val == null || val === 0) {
			counts[0]++
		} else if (typeof val === 'number' && val >= 1 && val <= 5) {
			counts[val] = (counts[val] || 0) + 1
		}
	})
	return [
		{ score: 'Nu știu', count: counts[0] || 0 },
		...[1, 2, 3, 4, 5].map((s) => ({ score: String(s), count: counts[s] || 0 }))
	]
}

function aggregateDaNu(data: SurveyResponseV2[]): { name: string; value: number }[] {
	const da = data.filter((r) => r.este_administrator).length
	const nu = data.filter((r) => !r.este_administrator).length
	return [
		{ name: 'DA', value: da },
		{ name: 'NU', value: nu }
	]
}

type OperatorFilter = 'all' | 'nectarie' | 'alexandra' | 'ioana'

export function LiveViewer() {
	const [data, setData] = useState<SurveyResponseV2[]>([])
	const [operatorFilter, setOperatorFilter] = useState<OperatorFilter>('all')

	useEffect(() => {
		const fetchData = async () => {
			const { data: rows, error } = await supabase
				.from('survey_responses_v2')
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

	const filteredData =
		operatorFilter === 'all' ? data : data.filter((r) => r.operator?.toLowerCase() === operatorFilter)

	const validData = filteredData.filter((r) => !r.motiv_incheiere || r.motiv_incheiere.trim() === '')
	const n0 = validData.length

	const daNuData = filteredData.filter(
		(r) => !r.motiv_incheiere || r.motiv_incheiere.trim() === '' || r.motiv_incheiere === 'Administrator absent la telefon'
	)

	const q2 = aggregateByField(validData, 'q2_procent_cheltuieli')
	const q3 = aggregateByField(validData, 'q3_relatie_contabil')
	const q4 = aggregateByField(validData, 'q4_obligatie_intemeiata')
	const q5 = aggregateScore1to5(validData, 'q5_capabil_score')
	const q6 = aggregateByField(validData, 'q6_motiv_automatizat')
	const q7 = aggregateByField(validData, 'q7_suma_lunara')
	const q8 = aggregateByField(validData, 'q8_de_ce_contabil')
	const q9 = aggregateByField(validData, 'q9_renunta_contabil')
	const q10 = aggregateByField(validData, 'q10_varsta')
	const q11 = aggregateByField(validData, 'q11_nivel_studii')
	const daNu = aggregateDaNu(daNuData)

	const total = filteredData.length
	const apeluriRatate = filteredData.filter((r) => r.motiv_incheiere === 'Nu a răspuns la telefon').length
	const refuzat = filteredData.filter((r) => r.motiv_incheiere === 'A răspuns, nu a dorit să vorbească').length
	const rataApeluriRatate = total > 0 ? ((apeluriRatate / total) * 100).toFixed(1) : '0'
	const rataRefuzat = total > 0 ? ((refuzat / total) * 100).toFixed(1) : '0'
	const rataValide = total > 0 ? ((n0 / total) * 100).toFixed(1) : '0'

	const pieRadius = { inner: 20, outer: 42 }

	return (
		<div
			className="fixed right-0 top-0 z-40 w-[28rem] overflow-y-auto overflow-x-hidden border-l border-gray-200 bg-white shadow-xl flex flex-col"
			style={{ height: '100vh' }}
		>
			<div className="p-2 flex-shrink-0">
				<div className="flex items-center justify-between gap-1 mb-1">
					<h3 className="text-sm font-bold text-indigo-600">LIVE v2</h3>
					<div className="flex gap-1 flex-wrap">
						{(['all', 'nectarie', 'alexandra', 'ioana'] as const).map((op) => (
							<button
								key={op}
								type="button"
								onClick={() => setOperatorFilter(op)}
								className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
									operatorFilter === op
										? 'bg-indigo-600 text-white'
										: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
								}`}
							>
								{op === 'all' ? 'Toate' : op.charAt(0).toUpperCase() + op.slice(1)}
							</button>
						))}
					</div>
				</div>
				<p className="text-xs text-gray-500 mb-2">
					n={total} n0={n0} | valide: {rataValide}% | refuzat: {rataRefuzat}% | apeluri ratate: {rataApeluriRatate}%
				</p>
				<Link href="/statistici-vechi-1" className="text-[10px] text-indigo-600 hover:underline">
					Statistici vechi (set 1)
				</Link>
			</div>
			<div key={operatorFilter} className="flex-1 min-h-0 flex flex-col gap-2 px-2 pb-2">
				{/* Q1 DA/NU + Q2 */}
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

				{/* Q3 + Q4 */}
				<div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q3 Relație contabil</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={q3}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{q3.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q4 Obligație întemeiată</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={q4}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{q4.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Q5 scară */}
				<div className="flex-1 min-h-0 flex flex-col">
					<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q5 Capabil (1-5)</p>
					<div className="flex-1 min-h-[80px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={q5} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
								<XAxis type="number" hide />
								<YAxis
									type="category"
									dataKey="score"
									domain={['Nu știu', '1', '2', '3', '4', '5']}
									tick={{ fontSize: 10, fontWeight: 600 }}
									width={36}
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

				{/* Q6 + Q7 */}
				<div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q6 Motiv automatizat</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={q6}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{q6.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
					<div className="min-h-0 flex flex-col">
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

				{/* Q8 + Q9 */}
				<div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q8 De ce contabil</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={q8}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{q8.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q9 Renunța la contabil</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={q9}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{q9.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Q10 + Q11 */}
				<div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q10 Vârstă</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={q10}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{q10.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
									<Tooltip contentStyle={{ fontSize: '11px' }} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
					<div className="min-h-0 flex flex-col">
						<p className="text-xs font-medium text-gray-700 mb-0.5 flex-shrink-0">Q11 Studii</p>
						<div className="flex-1 min-h-[80px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={q11}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{q11.map((_, i) => (
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
		</div>
	)
}
