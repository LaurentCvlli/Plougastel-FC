import React, { createContext, useContext, useState, useEffect } from 'react'
import { UtilisateurService, UtilisateurDB } from '../lib/supabaseClient'

interface AuthContextType {
  user: UtilisateurDB | null
  loading: boolean
  error: string | null
  login: (identifiant: string, motDePasse: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UtilisateurDB | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Vérification de la session au chargement
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const savedUserId = localStorage.getItem('userId')
      if (savedUserId) {
        const userData = await UtilisateurService.getUserById(savedUserId)
        if (userData) {
          setUser(userData)
        } else {
          // L'utilisateur n'existe plus, nettoyer le localStorage
          localStorage.removeItem('userId')
        }
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'authentification:', err)
      localStorage.removeItem('userId')
    } finally {
      setLoading(false)
    }
  }

  const login = async (identifiant: string, motDePasse: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const userData = await UtilisateurService.authenticateUser(identifiant, motDePasse)
      
      if (userData) {
        setUser(userData)
        localStorage.setItem('userId', userData['ID key'])
        return true
      } else {
        setError('Identifiant ou mot de passe incorrect')
        return false
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err)
      setError('Erreur lors de la connexion')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
    localStorage.removeItem('userId')
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
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

