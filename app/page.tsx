'use client'

import { useAuth } from '@/lib/auth-context'
import { LoginForm } from '@/components/login-form'
import { SurveyDashboard } from '@/components/survey-dashboard'
import { LiveViewer } from '@/components/live-viewer'

export default function Home() {
	const { user } = useAuth()

	if (!user) {
		return <LoginForm />
	}

	return (
		<div className="flex">
			<main className="flex-1 min-w-0 pr-[28rem]">
				<SurveyDashboard />
			</main>
			<LiveViewer />
		</div>
	)
}
