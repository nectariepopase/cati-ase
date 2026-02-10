'use client'

import { useAuth } from '@/lib/auth-context'
import { LoginForm } from '@/components/login-form'
import { MobileResearch } from '@/components/mobile-research'

export default function MobilePage() {
	const { user } = useAuth()

	if (!user) {
		return <LoginForm />
	}

	return <MobileResearch />
}
