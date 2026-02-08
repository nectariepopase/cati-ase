'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export function LoginForm() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const { login } = useAuth()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		const success = login(username, password)
		
		if (!success) {
			setError('Utilizator sau parolă incorectă')
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
				<h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
					CATI Survey System
				</h1>
				
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label 
							htmlFor="username" 
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Utilizator
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="alexandra sau nectarie"
							required
						/>
					</div>

					<div>
						<label 
							htmlFor="password" 
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Parolă
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="••••"
							required
						/>
					</div>

					{error && (
						<div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
							{error}
						</div>
					)}

					<button
						type="submit"
						className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
					>
						Autentificare
					</button>
				</form>
			</div>
		</div>
	)
}
