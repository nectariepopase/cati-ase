'use client'

import { useAuth } from '@/lib/auth-context'
import { LoginForm } from '@/components/login-form'
import { StatisticiPrezentare } from '@/components/statistici-prezentare'

export default function StatisticiPrezentarePage() {
	const { user } = useAuth()

	if (!user) {
		return <LoginForm />
	}

	return <StatisticiPrezentare />
}
