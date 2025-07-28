import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fybggdbfahgnqcnsyhku.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YmdnZGJmYWhnbnFjbnN5aGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTIzNzksImV4cCI6MjA2OTEyODM3OX0.LK1-PKKz5Cr0xzzY6_f0DNXAnUrrMO_6ZsnRMIBn8DI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour correspondre à votre structure de base de données
export interface UtilisateurDB {
  'ID key': string
  identifiant: string | null
  mot_de_passe: string | null
  role: string | null
  'Nom': string | null
  'Google drive': string | null
}

// Type pour les données d'entrée (sans l'ID qui est généré automatiquement)
export interface CreateUtilisateurData {
  identifiant: string
  mot_de_passe: string
  role: string
  'Nom': string
  'Google drive'?: string
}

// Services pour les opérations CRUD
export class UtilisateurService {
  // Créer un nouvel utilisateur
  static async createUser(userData: CreateUtilisateurData): Promise<UtilisateurDB | null> {
    try {
      const { data, error } = await supabase
        .from('Utilisateurs')
        .insert([userData])
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erreur inattendue:', error)
      return null
    }
  }

  // Récupérer tous les utilisateurs
  static async getAllUsers(): Promise<UtilisateurDB[]> {
    try {
      const { data, error } = await supabase
        .from('Utilisateurs')
        .select('*')
        .order('Nom', { ascending: true })

      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erreur inattendue:', error)
      return []
    }
  }

  // Récupérer un utilisateur par ID
  static async getUserById(id: string): Promise<UtilisateurDB | null> {
    try {
      const { data, error } = await supabase
        .from('Utilisateurs')
        .select('*')
        .eq('ID key', id)
        .single()

      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erreur inattendue:', error)
      return null
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(id: string, userData: Partial<CreateUtilisateurData>): Promise<UtilisateurDB | null> {
    try {
      const { data, error } = await supabase
        .from('Utilisateurs')
        .update(userData)
        .eq('ID key', id)
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erreur inattendue:', error)
      return null
    }
  }

  // Supprimer un utilisateur
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Utilisateurs')
        .delete()
        .eq('ID key', id)

      if (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erreur inattendue:', error)
      return false
    }
  }

  // Authentifier un utilisateur
  static async authenticateUser(identifiant: string, motDePasse: string): Promise<UtilisateurDB | null> {
    try {
      const { data, error } = await supabase
        .from('Utilisateurs')
        .select('*')
        .eq('identifiant', identifiant)
        .eq('mot_de_passe', motDePasse)
        .single()

      if (error) {
        console.error('Erreur lors de l\'authentification:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erreur inattendue:', error)
      return null
    }
  }

  // Rechercher des utilisateurs
  static async searchUsers(searchTerm: string): Promise<UtilisateurDB[]> {
    try {
      const { data, error } = await supabase
        .from('Utilisateurs')
        .select('*')
        .or(`Nom.ilike.%${searchTerm}%,identifiant.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`)
        .order('Nom', { ascending: true })

      if (error) {
        console.error('Erreur lors de la recherche:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erreur inattendue:', error)
      return []
    }
  }
}

// Hook personnalisé pour les mises à jour en temps réel
export const useRealtimeUsers = (callback: (users: UtilisateurDB[]) => void) => {
  const subscription = supabase
    .channel('utilisateurs_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'Utilisateurs' 
      }, 
      async () => {
        // Recharger tous les utilisateurs quand il y a un changement
        const users = await UtilisateurService.getAllUsers()
        callback(users)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(subscription)
  }
}