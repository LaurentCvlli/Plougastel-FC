import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { CreatedUser } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  createUser: (userData: Partial<CreatedUser>) => void
  createdUsers: CreatedUser[]
  resetAllDemoData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([])

  useEffect(() => {
    const savedUsers = localStorage.getItem('createdUsers')
    if (savedUsers) {
      setCreatedUsers(JSON.parse(savedUsers))
    }
    setLoading(false)

    const handleStorageChange = () => {
      const savedUsers = localStorage.getItem('createdUsers')
      if (savedUsers) {
        setCreatedUsers(JSON.parse(savedUsers))
      }
    }

    const handleCustomUpdate = () => {
      const savedUsers = localStorage.getItem('createdUsers')
      if (savedUsers) {
        setCreatedUsers(JSON.parse(savedUsers))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userDataUpdated', handleCustomUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userDataUpdated', handleCustomUpdate)
    }
  }, [])

  const signIn = async (username: string, password: string) => {
    if (username === 'LPasquier49' && password === 'PFCR1Admin') {
      const adminUser = {
        id: 'admin-1',
        aud: 'authenticated',
        email: 'demo@plougastel-fc.com',
        phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        app_metadata: {
          provider: 'custom',
          providers: ['custom']
        },
        user_metadata: {
          role: 'admin',
          full_name: 'Demo Admin',
          username: 'LPasquier49'
        },
        identities: []
      }
      setUser(adminUser as User)
      return
    }

    const foundUser = createdUsers.find(u => u.username === username && u.password === password)
    if (foundUser) {
      const userObj = {
        id: foundUser.id,
        aud: 'authenticated',
        email: `${foundUser.username}@plougastel-fc.com`,
        phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        app_metadata: {
          provider: 'custom',
          providers: ['custom']
        },
        user_metadata: {
          role: foundUser.role,
          full_name: foundUser.fullName,
          username: foundUser.username,
          position: foundUser.position,
          number: foundUser.jerseyNumber
        },
        identities: []
      }
      setUser(userObj as User)
      return
    }

    throw new Error('Invalid username or password')
  }

  const signOut = async () => {
    setUser(null)
  }

  const createUser = (userData: Partial<CreatedUser>) => {
    const newUser: CreatedUser = {
      id: `user-${Date.now()}`,
      fullName: userData.fullName || '',
      username: userData.username || '',
      password: userData.password || '',
      role: userData.role || 'player',
      position: userData.position,
      jerseyNumber: userData.jerseyNumber,
      profilePhoto: userData.profilePhoto,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    }

    const updatedUsers = [...createdUsers, newUser]
    setCreatedUsers(updatedUsers)

    localStorage.setItem('createdUsers', JSON.stringify(updatedUsers))
  }

  const resetAllDemoData = () => {
    setCreatedUsers([])
    localStorage.removeItem('createdUsers')
    localStorage.removeItem('uploadedContent')
    localStorage.removeItem('googleDriveFiles')
    localStorage.removeItem('vimeoVideos')
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    createUser,
    createdUsers,
    resetAllDemoData
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

