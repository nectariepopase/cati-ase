'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const SESSION_KEY = 'cati-operator'

type User = {
	username: string
}

type AuthContextType = {
	user: User | null
	login: (username: string, password: string) => boolean
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USERS: Record<string, string> = {
	alexandra: '1234',
	nectarie: '1234',
	ioana: '1234'
}

function isValidUser(username: string): boolean {
	return username in USERS
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const stored = localStorage.getItem(SESSION_KEY)
		if (stored) {
			const parsed = stored.trim().toLowerCase()
			if (isValidUser(parsed)) {
				setUser({ username: parsed })
			} else {
				localStorage.removeItem(SESSION_KEY)
			}
		}
	}, [])

	const login = useCallback((username: string, password: string): boolean => {
		const normalizedUsername = username.toLowerCase().trim()

		if (USERS[normalizedUsername] === password) {
			setUser({ username: normalizedUsername })
			localStorage.setItem(SESSION_KEY, normalizedUsername)
			return true
		}

		return false
	}, [])

	const logout = useCallback(() => {
		setUser(null)
		localStorage.removeItem(SESSION_KEY)
	}, [])

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
