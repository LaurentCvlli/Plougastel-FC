import React from 'react'
import { Play, ExternalLink, Download } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  title: string
  isExternal?: boolean
  thumbnail?: string
  onDownload?: () => void
  className?: string
}

export default function VideoPlayer({ 
  url, 
  title, 
  isExternal = false, 
  thumbnail,
  onDownload,
  className = ""
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [showPlayer, setShowPlayer] = React.useState(false)

  const handlePlay = () => {
    if (isExternal && url.includes('drive.google.com')) {
      // Enhanced Google Drive URL handling for direct playback
      let fileId = ''
      
      if (url.includes('/file/d/')) {
        fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ''
      } else if (url.includes('id=')) {
        fileId = url.match(/id=([a-zA-Z0-9-_]+)/)?.[1] || ''
      } else if (url.includes('/open?id=')) {
        fileId = url.match(/\/open\?id=([a-zA-Z0-9-_]+)/)?.[1] || ''
      } else if (url.includes('/d/')) {
        fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || ''
      }
      
      if (fileId) {
        const viewUrl = `https://drive.google.com/file/d/${fileId}/view`
        window.open(viewUrl, '_blank')
      } else {
        window.open(url, '_blank')
      }
    } else {
      setShowPlayer(true)
      setIsPlaying(true)
    }
  }

  if (showPlayer && !isExternal) {
    return (
      <div className="relative">
        <video
          src={url}
          controls
          autoPlay={isPlaying}
          className="w-full h-auto min-h-[300px] rounded-lg"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <button
          onClick={() => setShowPlayer(false)}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <div className={`relative group cursor-pointer ${className}`}>
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Play className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div 
            onClick={handlePlay}
            className="bg-white bg-opacity-90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-200 hover:bg-opacity-100"
          >
            <Play className="w-8 h-8 text-club-red" />
          </div>
        </div>

        {/* External Link Indicator */}
        {isExternal && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
            <ExternalLink className="w-3 h-3 mr-1" />
            External
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="mt-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-club-red transition-colors">
          {title}
        </h3>
        {isExternal && (
          <p className="text-sm text-blue-600 mt-1">Google Drive Video</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-3">
        <button 
          onClick={handlePlay}
          className="btn-primary flex-1 py-2 text-sm"
        >
          <Play className="w-4 h-4 mr-1" />
          {isExternal ? 'Open' : 'Play'}
        </button>
        {onDownload && (
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDownload()
            }}
            className="btn-outline py-2 px-3 text-sm"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}