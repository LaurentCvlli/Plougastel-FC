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
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import VimeoManager from '../components/VimeoManager'
import { CreatedUser, ContentItem } from '../types'

export default function AdminDashboard() {
  const { user, createUser, createdUsers, resetAllDemoData } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'vimeo'>('overview')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showEditContent, setShowEditContent] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{type: 'user' | 'content', id: string, name: string} | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadedContent, setUploadedContent] = useState<ContentItem[]>([])
  const [selectedUser, setSelectedUser] = useState<CreatedUser | null>(null)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)

  // User creation form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'player',
    position: '',
    jerseyNumber: '',
    profilePhoto: null as File | null
  })

  // Content upload form state
  const [contentFormData, setContentFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    date: '',
    matchNumber: '',
    assignedTo: 'all',
    url: '',
    size: '',
    isPrivate: false,
    authorizedUsers: ''
  })

  useEffect(() => {
    const savedContent = localStorage.getItem('uploadedContent')
    if (savedContent) {
      setUploadedContent(JSON.parse(savedContent))
    }
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleContentInputChange = (field: string, value: any) => {
    setContentFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    
    let profilePhotoUrl = ''
    if (formData.profilePhoto) {
      profilePhotoUrl = URL.createObjectURL(formData.profilePhoto)
    }

    createUser({
      fullName: formData.fullName,
      username: formData.username,
      password: formData.password,
      role: formData.role as 'player' | 'staff' | 'admin',
      position: formData.role === 'player' ? formData.position : '',
      jerseyNumber: formData.role === 'player' ? formData.jerseyNumber : '',
      profilePhoto: profilePhotoUrl
    })

    // Reset form
    setFormData({
      fullName: '',
      username: '',
      password: '',
      role: 'player',
      position: '',
      jerseyNumber: '',
      profilePhoto: null
    })
    
    setShowCreateUser(false)
  }

  const handleEditUser = (userData: CreatedUser) => {
    setSelectedUser(userData)
    setFormData({
      fullName: userData.fullName,
      username: userData.username,
      password: userData.password,
      role: userData.role,
      position: userData.position || '',
      jerseyNumber: userData.jerseyNumber || '',
      profilePhoto: null
    })
    setShowEditUser(true)
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser) return
    
    // Update user in localStorage without reloading
    const savedUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]')
    const updatedUsers = savedUsers.map((u: any) => 
      u.id === selectedUser.id 
        ? {
            ...u,
            fullName: formData.fullName,
            username: formData.username,
            password: formData.password,
            role: formData.role as 'player' | 'staff' | 'admin',
            position: formData.role === 'player' ? formData.position : '',
            jerseyNumber: formData.role === 'player' ? formData.jerseyNumber : '',
            profilePhoto: formData.profilePhoto ? URL.createObjectURL(formData.profilePhoto) : u.profilePhoto
          }
        : u
    )
    
    localStorage.setItem('createdUsers', JSON.stringify(updatedUsers))
    
    // Update local state to trigger re-render
    window.dispatchEvent(new Event('storage'))
    setShowEditUser(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteTarget({ type: 'user', id: userId, name: userName })
    setShowDeleteConfirm(true)
  }

  const handleDeleteContent = (contentId: string, contentTitle: string) => {
    setDeleteTarget({ type: 'content', id: contentId, name: contentTitle })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'user') {
      try {
        const savedUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]')
        const updatedUsers = savedUsers.filter((u: any) => u.id !== deleteTarget.id)
        localStorage.setItem('createdUsers', JSON.stringify(updatedUsers))
        
        // Force update of createdUsers state
        setCreatedUsers(updatedUsers)
        
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'))
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    } else {
      try {
        const updatedContent = uploadedContent.filter(c => c.id !== deleteTarget.id)
        setUploadedContent(updatedContent)
        localStorage.setItem('uploadedContent', JSON.stringify(updatedContent))
      } catch (error) {
        console.error('Error deleting content:', error)
      }
    }

    setShowDeleteConfirm(false)
    setDeleteTarget(null)
  }

  const handleEditContent = (content: ContentItem) => {
    setSelectedContent(content)
    setContentFormData({
      title: content.title,
      description: content.description || '',
      type: content.type,
      date: content.date,
      matchNumber: content.matchNumber || '',
      assignedTo: content.assignedTo,
      url: content.url || '',
      size: content.size || '',
      isPrivate: content.isPrivate || false,
      authorizedUsers: content.authorizedUsers?.join(',') || ''
    })
    setShowEditContent(true)
  }

  const handleUpdateContent = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedContent = uploadedContent.map(c => 
      c.id === selectedContent?.id
        ? {
            ...c,
            title: contentFormData.title,
            description: contentFormData.description,
            type: contentFormData.type,
            date: contentFormData.date,
            matchNumber: contentFormData.matchNumber,
            assignedTo: contentFormData.assignedTo,
            url: contentFormData.url,
            size: contentFormData.size,
            isPrivate: contentFormData.isPrivate,
            authorizedUsers: contentFormData.authorizedUsers.split(',').filter(u => u.trim())
          }
        : c
    )
    
    setUploadedContent(updatedContent as ContentItem[])
    localStorage.setItem('uploadedContent', JSON.stringify(updatedContent))
    setShowEditContent(false)
    setSelectedContent(null)
  }

  const handleContentUpload = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newContent: ContentItem = {
      id: Date.now().toString(),
      title: contentFormData.title,
      description: contentFormData.description,
      type: contentFormData.type as 'video' | 'document',
      date: contentFormData.date,
      matchNumber: contentFormData.matchNumber,
      assignedTo: contentFormData.assignedTo,
      url: contentFormData.url,
      isExternal: !!contentFormData.url,
      size: contentFormData.size || 'Unknown',
      uploadDate: new Date().toISOString().split('T')[0],
      isPrivate: contentFormData.isPrivate,
      authorizedUsers: contentFormData.authorizedUsers.split(',').filter(u => u.trim())
    }

    const updatedContent = [...uploadedContent, newContent]
    setUploadedContent(updatedContent)
    localStorage.setItem('uploadedContent', JSON.stringify(updatedContent))
    
    // Reset form
    setContentFormData({
      title: '',
      description: '',
      type: 'video',
      date: '',
      matchNumber: '',
      assignedTo: 'all',
      url: '',
      size: '',
      isPrivate: false,
      authorizedUsers: ''
    })
    
    setShowUploadModal(false)
  }

  const filteredUsers = createdUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-club-red to-club-red-light rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-red-100">Manage users, content, and platform settings</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'overview'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-2 inline" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'users'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          <Users className="w-4 h-4 mr-2 inline" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'content'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          <Upload className="w-4 h-4 mr-2 inline" />
          Content
        </button>
        <button
          onClick={() => setActiveTab('vimeo')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'vimeo'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          <Video className="w-4 h-4 mr-2 inline" />
          Vimeo
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    {createdUsers.length} users created
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">
                    {uploadedContent.length} content items uploaded
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="w-full btn-primary text-left"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New User
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full btn-outline text-left"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Content
                </button>
                <button
                  onClick={resetAllDemoData}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-left"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <button
              onClick={() => setShowCreateUser(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <span className="text-sm text-gray-600">
              {filteredUsers.length} of {createdUsers.length} users
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No users found' : 'No users created yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Create your first user to get started'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First User
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div key={user.id} className="card group">
                  <div className="flex items-center space-x-4 mb-4">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-club-red rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.fullName.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'player' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                        {user.role === 'player' && user.jerseyNumber && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-club-red text-white rounded-full">
                            #{user.jerseyNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {user.role === 'player' && (
                    <div className="text-sm text-gray-600 mb-4">
                      <p><strong>Position:</strong> {user.position}</p>
                      <p><strong>Created:</strong> {user.createdAt}</p>
                      <p><strong>Password:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{user.password}</span></p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.fullName)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                        title="Delete user"
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Content
            </button>
          </div>

          {uploadedContent.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content uploaded yet</h3>
              <p className="text-gray-600 mb-4">Upload videos and documents to get started</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload First Content
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedContent.map((content) => (
                <div key={content.id} className="card">
                  <div className="flex items-center space-x-3 mb-4">
                    {content.type === 'video' ? (
                      <Video className="w-8 h-8 text-red-500" />
                    ) : (
                      <FileText className="w-8 h-8 text-blue-500" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{content.title}</h3>
                      <p className="text-sm text-gray-600">{content.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditContent(content)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                        title="Edit content"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content.id, content.title)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                        title="Delete content"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{content.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{content.date}</span>
                    <span>{content.assignedTo === 'all' ? 'All Users' : content.assignedTo}</span>
                  </div>
                  
                  {content.isPrivate && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                      <span className="text-xs text-red-700 font-medium">🔒 Private Content</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'vimeo' && (
        <VimeoManager mode="admin" userRole="admin" userId={user?.id} />
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
              <button
                onClick={() => setShowCreateUser(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  className="input-field"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  className="input-field"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="input-field"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="player">Player</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {formData.role === 'player' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      required
                      className="input-field"
                    >
                      <option value="">Select position</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jersey Number *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={formData.jerseyNumber}
                      onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
                      required
                      className="input-field"
                      placeholder="Enter jersey number"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange('profilePhoto', e.target.files?.[0] || null)}
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditUser(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  className="input-field"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  className="input-field"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="input-field"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="player">Player</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {formData.role === 'player' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      required
                      className="input-field"
                    >
                      <option value="">Select position</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jersey Number *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={formData.jerseyNumber}
                      onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
                      required
                      className="input-field"
                      placeholder="Enter jersey number"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange('profilePhoto', e.target.files?.[0] || null)}
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditUser(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Content Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upload Content</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleContentUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={contentFormData.title}
                  onChange={(e) => handleContentInputChange('title', e.target.value)}
                  required
                  className="input-field"
                  placeholder="Enter content title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={contentFormData.description}
                  onChange={(e) => handleContentInputChange('description', e.target.value)}
                  rows={3}
                  className="input-field resize-vertical"
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type *
                  </label>
                  <select
                    value={contentFormData.type}
                    onChange={(e) => handleContentInputChange('type', e.target.value)}
                    required
                    className="input-field"
                  >
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={contentFormData.date}
                    onChange={(e) => handleContentInputChange('date', e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Drive URL
                </label>
                <input
                  type="url"
                  value={contentFormData.url}
                  onChange={(e) => handleContentInputChange('url', e.target.value)}
                  className="input-field"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Number
                </label>
                <input
                  type="text"
                  value={contentFormData.matchNumber}
                  onChange={(e) => handleContentInputChange('matchNumber', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Match 1, Training Session 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To *
                </label>
                <select
                  value={contentFormData.assignedTo}
                  onChange={(e) => handleContentInputChange('assignedTo', e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="all">All Users</option>
                  <option value="players">All Players</option>
                  <option value="staff">Staff Only</option>
                  {createdUsers.filter(u => u.role === 'player').map(player => (
                    <option key={player.id} value={player.id}>
                      {player.fullName} (Player)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={contentFormData.isPrivate}
                  onChange={(e) => handleContentInputChange('isPrivate', e.target.checked)}
                  className="rounded border-gray-300 text-club-red focus:ring-club-red"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Mark as private content
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Content
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {showEditContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Content</h3>
              <button
                onClick={() => setShowEditContent(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateContent} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={contentFormData.title}
                  onChange={(e) => handleContentInputChange('title', e.target.value)}
                  required
                  className="input-field"
                  placeholder="Enter content title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={contentFormData.description}
                  onChange={(e) => handleContentInputChange('description', e.target.value)}
                  rows={3}
                  className="input-field resize-vertical"
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type *
                  </label>
                  <select
                    value={contentFormData.type}
                    onChange={(e) => handleContentInputChange('type', e.target.value)}
                    required
                    className="input-field"
                  >
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={contentFormData.date}
                    onChange={(e) => handleContentInputChange('date', e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Drive URL
                </label>
                <input
                  type="url"
                  value={contentFormData.url}
                  onChange={(e) => handleContentInputChange('url', e.target.value)}
                  className="input-field"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Number
                </label>
                <input
                  type="text"
                  value={contentFormData.matchNumber}
                  onChange={(e) => handleContentInputChange('matchNumber', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Match 1, Training Session 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To *
                </label>
                <select
                  value={contentFormData.assignedTo}
                  onChange={(e) => handleContentInputChange('assignedTo', e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="all">All Users</option>
                  <option value="players">All Players</option>
                  <option value="staff">Staff Only</option>
                  {createdUsers.filter(u => u.role === 'player').map(player => (
                    <option key={player.id} value={player.id}>
                      {player.fullName} (Player)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={contentFormData.isPrivate}
                  onChange={(e) => handleContentInputChange('isPrivate', e.target.checked)}
                  className="rounded border-gray-300 text-club-red focus:ring-club-red"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Mark as private content
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Update Content
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditContent(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteTarget.name}"? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteTarget(null)
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}