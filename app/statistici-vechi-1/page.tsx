'use client'

import { useAuth } from '@/lib/auth-context'
import { LoginForm } from '@/components/login-form'
import { LiveViewerOld } from '@/components/live-viewer-old'

export default function StatisticiVechi1Page() {
	const { user } = useAuth()

	if (!user) {
		return <LoginForm />
	}

	return <LiveViewerOld />
}
