import { useState, useEffect } from 'react'
import { HardDrive, Folder, Video, FileText, Download, ExternalLink, Plus, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { DriveFile } from '../types'

export default function GoogleDrivePage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<DriveFile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadGoogleDriveFiles()
  }, [])

  const loadGoogleDriveFiles = () => {
    const savedFiles = localStorage.getItem('googleDriveFiles')
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles))
    }
  }

  const addGoogleDriveFile = (fileData: any) => {
    const newFile: DriveFile = {
      id: `gdrive-${Date.now()}`,
      name: fileData.name,
      type: fileData.type,
      size: fileData.size || 'Unknown',
      modifiedTime: new Date().toISOString(),
      owner: user?.user_metadata?.full_name || 'Admin',
      url: fileData.url,
      thumbnailUrl: fileData.thumbnailUrl,
      path: ['Root'],
      shared: false,
      starred: false
    }

    const updatedFiles = [...files, newFile]
    setFiles(updatedFiles)
    localStorage.setItem('googleDriveFiles', JSON.stringify(updatedFiles))
    setShowAddModal(false)
  }

  const handleDownload = (file: DriveFile) => {
    // Prevent event propagation
    
    if (file.url?.includes('drive.google.com')) {
      // Enhanced Google Drive URL handling for reliable downloads
      let fileId = ''
      
      if (file.url?.includes('/file/d/')) {
        fileId = file.url?.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ''
      } else if (file.url?.includes('id=')) {
        fileId = file.url?.match(/id=([a-zA-Z0-9-_]+)/)?.[1] || ''
      } else if (file.url?.includes('/open?id=')) {
        fileId = file.url?.match(/\/open\?id=([a-zA-Z0-9-_]+)/)?.[1] || ''
      } else if (file.url?.includes('/d/')) {
        fileId = file.url?.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ''
      }
      
      if (fileId) {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`
        // Force download by creating a temporary link
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = file.name
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        window.open(file.url || '', '_blank')
      }
    } else {
      window.open(file.url || '', '_blank')
    }
  }

  const handleView = (file: DriveFile) => {
    // Prevent event propagation
    
    if (file.url?.includes('drive.google.com')) {
      // Enhanced Google Drive URL handling for direct viewing
      let fileId = ''
      
      if (file.url?.includes('/file/d/')) {
        fileId = file.url?.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ''
      } else if (file.url?.includes('id=')) {
        fileId = file.url?.match(/id=([a-zA-Z0-9-_]+)/)?.[1] || ''
      } else if (file.url?.includes('/open?id=')) {
        fileId = file.url?.match(/\/open\?id=([a-zA-Z0-9-_]+)/)?.[1] || ''
      } else if (file.url?.includes('/d/')) {
        fileId = file.url?.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ''
      }
      
      if (fileId) {
        const viewUrl = `https://drive.google.com/file/d/${fileId}/view`
        window.open(viewUrl, '_blank')
      } else {
        window.open(file.url || '', '_blank')
      }
    } else {
      window.open(file.url || '', '_blank')
    }
  }

  const getFileIcon = (file: DriveFile) => {
    if (file.type === 'folder') return <Folder className="w-6 h-6 text-blue-500" />
    if (file.type === 'video') return <Video className="w-6 h-6 text-red-500" />
    return <FileText className="w-6 h-6 text-green-500" />
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const AddFileModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Add Google Drive File</h3>
          <button
            onClick={() => setShowAddModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          addGoogleDriveFile({
            name: formData.get('name'),
            type: formData.get('type'),
            size: formData.get('size'),
            url: formData.get('url'),
            thumbnailUrl: formData.get('thumbnailUrl')
          })
        }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Name
            </label>
            <input
              name="name"
              type="text"
              className="input-field"
              placeholder="Enter file name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Type
              </label>
              <select name="type" className="input-field" required>
                <option value="">Select type</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="folder">Folder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Size
              </label>
              <input
                name="size"
                type="text"
                className="input-field"
                placeholder="e.g., 125 MB"
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Drive URL
            </label>
            <input
              name="url"
              type="url"
              className="input-field"
              placeholder="https://drive.google.com/file/d/..."
              autoComplete="off"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Make sure the file is set to "Anyone with the link can view" for proper access
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL (Optional)
            </label>
            <input
              name="thumbnailUrl"
              type="url"
              className="input-field"
              placeholder="https://drive.google.com/thumbnail?id=..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add File
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Google Drive Integration</h1>
            <p className="text-blue-100">Manage and access all your Google Drive files</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <HardDrive className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Google Drive files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Drive File
          </button>
          <span className="text-sm text-gray-600">
            {filteredFiles.length} files
          </span>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-2">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              {getFileIcon(file)}
              <div>
                <h3 className="font-medium text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-500">{file.size} • {file.owner}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleView(file)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="View"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownload(file)}
                className="p-2 hover:bg-gray-100 rounded-lg text-club-red"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <HardDrive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No files found' : 'No Google Drive files yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Add Google Drive files to access them directly from the platform'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Drive File
            </button>
          )}
        </div>
      )}

      {/* Add File Modal */}
      {showAddModal && <AddFileModal />}
    </div>
  )
}