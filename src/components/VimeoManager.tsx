import { useState, useEffect } from 'react'
import { 
  Video, 
  Play, 
  Download, 
  Eye, 
  Search,
  Shield,
  Plus,
  Upload
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { VimeoVideo } from '../types'

interface VimeoManagerProps {
  mode?: 'admin' | 'user'
  userRole?: string
  userId?: string
}

export default function VimeoManager({ mode = 'user', userRole = 'player', userId }: VimeoManagerProps) {
  const { user } = useAuth()
  const [videos, setVideos] = useState<VimeoVideo[]>([])
  const [activeMonth, setActiveMonth] = useState('july-2025')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VimeoVideo | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

  const months = [
    { key: 'july-2025', name: 'July 2025', fullName: 'July 2025' },
    { key: 'august-2025', name: 'August 2025', fullName: 'August 2025' },
    { key: 'september-2025', name: 'September 2025', fullName: 'September 2025' },
    { key: 'october-2025', name: 'October 2025', fullName: 'October 2025' },
    { key: 'november-2025', name: 'November 2025', fullName: 'November 2025' },
    { key: 'december-2025', name: 'December 2025', fullName: 'December 2025' },
    { key: 'january-2026', name: 'January 2026', fullName: 'January 2026' },
    { key: 'february-2026', name: 'February 2026', fullName: 'February 2026' },
    { key: 'march-2026', name: 'March 2026', fullName: 'March 2026' },
    { key: 'april-2026', name: 'April 2026', fullName: 'April 2026' },
    { key: 'may-2026', name: 'May 2026', fullName: 'May 2026' },
    { key: 'june-2026', name: 'June 2026', fullName: 'June 2026' }
  ]

  useEffect(() => {
    initializeVimeoContent()
  }, [])

  const initializeVimeoContent = () => {
    const savedVideos = localStorage.getItem('vimeoVideos')
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos))
    }
  }

  const getMonthVideos = (monthKey: string) => {
    return videos.filter(video => {
      const matchesMonth = video.month === monthKey
      const matchesSearch = searchTerm === '' || 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Role-based filtering
      const hasAccess = video.assignedTo.includes('all') || 
        video.assignedTo.includes(userRole) || 
        (userId && video.assignedTo.includes(userId)) ||
        userRole === 'staff' || userRole === 'admin' // Staff and admin can see all
      
      return matchesMonth && matchesSearch && hasAccess
    })
  }

  const handleVideoUpload = (videoData: any) => {
    const newVideo: VimeoVideo = {
      id: `vimeo-${Date.now()}`,
      title: videoData.title,
      description: videoData.description,
      embedUrl: videoData.embedUrl,
      thumbnailUrl: videoData.thumbnailUrl || 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400&h=225',
      duration: videoData.duration || '0:00',
      uploadDate: new Date().toISOString().split('T')[0],
      month: videoData.month || activeMonth,
      season: '2025-2026',
      privacy: videoData.privacy || 'domain-restricted',
      downloadEnabled: videoData.downloadEnabled || false,
      views: 0,
      owner: user?.user_metadata?.full_name || 'Admin',
      assignedTo: videoData.assignedTo || ['all'],
      tags: videoData.tags || [],
      quality: videoData.quality || '1080p',
      size: videoData.size || 'Unknown'
    }

    const updatedVideos = [...videos, newVideo]
    setVideos(updatedVideos)
    localStorage.setItem('vimeoVideos', JSON.stringify(updatedVideos))
    setShowUploadModal(false)
  }

  const handleDownload = (video: VimeoVideo) => {
    if (video.downloadEnabled) {
      // In a real implementation, this would use Vimeo's download API
      const link = document.createElement('a')
      link.href = `${video.embedUrl}/download`
      link.download = video.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('Download not available for this video')
    }
  }

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public': return <Eye className="w-4 h-4 text-green-500" />
      case 'private': return <Shield className="w-4 h-4 text-red-500" />
      case 'domain-restricted': return <Shield className="w-4 h-4 text-blue-500" />
      default: return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const VimeoUploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Upload Video to Vimeo</h3>
          <button
            onClick={() => setShowUploadModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          handleVideoUpload({
            title: formData.get('title'),
            description: formData.get('description'),
            embedUrl: formData.get('embedUrl'),
            month: formData.get('month'),
            privacy: formData.get('privacy'),
            downloadEnabled: formData.get('downloadEnabled') === 'on',
            assignedTo: formData.get('assignedTo')?.toString().split(',') || ['all'],
            tags: formData.get('tags')?.toString().split(',') || []
          })
        }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Title
            </label>
            <input
              name="title"
              type="text"
              className="input-field"
              placeholder="Enter video title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="input-field"
              placeholder="Enter video description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vimeo Embed URL
            </label>
            <input
              name="embedUrl"
              type="url"
              className="input-field"
              placeholder="https://player.vimeo.com/video/123456789"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from your Vimeo video's embed settings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select name="month" className="input-field">
                {months.map(month => (
                  <option key={month.key} value={month.key}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Setting
              </label>
              <select name="privacy" className="input-field">
                <option value="domain-restricted">Domain Restricted</option>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <select name="assignedTo" className="input-field">
              <option value="all">All Users</option>
              <option value="players">Players Only</option>
              <option value="staff">Staff Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              name="tags"
              type="text"
              className="input-field"
              placeholder="training, tactics, match"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center">
            <input
              name="downloadEnabled"
              type="checkbox"
              className="rounded border-gray-300 text-club-red focus:ring-club-red"
            />
            <label className="ml-2 text-sm text-gray-700">
              Enable video downloads
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Upload to Vimeo
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
  )

  const VideoModal = () => {
    if (!selectedVideo) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
            <button
              onClick={() => setShowVideoModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="aspect-video">
            <iframe
              src={selectedVideo.embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={selectedVideo.title}
            />
          </div>
          
          <div className="p-4">
            <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{selectedVideo.duration}</span>
                <span>{selectedVideo.views} views</span>
                <span>By {selectedVideo.owner}</span>
              </div>
              {selectedVideo.downloadEnabled && (
                <button
                  onClick={() => handleDownload(selectedVideo)}
                  className="btn-outline py-2 px-4 text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentVideos = getMonthVideos(activeMonth)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Vimeo Video Library</h2>
        </div>
        
        {mode === 'admin' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {currentVideos.length} videos
          </span>
        </div>
      </div>

      {/* Month Tabs */}
      <div className="bg-gray-100 p-1 rounded-lg overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {months.map((month) => {
            const monthVideoCount = getMonthVideos(month.key).length
            return (
              <button
                key={month.key}
                onClick={() => setActiveMonth(month.key)}
                className={`py-2 px-4 rounded-md font-medium transition-all duration-200 whitespace-nowrap text-sm ${
                  activeMonth === month.key
                    ? 'bg-white text-club-red shadow-sm'
                    : 'text-gray-600 hover:text-club-red'
                }`}
              >
                {month.name}
                {monthVideoCount > 0 && (
                  <span className="ml-2 bg-club-red text-white text-xs px-2 py-1 rounded-full">
                    {monthVideoCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Video Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentVideos.map((video) => (
          <div key={video.id} className="card group cursor-pointer">
            <div className="relative mb-4">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-lg">
                <button
                  onClick={() => {
                    setSelectedVideo(video)
                    setShowVideoModal(true)
                  }}
                  className="bg-white bg-opacity-90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-200"
                >
                  <Play className="w-8 h-8 text-club-red" />
                </button>
              </div>
              <div className="absolute top-2 right-2 flex items-center space-x-2">
                {getPrivacyIcon(video.privacy)}
                <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-club-red transition-colors">
                {video.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{video.views} views</span>
                <span>By {video.owner}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedVideo(video)
                    setShowVideoModal(true)
                  }}
                  className="btn-primary flex-1 py-2 text-sm"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Watch
                </button>
                {video.downloadEnabled && (
                  <button
                    onClick={() => handleDownload(video)}
                    className="btn-outline py-2 px-3 text-sm"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentVideos.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No videos found' : 'No videos for this month'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : mode === 'admin' 
                ? 'Upload videos to get started'
                : 'Videos will appear here when available'
            }
          </p>
        </div>
      )}

      {/* Modals */}
      {showUploadModal && <VimeoUploadModal />}
      {showVideoModal && <VideoModal />}
    </div>
  )
}