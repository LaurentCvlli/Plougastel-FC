import React, { useState } from 'react'
import { Upload, Link, X, File, Video, Image } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File | null, url?: string) => void
  acceptedTypes: string
  maxSize?: number // Size in MB
  label: string
  allowUrl?: boolean
  urlLabel?: string
  isVideo?: boolean
}

export default function FileUpload({ 
  onFileSelect, 
  acceptedTypes, 
  maxSize = 5120, // Default 5GB for videos
  label, 
  allowUrl = false,
  urlLabel = "Google Drive URL",
  isVideo = false
}: FileUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState('')

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const maxSizeDisplay = maxSize >= 1024 ? `${(maxSize / 1024).toFixed(1)}GB` : `${maxSize}MB`
      alert(`File size must be less than ${maxSizeDisplay}`)
      return
    }
    
    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onFileSelect(null, urlInput.trim())
      setSelectedFile(null)
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'].includes(extension || '')) {
      return <Video className="w-6 h-6 text-blue-500" />
    }
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="w-6 h-6 text-green-500" />
    }
    return <File className="w-6 h-6 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    } else {
      return `${(bytes / 1024).toFixed(2)} KB`
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {allowUrl && (
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setUploadMethod('file')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              uploadMethod === 'file'
                ? 'bg-white text-club-red shadow-sm'
                : 'text-gray-600 hover:text-club-red'
            }`}
          >
            <Upload className="w-4 h-4 mr-2 inline" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod('url')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              uploadMethod === 'url'
                ? 'bg-white text-club-red shadow-sm'
                : 'text-gray-600 hover:text-club-red'
            }`}
          >
            <Link className="w-4 h-4 mr-2 inline" />
            Add Link
          </button>
        </div>
      )}

      {uploadMethod === 'file' ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive 
              ? 'border-club-red bg-red-50' 
              : 'border-gray-300 hover:border-club-red'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {selectedFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                {getFileIcon(selectedFile.name)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                  onFileSelect(null)
                }}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {acceptedTypes} up to {maxSize >= 1024 ? `${(maxSize / 1024).toFixed(1)}GB` : `${maxSize}MB`}
              </p>
              {isVideo && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 For files over 5GB, use the Google Drive link option
                </p>
              )}
            </>
          )}
          
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept={acceptedTypes}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0])
              }
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="url"
            placeholder={`Enter ${urlLabel.toLowerCase()}...`}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="input-field"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Link className="w-4 h-4 mr-2" />
            Add {urlLabel}
          </button>
        </div>
      )}
    </div>
  )
}