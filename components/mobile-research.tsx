'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
	{ id: 'nevoi' as const, title: 'Nevoi', emoji: '📋' },
	{ id: 'dorinte' as const, title: 'Dorințe', emoji: '✨' },
	{ id: 'probleme' as const, title: 'Probleme', emoji: '⚠️' },
] as const

type CategoryId = 'nevoi' | 'dorinte' | 'probleme'

type Option = {
	id: number
	category: string
	label: string
	is_custom: boolean
	created_at?: string
}

type VoteCounts = Record<number, { total: number; byOperator: Record<string, number> }>

export function MobileResearch() {
	const { user, logout } = useAuth()
	const [options, setOptions] = useState<Option[]>([])
	const [counts, setCounts] = useState<VoteCounts>({})
	const [loading, setLoading] = useState(true)
	const [voting, setVoting] = useState<number | null>(null)
	const [otherText, setOtherText] = useState<Record<CategoryId, string>>({ nevoi: '', dorinte: '', probleme: '' })
	const [addingOther, setAddingOther] = useState<CategoryId | null>(null)

	const fetchData = useCallback(async () => {
		const [optRes, voteRes] = await Promise.all([
			supabase.from('mobile_research_options').select('id, category, label, is_custom, created_at').order('category').order('id'),
			supabase.from('mobile_research_votes').select('option_id, operator')
		])

		if (optRes.error) throw optRes.error
		if (voteRes.error) throw voteRes.error

		setOptions((optRes.data as Option[]) || [])

		const voteCounts: VoteCounts = {}
		for (const v of voteRes.data || []) {
			const oid = v.option_id as number
			if (!voteCounts[oid]) voteCounts[oid] = { total: 0, byOperator: {} }
			voteCounts[oid].total++
			const op = (v.operator as string) || ''
			voteCounts[oid].byOperator[op] = (voteCounts[oid].byOperator[op] || 0) + 1
		}
		setCounts(voteCounts)
	}, [])

	useEffect(() => {
		fetchData().catch(console.error).finally(() => setLoading(false))
	}, [fetchData])

	const handleVote = async (optionId: number) => {
		if (!user) return
		setVoting(optionId)
		try {
			const { error } = await supabase.from('mobile_research_votes').insert([{ option_id: optionId, operator: user.username }])
			if (error) throw error
			await fetchData()
		} catch (e) {
			console.error(e)
			alert('Eroare la înregistrarea punctului.')
		} finally {
			setVoting(null)
		}
	}

	const addOtherOption = async (category: CategoryId) => {
		const label = otherText[category]?.trim()
		if (!label || !user) return
		setAddingOther(category)
		try {
			const { data: inserted, error: insertError } = await supabase
				.from('mobile_research_options')
				.insert([{ category, label, is_custom: true }])
				.select('id')
				.single()

			let optionId: number

			if (insertError) {
				if (insertError.code === '23505') {
					const normalized = label.toLowerCase().trim()
					const { data: all } = await supabase.from('mobile_research_options').select('id, label').eq('category', category)
					const match = (all || []).find((o: { label: string }) => o.label.toLowerCase().trim() === normalized)
					optionId = match?.id
					if (optionId == null) throw new Error('Duplicate option but could not find id')
				} else throw insertError
			} else {
				optionId = inserted!.id
			}

			await supabase.from('mobile_research_votes').insert([{ option_id: optionId, operator: user.username }])
			setOtherText((prev) => ({ ...prev, [category]: '' }))
			await fetchData()
		} catch (e) {
			console.error(e)
			alert('Eroare la adăugarea opțiunii.')
		} finally {
			setAddingOther(null)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-100">
				<p className="text-slate-600">Se încarcă...</p>
			</div>
		)
	}

	const optionsByCategory = CATEGORIES.map((c) => ({
		...c,
		options: options.filter((o) => o.category === c.id)
	}))

	return (
		<div className="min-h-screen bg-slate-100 pb-safe">
			{/* Header - compact for mobile */}
			<header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 safe-area-top">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-bold text-slate-900">Cercetare door-to-door</h1>
						<p className="text-xs text-slate-500">Operator: <span className="font-medium capitalize text-slate-700">{user?.username}</span></p>
					</div>
					<button
						type="button"
						onClick={logout}
						className="px-3 py-1.5 text-sm rounded-lg bg-slate-200 text-slate-700 active:bg-slate-300"
					>
						Ieșire
					</button>
				</div>
			</header>

			<main className="px-4 py-4 space-y-6 max-w-lg mx-auto">
				<p className="text-sm text-slate-600">
					Alege nevoi/dorințe/probleme legate de contabilitate. Apasă pe o opțiune pentru +1 punct. Poți adăuga opțiuni noi cu „Altele”.
				</p>

				{optionsByCategory.map(({ id, title, emoji, options: opts }) => (
					<section key={id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
						<div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
							<h2 className="text-base font-semibold text-slate-800">
								<span className="mr-2">{emoji}</span>{title}
							</h2>
						</div>
						<div className="divide-y divide-slate-100">
							{opts.map((opt) => {
								const c = counts[opt.id] || { total: 0, byOperator: {} }
								const myCount = user ? (c.byOperator[user.username] || 0) : 0
								return (
									<button
										key={opt.id}
										type="button"
										onClick={() => handleVote(opt.id)}
										disabled={voting !== null}
										className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-slate-50 disabled:opacity-70"
									>
										<span className="text-slate-800 font-medium">{opt.label}</span>
										<span className="flex items-center gap-2 shrink-0">
											{myCount > 0 && (
												<span className="text-xs text-indigo-600 font-medium">+{myCount}</span>
											)}
											<span className="min-w-[2rem] text-right text-slate-500 tabular-nums" aria-label={`Total: ${c.total} puncte`}>
												{c.total}
											</span>
										</span>
									</button>
								)
							})}
							{/* Other: input + add */}
							<div className="px-4 py-3 bg-slate-50/80 flex flex-col gap-2">
								<label htmlFor={`other-${id}`} className="text-xs font-medium text-slate-500">
									Altele (adaugă opțiune nouă)
								</label>
								<div className="flex gap-2">
									<input
										id={`other-${id}`}
										type="text"
										value={otherText[id]}
										onChange={(e) => setOtherText((p) => ({ ...p, [id]: e.target.value }))}
										placeholder="Scrie și adaugă"
										className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
									/>
									<button
										type="button"
										onClick={() => addOtherOption(id)}
										disabled={!otherText[id]?.trim() || addingOther === id}
										className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm active:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
									>
										{addingOther === id ? '...' : 'Adaugă'}
									</button>
								</div>
							</div>
						</div>
					</section>
				))}
			</main>
		</div>
	)
}
