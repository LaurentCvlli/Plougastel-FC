import React, { createContext, useContext, useState, useEffect } from 'react'
import { UtilisateurService, UtilisateurDB } from '../lib/supabaseutilisateurs'

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



