// src/lib/supabaseutilisateurs.ts

export interface UtilisateurDB {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: 'admin' | 'staff' | 'player';
    motdepasse: string;
  }
  
  export const UtilisateurService = {
    getAllUsers: async (): Promise<UtilisateurDB[]> => {
      return [
        {
          id: '1',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean@club.com',
          role: 'staff',
          motdepasse: 'azerty',
        },
        {
          id: '2',
          nom: 'Durand',
          prenom: 'Paul',
          email: 'paul@club.com',
          role: 'player',
          motdepasse: 'azerty',
        },
      ]
    },
  
    getUserById: async (id: string): Promise<UtilisateurDB | null> => {
      const users = await UtilisateurService.getAllUsers()
      return users.find((u) => u.id === id) || null
    },
  
    authenticateUser: async (email: string, password: string): Promise<UtilisateurDB | null> => {
      const users = await UtilisateurService.getAllUsers()
      return users.find((u) => u.email === email && u.motdepasse === password) || null
    },
  }
  