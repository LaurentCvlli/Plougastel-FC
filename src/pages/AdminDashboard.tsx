import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Video, 
  FileText, 
  TrendingUp,
  Settings,
  User,
  X,
  Save,
  AlertTriangle,
  Loader
} from 'lucide-react'
import { UtilisateurService, UtilisateurDB, CreateUtilisateurData, useRealtimeUsers } from '../lib/supabaseClient'

type TabType = 'overview' | 'users' | 'content' | 'vimeo'
type ModalType = 'createUser' | 'editUser' | 'uploadContent' | 'editContent' | 'deleteConfirm' | null

interface DeleteTarget {
  type: 'user' | 'content'
  id: string
  name: string
}

export default function AdminDashboard() {
  // États principaux
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<UtilisateurDB[]>([])
  const [selectedUser, setSelectedUser] = useState<UtilisateurDB | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formulaire utilisateur
  const [userForm, setUserForm] = useState({
    identifiant: '',
    mot_de_passe: '',
    role: 'player',
    Nom: '',
    'Google drive': ''
  })

  // Chargement initial des utilisateurs
  useEffect(() => {
    loadUsers()
  }, [])

  // Écoute des changements en temps réel
  useEffect(() => {
    const unsubscribe = useRealtimeUsers((updatedUsers) => {
      setUsers(updatedUsers)
    })

    return unsubscribe
  }, [])

  // Fonctions de gestion des données
  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const usersData = await UtilisateurService.getAllUsers()
      setUsers(usersData)
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetUserForm = () => {
    setUserForm({
      identifiant: '',
      mot_de_passe: '',
      role: 'player',
      Nom: '',
      'Google drive': ''
    })
  }

  const closeModal = () => {
    setActiveModal(null)
    setSelectedUser(null)
    setDeleteTarget(null)
    setError(null)
    resetUserForm()
  }

  // Gestionnaires d'événements
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userData: CreateUtilisateurData = {
        identifiant: userForm.identifiant,
        mot_de_passe: userForm.mot_de_passe,
        role: userForm.role,
        'Nom': userForm.Nom,
        'Google drive': userForm['Google drive'] || null
      }

      const newUser = await UtilisateurService.createUser(userData)
      
      if (newUser) {
        closeModal()
        // Les utilisateurs seront mis à jour automatiquement via le realtime
      } else {
        setError('Erreur lors de la création de l\'utilisateur')
      }
    } catch (err) {
      setError('Erreur inattendue lors de la création')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (userData: UtilisateurDB) => {
    setSelectedUser(userData)
    setUserForm({
      identifiant: userData.identifiant || '',
      mot_de_passe: userData.mot_de_passe || '',
      role: userData.role || 'player',
      Nom: userData.Nom || '',
      'Google drive': userData['Google drive'] || ''
    })
    setActiveModal('editUser')
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setLoading(true)
    setError(null)

    try {
      const updateData: Partial<CreateUtilisateurData> = {
        identifiant: userForm.identifiant,
        mot_de_passe: userForm.mot_de_passe,
        role: userForm.role,
        'Nom': userForm.Nom,
        'Google drive': userForm['Google drive'] || null
      }

      const updatedUser = await UtilisateurService.updateUser(selectedUser['ID key'], updateData)
      
      if (updatedUser) {
        closeModal()
      } else {
        setError('Erreur lors de la mise à jour de l\'utilisateur')
      }
    } catch (err) {
      setError('Erreur inattendue lors de la mise à jour')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteTarget({ type: 'user', id: userId, name: userName })
    setActiveModal('deleteConfirm')
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setLoading(true)
    setError(null)

    try {
      if (deleteTarget.type === 'user') {
        const success = await UtilisateurService.deleteUser(deleteTarget.id)
        
        if (success) {
          closeModal()
        } else {
          setError('Erreur lors de la suppression de l\'utilisateur')
        }
      }
    } catch (err) {
      setError('Erreur inattendue lors de la suppression')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      loadUsers()
    } else {
      setLoading(true)
      try {
        const searchResults = await UtilisateurService.searchUsers(term)
        setUsers(searchResults)
      } catch (err) {
        setError('Erreur lors de la recherche')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Données filtrées localement (pour une recherche plus fluide)
  const filteredUsers = users.filter(user =>
    (user.Nom?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.identifiant?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  // Composants réutilisables
  const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  )

  const UserFormFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
        <input
          type="text"
          value={userForm.Nom}
          onChange={(e) => setUserForm(prev => ({ ...prev, Nom: e.target.value }))}
          required
          className="input-field"
          placeholder="Entrez le nom complet"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Identifiant *</label>
        <input
          type="text"
          value={userForm.identifiant}
          onChange={(e) => setUserForm(prev => ({ ...prev, identifiant: e.target.value }))}
          required
          className="input-field"
          placeholder="Entrez l'identifiant"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
        <input
          type="password"
          value={userForm.mot_de_passe}
          onChange={(e) => setUserForm(prev => ({ ...prev, mot_de_passe: e.target.value }))}
          required
          className="input-field"
          placeholder="Entrez le mot de passe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
        <select
          value={userForm.role}
          onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
          required
          className="input-field"
        >
          <option value="player">Joueur</option>
          <option value="staff">Staff</option>
          <option value="admin">Administrateur</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive (optionnel)</label>
        <input
          type="url"
          value={userForm['Google drive']}
          onChange={(e) => setUserForm(prev => ({ ...prev, 'Google drive': e.target.value }))}
          className="input-field"
          placeholder="URL du dossier Google Drive"
        />
      </div>
    </>
  )

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <Loader className="w-8 h-8 animate-spin text-club-red" />
      <span className="ml-2 text-gray-600">Chargement...</span>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-club-red to-club-red-light rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-red-100">Gérer les utilisateurs, le contenu et les paramètres</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', icon: TrendingUp, label: 'Vue d\'ensemble' },
          { id: 'users', icon: Users, label: 'Utilisateurs' },
          { id: 'content', icon: Upload, label: 'Contenu' },
          { id: 'vimeo', icon: Video, label: 'Vimeo' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-club-red shadow-md'
                : 'text-gray-600 hover:text-club-red'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2 inline" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble de la plateforme</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">{users.length} utilisateurs enregistrés</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Base de données connectée via Supabase</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button onClick={() => setActiveModal('createUser')} className="w-full btn-primary text-left">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un nouvel utilisateur
                </button>
                <button onClick={() => setActiveModal('uploadContent')} className="w-full btn-outline text-left">
                  <Upload className="w-4 h-4 mr-2" />
                  Télécharger du contenu
                </button>
                <button onClick={loadUsers} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-left">
                  <Search className="w-4 h-4 mr-2" />
                  Actualiser les données
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
            <button onClick={() => setActiveModal('createUser')} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Créer un utilisateur
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des utilisateurs..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <span className="text-sm text-gray-600">
              {filteredUsers.length} sur {users.length} utilisateurs
            </span>
          </div>

          {loading && <LoadingSpinner />}

          {!loading && filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur créé'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Essayez d\'ajuster vos critères de recherche'
                  : 'Créez votre premier utilisateur pour commencer'
                }
              </p>
              {!searchTerm && (
                <button onClick={() => setActiveModal('createUser')} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier utilisateur
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div key={user['ID key']} className="card group">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-club-red rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.Nom?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.Nom || 'Sans nom'}</h3>
                      <p className="text-sm text-gray-600">@{user.identifiant || 'sans-identifiant'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'player' 
                            ? 'bg-green-100 text-green-800' 
                            : user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role || 'Non défini'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>ID:</strong> {user['ID key'].substring(0, 8)}...</p>
                    {user['Google drive'] && (
                      <p><strong>Google Drive:</strong> <span className="text-blue-600">Configuré</span></p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Actif
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                        title="Modifier l'utilisateur"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user['ID key'], user.Nom || 'Sans nom')}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion du contenu</h3>
            <p className="text-gray-600 mb-4">Cette section sera développée prochainement</p>
          </div>
        </div>
      )}

      {activeTab === 'vimeo' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Intégration Vimeo</h3>
            <p className="text-gray-600 mb-4">Cette section sera développée prochainement</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'createUser' && (
        <Modal title="Créer un nouvel utilisateur" onClose={closeModal}>
          <form onSubmit={handleCreateUser} className="space-y-6">
            <UserFormFields />
            <div className="flex space-x-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Créer l'utilisateur
              </button>
              <button type="button" onClick={closeModal} className="btn-outline flex-1">
                Annuler
              </button>
            </div>
          </form>
        </Modal>
      )}

      {activeModal === 'editUser' && (
        <Modal title="Modifier l'utilisateur" onClose={closeModal}>
          <form onSubmit={handleUpdateUser} className="space-y-6">
            <UserFormFields />
            <div className="flex space-x-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Mettre à jour
              </button>
              <button type="button" onClick={closeModal} className="btn-outline flex-1">
                Annuler
              </button>
            </div>
          </form>
        </Modal>
      )}

      {activeModal === 'deleteConfirm' && deleteTarget && (
        <Modal title="Confirmer la suppression" onClose={closeModal}>
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer "{deleteTarget.name}" ? Cette action ne peut pas être annulée.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={confirmDelete} 
              disabled={loading}
              className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
            >
              {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Supprimer
            </button>
            <button onClick={closeModal} className="btn-outline flex-1">
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}