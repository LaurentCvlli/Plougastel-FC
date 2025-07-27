import { useState, useEffect } from 'react'
import { Download, FileText, Video, Calendar, Search, User } from 'lucide-react'
import SeasonCalendar from '../components/SeasonCalendar'
import VideoPlayer from '../components/VideoPlayer'
import VimeoManager from '../components/VimeoManager'
import { useAuth } from '../contexts/AuthContext'
import { ContentItem } from '../types'

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('team')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'match'>('date')
  const [uploadedContent, setUploadedContent] = useState<ContentItem[]>([])
  const [filterBy, setFilterBy] = useState<'all' | 'video' | 'document'>('all')

  // Load content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('uploadedContent')
    if (savedContent) {
      setUploadedContent(JSON.parse(savedContent))
    }
  }, [])

  // Filter content based on assignment
  const getFilteredContent = (isPersonal: boolean = false) => {
    // Load all content sources
    const googleDriveFiles = JSON.parse(localStorage.getItem('googleDriveFiles') || '[]')
    const vimeoVideos = JSON.parse(localStorage.getItem('vimeoVideos') || '[]')
    
    let allContent = [...uploadedContent]
    
    // Add Google Drive files
    googleDriveFiles.forEach((item: any) => {
      if (item.type !== 'folder') {
        allContent.push({
          id: `gdrive-${item.id}`,
          title: item.name,
          type: item.type,
          date: item.modifiedTime.split('T')[0],
          url: item.url,
          isExternal: true,
          size: item.size,
          description: `Google Drive ${item.type}`,
          assignedTo: 'all'
        } as ContentItem)
      }
    })
    
    // Add Vimeo videos
    vimeoVideos.forEach((item: any) => {
      allContent.push({
        id: `vimeo-${item.id}`,
        title: item.title,
        type: 'video',
        date: item.uploadDate,
        url: item.embedUrl,
        isExternal: true,
        size: item.size,
        description: item.description,
        matchNumber: item.month,
        assignedTo: item.assignedTo?.includes('all') ? 'all' : 'players'
      } as ContentItem)
    })
    
    return allContent.filter(content => {
      const matchesSearch = searchTerm === '' || 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.matchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.playerName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // IMPORTANT: Player can only see content assigned to them specifically or to all players
      const isAssignedToUser = content.assignedTo === 'all' || 
        content.assignedTo === 'players' ||
        content.assignedTo === user?.id || // Content assigned specifically to this player
        (content.isPrivate && content.authorizedUsers?.includes(user?.id || '')) // Private content authorized for this player
      
      const isPersonalContent = content.assignedTo === user?.id
      const matchesFilter = filterBy === 'all' || content.type === filterBy
      
      return matchesSearch && isAssignedToUser && matchesFilter && 
             (isPersonal ? isPersonalContent : !isPersonalContent || content.assignedTo === 'all' || content.assignedTo === 'players')
    }).sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return (a.matchNumber || '').localeCompare(b.matchNumber || '')
      }
    })
  }

  const teamVideos = getFilteredContent(false)
  const personalVideos = getFilteredContent(true)
  const privateVideos = uploadedContent.filter(content => 
    content.isPrivate && content.authorizedUsers?.includes(user?.id || '')
  )

  const fixGoogleDriveDownloadUrl = (url: string) => {
    if (!url || !url.includes('drive.google.com')) return url
    
    // Extract file ID from various Google Drive URL formats
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
      // Return direct download URL with confirmation bypass
      return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`
    }
    
    return url
  }

  const handleDownload = (video: ContentItem) => {
    // Prevent event propagation
    
    if (video.isExternal && video.url) {
      if (video.url.includes('drive.google.com')) {
        // Use enhanced Google Drive download URL
        const downloadUrl = fixGoogleDriveDownloadUrl(video.url)
        // Force download by creating a temporary link
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = video.title
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        window.open(video.url, '_blank')
      }
    } else {
      // Simulate file download
      const link = document.createElement('a')
      link.href = `/api/download/${video.id}`
      link.download = video.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const VideoCard = ({ video, isPersonal = false }: { video: ContentItem; isPersonal?: boolean }) => (
    <div className="card group cursor-pointer">
      {video.type === 'video' ? (
        <VideoPlayer
          url={video.isExternal ? (video.url || '') : `/api/video/${video.id}`}
          title={video.title}
          isExternal={video.isExternal}
          thumbnail={video.thumbnail}
          onDownload={() => handleDownload(video)}
          className="mb-4"
        />
      ) : (
        <div className="mb-4">
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <FileText className="w-16 h-16 text-blue-500" />
          </div>
          <div className="mt-3">
            <h3 className="font-semibold text-gray-900">{video.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{video.description}</p>
            <button
              onClick={() => handleDownload(video)}
              className="btn-primary w-full mt-3 py-2 text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
        </div>
      )}
      
      {isPersonal && (
        <div className="mb-2">
          <span className="inline-flex px-2 py-1 text-xs font-medium bg-club-red text-white rounded-full">
            Personal Content
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {video.date}
        </div>
        {video.matchNumber && (
          <div className="flex items-center">
            <span className="bg-club-red text-white text-xs px-2 py-1 rounded">
              {video.matchNumber}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-club-red to-club-red-light rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome Back, {user?.user_metadata?.full_name || 'Player'}!
            </h1>
            <p className="text-red-100">Access your personal training content and statistics</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedCategory('vimeo')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            selectedCategory === 'vimeo'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          Vimeo Videos
        </button>
        <button
          onClick={() => setSelectedCategory('calendar')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            selectedCategory === 'calendar'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          Season Calendar
        </button>
        <button
          onClick={() => setSelectedCategory('team')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            selectedCategory === 'team'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          Team Videos
        </button>
        <button
          onClick={() => setSelectedCategory('personal')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            selectedCategory === 'personal'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          Personal Analysis
        </button>
        <button
          onClick={() => setSelectedCategory('private')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            selectedCategory === 'private'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          🔒 Private
        </button>
      </div>

      {/* Content Area */}
      {selectedCategory === 'vimeo' && (
        <VimeoManager 
          mode="user" 
          userRole={user?.user_metadata?.role || 'player'}
          userId={user?.id}
        />
      )}

      {selectedCategory === 'calendar' && <SeasonCalendar />}

      {selectedCategory === 'team' && (
        <div className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos by title, match, or player..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                autoComplete="off"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="input-field py-2"
              >
                <option value="all">All Content</option>
                <option value="video">Videos Only</option>
                <option value="document">Documents Only</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field py-2"
              >
                <option value="date">Sort by Date</option>
                <option value="match">Sort by Match</option>
              </select>
              
              <span className="text-sm text-gray-600">
                {teamVideos.length} items
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Team Videos</h2>
          </div>
          
          {teamVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' 
                  ? 'No content matches your search' 
                  : 'No team content available yet'
                }
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterBy !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Team videos and documents will appear here when uploaded'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedCategory === 'personal' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Personal Content</h2>
            <span className="text-sm text-gray-500">{personalVideos.length} videos available</span>
          </div>
          
          {personalVideos.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No personal content yet</h3>
              <p className="text-gray-600">Personal content will appear here when assigned to you</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalVideos.map((video) => (
                <VideoCard key={video.id} video={video} isPersonal={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedCategory === 'private' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              🔒 Private Videos
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Only visible to you)
              </span>
            </h2>
            <span className="text-sm text-gray-500">{privateVideos.length} private videos</span>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-lg">🔒</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Private Content Access
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  These videos are exclusively for you. They are not visible to other players and should not be shared.
                </p>
              </div>
            </div>
          </div>
          
          {privateVideos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No private content yet</h3>
              <p className="text-gray-600">Private videos assigned specifically to you will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateVideos.map((video) => (
                <VideoCard key={video.id} video={video} isPersonal={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedCategory === 'private' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              🔒 Private Videos
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Only visible to you)
              </span>
            </h2>
            <span className="text-sm text-gray-500">{privateVideos.length} private videos</span>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-lg">🔒</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Private Content Access
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  These videos are exclusively for you. They are not visible to other players and should not be shared.
                </p>
              </div>
            </div>
          </div>
          
          {privateVideos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No private content yet</h3>
              <p className="text-gray-600">Private videos assigned specifically to you will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateVideos.map((video) => (
                <VideoCard key={video.id} video={video} isPersonal={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedCategory === 'private' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              🔒 Private Videos
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Only visible to you)
              </span>
            </h2>
            <span className="text-sm text-gray-500">{privateVideos.length} private videos</span>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-lg">🔒</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Private Content Access
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  These videos are exclusively for you. They are not visible to other players and should not be shared.
                </p>
              </div>
            </div>
          </div>
          
          {privateVideos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No private content yet</h3>
              <p className="text-gray-600">Private videos assigned specifically to you will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateVideos.map((video) => (
                <VideoCard key={video.id} video={video} isPersonal={true} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}