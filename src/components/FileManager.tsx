import React, { useState, useEffect } from 'react'
import { 
  Folder, 
  File, 
  Video, 
  FileText, 
  Edit, 
  Trash2, 
  Search, 
  AlertTriangle,
  Check,
  X
} from 'lucide-react'
import { DriveFile as FileItem } from '../types'

interface FileManagerProps {
  onFileSelect?: (file: FileItem) => void
}

export default function FileManager({ onFileSelect }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [currentPath, setCurrentPath] = useState<string[]>(['Root'])
  const [searchTerm, setSearchTerm] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'move' | 'rename'
    fileId: string
    fileName: string
    callback: () => void
  } | null>(null)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [renameFileId, setRenameFileId] = useState('')
  const [newFileName, setNewFileName] = useState('')

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = () => {
    // Load files from various sources
    const uploadedContent = JSON.parse(localStorage.getItem('uploadedContent') || '[]')
    const googleDriveFiles = JSON.parse(localStorage.getItem('googleDriveFiles') || '[]')
    const vimeoVideos = JSON.parse(localStorage.getItem('vimeoVideos') || '[]')

    let allFiles: FileItem[] = []

    // No default folders - completely clean start

    // Add uploaded content
    uploadedContent.forEach((item: any) => {
      allFiles.push({
        id: `upload-${item.id}`,
        name: item.title,
        type: item.type === 'video' ? 'video' : 'document',
        size: item.size || 'Unknown',
        modifiedTime: item.uploadDate,
        owner: 'Admin',
        path: ['Root'],
        parentId: undefined,
        url: item.url,
        isExternal: item.isExternal,
        assignedTo: [item.assignedTo],
        description: item.description
      })
    })

    // Add Google Drive files
    googleDriveFiles.forEach((item: any) => {
      if (item.type !== 'folder') {
        allFiles.push({
          id: `gdrive-${item.id}`,
          name: item.name,
          type: item.type,
          size: item.size || 'Unknown',
          modifiedTime: item.modifiedTime,
          owner: item.owner,
          path: ['Root'],
          parentId: undefined,
          url: item.url,
          isExternal: true,
          thumbnailUrl: item.thumbnailUrl
        })
      }
    })

    // Add Vimeo videos
    vimeoVideos.forEach((item: any) => {
      allFiles.push({
        id: `vimeo-${item.id}`,
        name: item.title,
        type: 'video',
        size: item.size || 'Unknown',
        modifiedTime: item.uploadDate,
        owner: item.owner,
        path: ['Root'],
        parentId: undefined,
        url: item.embedUrl,
        isExternal: true,
        thumbnailUrl: item.thumbnailUrl,
        assignedTo: item.assignedTo,
        description: item.description
      })
    })

    setFiles(allFiles)
  }

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

  const getFileIcon = (file: FileItem) => {
    switch (file.type) {
      case 'folder': return <Folder className="w-5 h-5 text-blue-500" />
      case 'video': return <Video className="w-5 h-5 text-red-500" />
      case 'document': return <FileText className="w-5 h-5 text-green-500" />
      default: return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const handleDelete = (fileId: string, fileName: string) => {
    setConfirmAction({
      type: 'delete',
      fileId,
      fileName,
      callback: () => confirmDelete(fileId)
    })
    setShowConfirmDialog(true)
  }

  const confirmDelete = (fileId: string) => {
    // Remove from files state
    setFiles(prev => prev.filter(f => f.id !== fileId))
    
    // Remove from localStorage based on file type
    if (fileId.startsWith('upload-')) {
      const uploadId = fileId.replace('upload-', '')
      const uploadedContent = JSON.parse(localStorage.getItem('uploadedContent') || '[]')
      const filtered = uploadedContent.filter((item: any) => item.id.toString() !== uploadId)
      localStorage.setItem('uploadedContent', JSON.stringify(filtered))
    } else if (fileId.startsWith('gdrive-')) {
      const driveId = fileId.replace('gdrive-', '')
      const googleDriveFiles = JSON.parse(localStorage.getItem('googleDriveFiles') || '[]')
      const filtered = googleDriveFiles.filter((item: any) => item.id !== driveId)
      localStorage.setItem('googleDriveFiles', JSON.stringify(filtered))
    } else if (fileId.startsWith('vimeo-')) {
      const vimeoId = fileId.replace('vimeo-', '')
      const vimeoVideos = JSON.parse(localStorage.getItem('vimeoVideos') || '[]')
      const filtered = vimeoVideos.filter((item: any) => item.id !== vimeoId)
      localStorage.setItem('vimeoVideos', JSON.stringify(filtered))
    }
    
    setShowConfirmDialog(false)
    setConfirmAction(null)
  }

  const handleRename = (fileId: string, currentName: string) => {
    setRenameFileId(fileId)
    setNewFileName(currentName)
    setShowRenameDialog(true)
  }

  const confirmRename = () => {
    if (!newFileName.trim()) return

    // Update files state
    setFiles(prev => prev.map(f => 
      f.id === renameFileId ? { ...f, name: newFileName.trim() } : f
    ))

    // Update localStorage based on file type
    if (renameFileId.startsWith('upload-')) {
      const uploadId = renameFileId.replace('upload-', '')
      const uploadedContent = JSON.parse(localStorage.getItem('uploadedContent') || '[]')
      const updated = uploadedContent.map((item: any) => 
        item.id.toString() === uploadId ? { ...item, title: newFileName.trim() } : item
      )
      localStorage.setItem('uploadedContent', JSON.stringify(updated))
    } else if (renameFileId.startsWith('vimeo-')) {
      const vimeoId = renameFileId.replace('vimeo-', '')
      const vimeoVideos = JSON.parse(localStorage.getItem('vimeoVideos') || '[]')
      const updated = vimeoVideos.map((item: any) => 
        item.id === vimeoId ? { ...item, title: newFileName.trim() } : item
      )
      localStorage.setItem('vimeoVideos', JSON.stringify(updated))
    }

    setShowRenameDialog(false)
    setRenameFileId('')
    setNewFileName('')
  }

  const ConfirmDialog = () => {
    if (!confirmAction) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm {confirmAction.type === 'delete' ? 'Deletion' : 'Action'}
            </h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to {confirmAction.type} "{confirmAction.fileName}"?
            {confirmAction.type === 'delete' && (
              <span className="block mt-2 text-red-600 font-medium">
                This action cannot be undone.
              </span>
            )}
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                confirmAction.callback()
                setShowConfirmDialog(false)
                setConfirmAction(null)
              }}
              className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm
            </button>
            <button
              onClick={() => {
                setShowConfirmDialog(false)
                setConfirmAction(null)
              }}
              className="btn-outline flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  const RenameDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename File</h3>
        
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          className="input-field mb-4"
          placeholder="Enter new name..."
          onKeyPress={(e) => e.key === 'Enter' && confirmRename()}
        />
        
        <div className="flex space-x-3">
          <button onClick={confirmRename} className="btn-primary flex-1">
            <Check className="w-4 h-4 mr-2" />
            Rename
          </button>
          <button 
            onClick={() => setShowRenameDialog(false)} 
            className="btn-outline flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  const currentFiles = getCurrentFolderFiles()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <File className="w-6 h-6 text-club-red" />
          <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        {currentPath.map((path, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
              className="hover:text-club-red"
            >
              {path}
            </button>
            {index < currentPath.length - 1 && <span>/</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Back Button */}
      {currentPath.length > 1 && (
        <button
          onClick={navigateUp}
          className="flex items-center space-x-2 text-club-red hover:text-club-red-dark"
        >
          <Folder className="w-4 h-4" />
          <span>.. Back</span>
        </button>
      )}

      {/* File List */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {currentFiles.map((file) => (
          <div
            key={file.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => {
              if (file.type === 'folder') {
                navigateToFolder(file.id)
              } else if (onFileSelect) {
                onFileSelect(file)
              }
            }}
          >
            <div className="flex flex-col items-center text-center">
              {getFileIcon(file)}
              <span className="text-sm font-medium mt-2 truncate w-full" title={file.name}>
                {file.name}
              </span>
              {file.size && (
                <span className="text-xs text-gray-500 mt-1">{file.size}</span>
              )}
              
              {file.type !== 'folder' && (
                <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRename(file.id, file.name)
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Rename"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(file.id, file.name)
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentFiles.length === 0 && (
        <div className="text-center py-12">
          <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No files found' : 'This folder is empty'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Upload files to get started'
            }
          </p>
        </div>
      )}

      {/* Dialogs */}
      {showConfirmDialog && <ConfirmDialog />}
      {showRenameDialog && <RenameDialog />}
    </div>
  )
}