'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type User = {
	username: string
}

type AuthContextType = {
	user: User | null
	login: (username: string, password: string) => boolean
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USERS = {
	alexandra: '1234',
	nectarie: '1234'
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)

	const login = (username: string, password: string): boolean => {
		const normalizedUsername = username.toLowerCase().trim()
		
		if (USERS[normalizedUsername as keyof typeof USERS] === password) {
			setUser({ username: normalizedUsername })
			return true
		}
		
		return false
	}

	const logout = () => {
		setUser(null)
	}

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
