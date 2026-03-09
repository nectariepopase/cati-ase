'use client'

import {
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Legend,
	LabelList
} from 'recharts'
import Link from 'next/link'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#4f46e5', '#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe']

// Date extrapolate hardcodate (set validat statistic: n=2345, n0=410)
const SUMMARY = {
	total: 2345,
	n0: 410,
	valide: '17.5',
	refuzat: '40.2',
	apeluriRatate: '31.8'
}

const Q1_DA_NU = [
	{ name: 'DA', value: 364 },
	{ name: 'NU', value: 46 }
]

const Q2_CHELTUIELI = [
	{ name: '0-10%', value: 280 },
	{ name: '10-20%', value: 85 },
	{ name: 'Nu știu/Nu răspund', value: 45 }
]

const Q3_IMPEDIMENT = [
	{ score: 'Nu știu', count: 2 },
	{ score: '1', count: 220 },
	{ score: '2', count: 38 },
	{ score: '3', count: 66 },
	{ score: '4', count: 22 },
	{ score: '5', count: 62 }
]

const Q4_JUSTIFICARE = [
	{ score: 'Nu știu', count: 3 },
	{ score: '1', count: 30 },
	{ score: '2', count: 35 },
	{ score: '3', count: 63 },
	{ score: '4', count: 46 },
	{ score: '5', count: 233 }
]

const Q5_CAPABIL = [
	{ score: 'Nu știu', count: 4 },
	{ score: '1', count: 228 },
	{ score: '2', count: 49 },
	{ score: '3', count: 60 },
	{ score: '4', count: 25 },
	{ score: '5', count: 44 }
]

const Q6_INFLUENTA = [
	{ score: 'Nu știu', count: 5 },
	{ score: '1', count: 202 },
	{ score: '2', count: 74 },
	{ score: '3', count: 80 },
	{ score: '4', count: 32 },
	{ score: '5', count: 17 }
]

const Q7_SUMA_LUNARA = [
	{ name: '400-500', value: 80 },
	{ name: '200-300', value: 77 },
	{ name: '300-400', value: 59 },
	{ name: '700-800', value: 46 },
	{ name: '1000+', value: 39 },
	{ name: '500-600', value: 35 },
	{ name: '600-700', value: 26 },
	{ name: '800-900', value: 22 },
	{ name: '900-1000', value: 14 },
	{ name: '0-100', value: 7 },
	{ name: 'Nu știu/Nu răspund', value: 5 }
]

const pieRadius = { inner: 28, outer: 56 }
const CHART_HEIGHT = 200
const N0 = SUMMARY.n0

function barLabelFormatter(value: unknown): string {
	const n = Number(value)
	return `${n} (${((n / N0) * 100).toFixed(1)}%)`
}

export function StatisticiPrezentare() {
	return (
		<div className="min-h-screen bg-slate-100 p-6">
			<div className="max-w-5xl mx-auto">
				<div className="mb-6 flex items-center justify-between flex-wrap gap-2">
					<h1 className="text-2xl font-bold text-slate-900">Statistici sondaj (date extrapolate)</h1>
					<Link
						href="/"
						className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
					>
						Înapoi la sondaj
					</Link>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-slate-200">
					<h2 className="text-lg font-semibold text-slate-800 mb-2">Rezumat</h2>
					<p className="text-slate-600 mb-1">
						Filtru: Toate | n={SUMMARY.total} n0={SUMMARY.n0}
					</p>
					<p className="text-slate-600 text-sm">
						valide: {SUMMARY.valide}% | refuzat: {SUMMARY.refuzat}% | apeluri ratate: {SUMMARY.apeluriRatate}%
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200">
						<p className="text-sm font-semibold text-slate-700 mb-2">Q1 DA/NU Admin</p>
						<div style={{ height: CHART_HEIGHT }}>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={Q1_DA_NU}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
										label={({ name, value, percent }) => `${name}: ${value} (${((percent ?? 0) * 100).toFixed(1)}%)`}
									>
										{Q1_DA_NU.map((_, i) => (
											<Cell key={i} fill={i === 0 ? '#22c55e' : '#ef4444'} />
										))}
									</Pie>
									<Tooltip formatter={(value: number | undefined) => [value ?? 0, '']} contentStyle={{ fontSize: '12px' }} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200">
						<p className="text-sm font-semibold text-slate-700 mb-2">Q2 % cheltuieli</p>
						<div style={{ height: CHART_HEIGHT }}>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={Q2_CHELTUIELI}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{Q2_CHELTUIELI.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
									<Tooltip formatter={(value: number | undefined) => [value ?? 0, '']} contentStyle={{ fontSize: '12px' }} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200">
						<p className="text-sm font-semibold text-slate-700 mb-2">Q3 Impediment (1-5)</p>
						<div style={{ height: CHART_HEIGHT }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={Q3_IMPEDIMENT} layout="vertical" margin={{ top: 0, right: 72, left: 0, bottom: 0 }}>
									<XAxis type="number" hide />
									<YAxis
										type="category"
										dataKey="score"
										domain={['Nu știu', '1', '2', '3', '4', '5']}
										tick={{ fontSize: 11, fontWeight: 600 }}
										width={40}
										axisLine
										tickLine
										interval={0}
									/>
									<Tooltip contentStyle={{ fontSize: '12px' }} />
									<Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Nr.">
										<LabelList dataKey="count" position="right" formatter={barLabelFormatter} style={{ fontSize: 11, fontWeight: 600 }} />
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200">
						<p className="text-sm font-semibold text-slate-700 mb-2">Q4 Justificare (1-5)</p>
						<div style={{ height: CHART_HEIGHT }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={Q4_JUSTIFICARE} layout="vertical" margin={{ top: 0, right: 72, left: 0, bottom: 0 }}>
									<XAxis type="number" hide />
									<YAxis
										type="category"
										dataKey="score"
										domain={['Nu știu', '1', '2', '3', '4', '5']}
										tick={{ fontSize: 11, fontWeight: 600 }}
										width={40}
										axisLine
										tickLine
										interval={0}
									/>
									<Tooltip contentStyle={{ fontSize: '12px' }} />
									<Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Nr.">
										<LabelList dataKey="count" position="right" formatter={barLabelFormatter} style={{ fontSize: 11, fontWeight: 600 }} />
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200">
						<p className="text-sm font-semibold text-slate-700 mb-2">Q5 Capabil (1-5)</p>
						<div style={{ height: CHART_HEIGHT }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={Q5_CAPABIL} layout="vertical" margin={{ top: 0, right: 72, left: 0, bottom: 0 }}>
									<XAxis type="number" hide />
									<YAxis
										type="category"
										dataKey="score"
										domain={['Nu știu', '1', '2', '3', '4', '5']}
										tick={{ fontSize: 11, fontWeight: 600 }}
										width={40}
										axisLine
										tickLine
										interval={0}
									/>
									<Tooltip contentStyle={{ fontSize: '12px' }} />
									<Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Nr.">
										<LabelList dataKey="count" position="right" formatter={barLabelFormatter} style={{ fontSize: 11, fontWeight: 600 }} />
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200">
						<p className="text-sm font-semibold text-slate-700 mb-2">Q6 Influență (1-5)</p>
						<div style={{ height: CHART_HEIGHT }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={Q6_INFLUENTA} layout="vertical" margin={{ top: 0, right: 72, left: 0, bottom: 0 }}>
									<XAxis type="number" hide />
									<YAxis
										type="category"
										dataKey="score"
										domain={['Nu știu', '1', '2', '3', '4', '5']}
										tick={{ fontSize: 11, fontWeight: 600 }}
										width={40}
										axisLine
										tickLine
										interval={0}
									/>
									<Tooltip contentStyle={{ fontSize: '12px' }} />
									<Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Nr.">
										<LabelList dataKey="count" position="right" formatter={barLabelFormatter} style={{ fontSize: 11, fontWeight: 600 }} />
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200 md:col-span-2">
						<p className="text-sm font-semibold text-slate-700 mb-2">Q7 Sumă lunară (lei)</p>
						<div style={{ height: CHART_HEIGHT }}>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={Q7_SUMA_LUNARA}
										cx="50%"
										cy="50%"
										innerRadius={pieRadius.inner}
										outerRadius={pieRadius.outer}
										paddingAngle={2}
										dataKey="value"
									>
										{Q7_SUMA_LUNARA.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
									<Tooltip formatter={(value: number | undefined) => [value ?? 0, '']} contentStyle={{ fontSize: '12px' }} />
									<Legend
										content={({ payload }) => (
											<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', maxWidth: 280, justifyContent: 'center' }}>
												{payload?.map((entry, i) => (
													<span key={i} style={{ whiteSpace: 'nowrap', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
														<span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: entry.color, flexShrink: 0 }} />
														{entry.value}
													</span>
												))}
											</div>
										)}
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
