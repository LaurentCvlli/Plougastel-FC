import React, { useState, useEffect } from 'react'
import { 
  Folder, 
  FolderPlus, 
  Upload, 
  Video, 
  FileText, 
  Search,
  Grid,
  List,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { DriveFile } from '../types'

interface GoogleDriveManagerProps {
  onFileSelect?: (file: DriveFile) => void
  mode?: 'admin' | 'user'
}

export default function GoogleDriveManager({ onFileSelect, mode = 'admin' }: GoogleDriveManagerProps) {
  const { user } = useAuth()
  const [currentPath, setCurrentPath] = useState<string[]>(['Plougastel FC'])
  const [files, setFiles] = useState<DriveFile[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  useEffect(() => {
    const savedFiles = localStorage.getItem('googleDriveFiles')
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles))
    }
  }, [])

  const getCurrentFolderFiles = () => {
    const currentFolderId = getCurrentFolderId()
    return files.filter(file => {
      if (currentPath.length === 1) {
        // Root level
        return !file.parentId
      } else {
        return file.parentId === currentFolderId
      }
    }).filter(file => {
      if (searchTerm) {
        return file.name.toLowerCase().includes(searchTerm.toLowerCase())
      }
      return true
    })
  }

  const getCurrentFolderId = () => {
    if (currentPath.length === 1) return null
    const pathString = currentPath.slice(1).join('/')
    const folder = files.find(f => f.path.slice(1).join('/') === pathString)
    return folder?.id || null
  }

  const navigateToFolder = (folderId: string) => {
    const folder = files.find(f => f.id === folderId)
    if (folder) {
      setCurrentPath([...folder.path, folder.name])
    }
  }

  const navigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1))
    }
  }

  const createFolder = () => {
    if (!newFolderName.trim()) return

    const newFolder: DriveFile = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      type: 'folder',
      size: '',
      modifiedTime: new Date().toISOString(),
      owner: user?.user_metadata?.full_name || 'Admin',
      shared: false,
      starred: false,
      path: currentPath,
      parentId: getCurrentFolderId() || undefined,
      permissions: {
        canView: ['admin', 'staff'],
        canEdit: ['admin'],
        canDownload: ['admin', 'staff']
      }
    }

    const updatedFiles = [...files, newFolder]
    setFiles(updatedFiles)
    localStorage.setItem('googleDriveFiles', JSON.stringify(updatedFiles))
    setNewFolderName('')
    setShowCreateFolder(false)
  }

  const uploadFile = (fileData: any) => {
    const newFile: DriveFile = {
      id: `file-${Date.now()}`,
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
      modifiedTime: new Date().toISOString(),
      owner: user?.user_metadata?.full_name || 'Admin',
      shared: fileData.shared || false,
      starred: false,
      path: currentPath,
      parentId: getCurrentFolderId() || undefined,
      url: fileData.url,
      thumbnailUrl: fileData.thumbnailUrl,
      permissions: {
        canView: fileData.permissions?.canView || ['all'],
        canEdit: fileData.permissions?.canEdit || ['admin'],
        canDownload: fileData.permissions?.canDownload || ['all']
      }
    }

    const updatedFiles = [...files, newFile]
    setFiles(updatedFiles)
    localStorage.setItem('googleDriveFiles', JSON.stringify(updatedFiles))
    setShowUploadModal(false)
  }

  const getFileIcon = (file: DriveFile) => {
    if (file.type === 'folder') return <Folder className="w-6 h-6 text-blue-500" />
    if (file.type === 'video') return <Video className="w-6 h-6 text-red-500" />
    return <FileText className="w-6 h-6 text-green-500" />
  }

  const canUserAccess = (file: DriveFile, action: 'view' | 'edit' | 'download') => {
    const userRole = user?.user_metadata?.role
    const userId = user?.id
    const permissions = file.permissions?.[action === 'view' ? 'canView' : action === 'edit' ? 'canEdit' : 'canDownload'] || []
    
    return userRole === 'admin' || // Admin can access everything
           userRole === 'staff' || // Staff can access everything for viewing
           permissions.includes('all') || 
           permissions.includes(userRole) || 
           (userId && permissions.includes(userId))
  }

  const currentFiles = getCurrentFolderFiles().filter(file => 
    canUserAccess(file, 'view')
  )

  const CreateFolderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
        <input
          type="text"
          placeholder="Folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="input-field mb-4"
          onKeyPress={(e) => e.key === 'Enter' && createFolder()}
        />
        <div className="flex space-x-3">
          <button onClick={createFolder} className="btn-primary flex-1">
            Create
          </button>
          <button 
            onClick={() => setShowCreateFolder(false)} 
            className="btn-outline flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Upload to Google Drive</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">File Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter file name" 
              autoComplete="off"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">File Type</label>
            <select className="input-field">
              <option value="video">Video</option>
              <option value="document">Document</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Google Drive URL</label>
            <input 
              type="url" 
              className="input-field" 
              placeholder="https://drive.google.com/..." 
              autoComplete="off"
            />
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="shared" className="mr-2" />
            <label htmlFor="shared" className="text-sm">Share with all users</label>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button 
            onClick={() => {
              // Simulate upload
              uploadFile({
                name: 'Sample File',
                type: 'video',
                size: '125 MB',
                shared: true,
                url: 'https://drive.google.com/sample'
              })
            }} 
            className="btn-primary flex-1"
          >
            Upload
          </button>
          <button 
            onClick={() => setShowUploadModal(false)} 
            className="btn-outline flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">GD</span>
            </div>
            <h2 className="text-xl font-semibold">Google Drive Integration</h2>
          </div>
          
          {mode === 'admin' && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowCreateFolder(true)}
                className="btn-outline py-2 px-3 text-sm"
              >
                <FolderPlus className="w-4 h-4 mr-1" />
                New Folder
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="btn-primary py-2 px-3 text-sm"
              >
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </button>
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          {currentPath.map((path, index) => (
            <React.Fragment key={index}>
              <button
                onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                className="hover:text-blue-600"
              >
                {path}
              </button>
              {index < currentPath.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 py-2 text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="p-4">
        {currentPath.length > 1 && (
          <button
            onClick={navigateUp}
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded mb-4"
          >
            <Folder className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">.. (Go up)</span>
          </button>
        )}

        {currentFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No files or folders found</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
            {currentFiles.map((file) => (
              <div
                key={file.id}
                className={`${
                  viewMode === 'grid' 
                    ? 'p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer' 
                    : 'flex items-center space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer'
                }`}
                onClick={() => {
                  if (file.type === 'folder') {
                    navigateToFolder(file.id)
                  } else if (onFileSelect) {
                    onFileSelect(file)
                  }
                }}
              >
                <div className={viewMode === 'grid' ? 'text-center' : 'flex items-center space-x-3 flex-1'}>
                  <div className={viewMode === 'grid' ? 'mb-3' : ''}>
                    {getFileIcon(file)}
                  </div>
                  <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                    <h3 className={`font-medium ${viewMode === 'grid' ? 'mb-2' : ''}`}>
                      {file.name}
                    </h3>
                    {viewMode === 'grid' && (
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>{file.size}</p>
                        <p>Modified: {new Date(file.modifiedTime).toLocaleDateString()}</p>
                        <p>Owner: {file.owner}</p>
                      </div>
                    )}
                    {viewMode === 'list' && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{file.size}</span>
                        <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                        <span>{file.owner}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateFolder && <CreateFolderModal />}
      {showUploadModal && <UploadModal />}
    </div>
  )
}