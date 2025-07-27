import { useState, useEffect } from 'react'
import { Search, User, Video, FileText, Eye, Download, Play, ExternalLink, Calendar, Grid, List } from 'lucide-react'
import VimeoManager from '../components/VimeoManager'
import { useAuth } from '../contexts/AuthContext'
import { ContentItem } from '../types'

export default function StaffDashboard() {
  const { user, createdUsers } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'list' | 'player'>('list')
  const [activeTab, setActiveTab] = useState<'players' | 'content' | 'vimeo'>('players')
  const [contentViewMode, setContentViewMode] = useState<'grid' | 'list'>('grid')
  const [filterBy, setFilterBy] = useState<'all' | 'video' | 'document'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'match'>('date')
  const [staffContent, setStaffContent] = useState<ContentItem[]>([])
  const [playerVideos, setPlayerVideos] = useState<ContentItem[]>([])

  // Use created users as players
  const players = createdUsers.filter(user => user.role === 'player').map(user => ({
    id: user.id,
    name: user.fullName,
    email: `${user.username}@plougastel-fc.com`,
    position: user.position,
    number: parseInt(user.jerseyNumber || '0') || 0,
    lastActive: user.createdAt,
    videosCount: 0,
    statsCount: 0,
    profilePhoto: user.profilePhoto
  }))

  useEffect(() => {
    loadStaffContent()
  }, [user])

  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerContent(selectedPlayer.id)
    }
  }, [selectedPlayer])

  const loadStaffContent = () => {
    const uploadedContent = JSON.parse(localStorage.getItem('uploadedContent') || '[]')
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
          date: item.modifiedTime?.split('T')[0] || new Date().toISOString().split('T')[0],
          url: item.url,
          isExternal: true,
          size: item.size || 'Unknown',
          description: item.description || `Google Drive ${item.type}`,
          matchNumber: item.matchNumber || 'N/A',
          assignedTo: 'all',
          isPrivate: false,
          authorizedUsers: []
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
        size: item.size || 'Unknown',
        description: item.description,
        matchNumber: item.month,
        assignedTo: item.assignedTo?.includes('all') ? 'all' : 'players',
        isPrivate: false,
        authorizedUsers: []
      } as ContentItem)
    })
    
    // Staff can see all content including private content
    setStaffContent(allContent)
  }

  const loadPlayerContent = (playerId: string) => {
    const uploadedContent = JSON.parse(localStorage.getItem('uploadedContent') || '[]')
    const googleDriveFiles = JSON.parse(localStorage.getItem('googleDriveFiles') || '[]')
    const vimeoVideos = JSON.parse(localStorage.getItem('vimeoVideos') || '[]')
    
    let playerContent: ContentItem[] = []
    
    // Filter uploaded content for this specific player
    const playerUploads = uploadedContent.filter((content: ContentItem) => 
      content.assignedTo === playerId || 
      content.assignedTo === 'all' || 
      content.assignedTo === 'players' ||
      (content.isPrivate && content.authorizedUsers?.includes(playerId))
    )
    
    playerContent = [...playerUploads]
    
    // Add Google Drive files (staff can see all)
    googleDriveFiles.forEach((item: any) => {
      if (item.type !== 'folder') {
        playerContent.push({
          id: `gdrive-${item.id}`,
          title: item.name,
          type: item.type,
          date: item.modifiedTime?.split('T')[0] || new Date().toISOString().split('T')[0],
          url: item.url,
          isExternal: true,
          size: item.size || 'Unknown',
          description: item.description || `Google Drive ${item.type}`,
          matchNumber: item.matchNumber || 'N/A',
          assignedTo: 'all'
        } as ContentItem)
      }
    })
    
    // Add Vimeo videos
    vimeoVideos.forEach((item: any) => {
      playerContent.push({
        id: `vimeo-${item.id}`,
        title: item.title,
        type: 'video',
        date: item.uploadDate,
        url: item.embedUrl,
        isExternal: true,
        size: item.size || 'Unknown',
        description: item.description,
        matchNumber: item.month,
        assignedTo: item.assignedTo?.includes('all') ? 'all' : 'players'
      } as ContentItem)
    })
    
    // Sort content by date (most recent first)
    playerContent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    setPlayerVideos(playerContent)
  }

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.number.toString().includes(searchTerm)
  )

  const getFilteredContent = () => {
    return staffContent.filter(content => {
      const matchesSearch = searchTerm === '' || 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.matchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.playerName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterBy === 'all' || content.type === filterBy
      
      return matchesSearch && matchesFilter
    }).sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'match':
          return (a.matchNumber || '').localeCompare(b.matchNumber || '')
        default:
          return 0
      }
    })
  }

  const fixGoogleDriveUrl = (url: string) => {
    if (!url || !url.includes('drive.google.com')) return url
    
    // Enhanced Google Drive URL handling for direct access
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
      // Return direct download URL for reliable downloads
      return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`
    }
    
    return url
  }

  const getGoogleDriveViewUrl = (url: string) => {
    if (!url || !url.includes('drive.google.com')) return url
    
    // Extract file ID for viewing/playing
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
      // Return direct view URL for videos and documents
      return `https://drive.google.com/file/d/${fileId}/view`
    }
    
    return url
  }
  const handleDownload = (video: ContentItem) => {
    // Prevent event propagation
    
    if (video.isExternal && video.url) {
      if (video.url.includes('drive.google.com')) {
        const downloadUrl = fixGoogleDriveUrl(video.url)
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
      const link = document.createElement('a')
      link.href = `/api/download/${video.id}`
      link.download = video.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePlay = (video: ContentItem) => {
    // Prevent event propagation
    
    if (video.isExternal && video.url) {
      if (video.url.includes('drive.google.com')) {
        // Use enhanced Google Drive view URL for direct playback
        const viewUrl = getGoogleDriveViewUrl(video.url)
        window.open(viewUrl, '_blank')
      } else if (video.url.includes('vimeo.com')) {
        window.open(video.url, '_blank')
      } else {
        window.open(video.url, '_blank')
      }
    }
  }

  const handlePlayerSelect = (player: any) => {
    setSelectedPlayer(player)
    loadPlayerContent(player.id)
    setViewMode('player')
  }

  const PlayerDetailView = () => {
    if (!selectedPlayer) return null

    // Organiser le contenu par mois de saison (Juillet 2025 à Juin 2026)
    const seasonMonths = [
      { name: 'July 2025', key: 'july-2025', monthNum: 7, year: 2025 },
      { name: 'August 2025', key: 'august-2025', monthNum: 8, year: 2025 },
      { name: 'September 2025', key: 'september-2025', monthNum: 9, year: 2025 },
      { name: 'October 2025', key: 'october-2025', monthNum: 10, year: 2025 },
      { name: 'November 2025', key: 'november-2025', monthNum: 11, year: 2025 },
      { name: 'December 2025', key: 'december-2025', monthNum: 12, year: 2025 },
      { name: 'January 2026', key: 'january-2026', monthNum: 1, year: 2026 },
      { name: 'February 2026', key: 'february-2026', monthNum: 2, year: 2026 },
      { name: 'March 2026', key: 'march-2026', monthNum: 3, year: 2026 },
      { name: 'April 2026', key: 'april-2026', monthNum: 4, year: 2026 },
      { name: 'May 2026', key: 'may-2026', monthNum: 5, year: 2026 },
      { name: 'June 2026', key: 'june-2026', monthNum: 6, year: 2026 }
    ]

    const getContentByMonth = (monthData: any) => {
      return playerVideos.filter(video => {
        const videoDate = new Date(video.date)
        return videoDate.getMonth() + 1 === monthData.monthNum && 
               videoDate.getFullYear() === monthData.year
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Player Header */}
        <div className="bg-gradient-to-r from-club-red to-club-red-light rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {selectedPlayer.profilePhoto && typeof selectedPlayer.profilePhoto === 'string' ? (
                <img
                  src={selectedPlayer.profilePhoto}
                  alt={selectedPlayer.name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {selectedPlayer.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2">{selectedPlayer.name}</h1>
                <div className="flex items-center space-x-4 text-red-100">
                  <span>Player ID: {selectedPlayer.id}</span>
                  <span>•</span>
                  <span>@{createdUsers.find(u => u.id === selectedPlayer.id)?.username || 'N/A'}</span>
                  <span>•</span>
                  <span>#{selectedPlayer.number}</span>
                  <span>•</span>
                  <span>{selectedPlayer.position}</span>
                  <span>•</span>
                  <span>Created: {selectedPlayer.lastActive}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setViewMode('list')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Player Information Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Position</h4>
              <p className="text-lg text-club-red">{selectedPlayer.position}</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Jersey Number</h4>
              <p className="text-lg text-club-red">#{selectedPlayer.number}</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
              <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Full Name:</span>
                <span className="ml-2 text-gray-900">{selectedPlayer.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Username:</span>
                <span className="ml-2 text-gray-900">@{createdUsers.find(u => u.id === selectedPlayer.id)?.username || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{selectedPlayer.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Content Items:</span>
                <span className="ml-2 text-gray-900">{playerVideos.length} items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Content by Season Month */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Player Content - Season 2025-2026</h2>
          
          {seasonMonths.map((month) => {
            const monthContent = getContentByMonth(month)
            if (monthContent.length === 0) return null

            return (
              <div key={month.key} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-club-red" />
                  <h3 className="text-lg font-semibold text-gray-900">{month.name}</h3>
                  <span className="bg-club-red text-white text-xs px-2 py-1 rounded-full">
                    {monthContent.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthContent.map((video) => (
                    <div key={video.id} className="card group">
                      {video.type === 'video' ? (
                        <div className="relative mb-4">
                          <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                            <Play className="w-12 h-12 text-gray-400" />
                          </div>
                          <button
                            onClick={() => handlePlay(video)}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg"
                          >
                            <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-200">
                              <Play className="w-6 h-6 text-club-red" />
                            </div>
                          </button>
                          {video.isExternal && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              External
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 text-sm group-hover:text-club-red transition-colors">
                          {video.title}
                        </h4>
                        {video.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{video.description}</p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                          <span>{new Date(video.date).toLocaleDateString()}</span>
                          {video.matchNumber && video.matchNumber !== 'N/A' && (
                            <span className="bg-club-red text-white px-1 py-0.5 rounded text-xs">
                              {video.matchNumber}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-1">
                          {video.type === 'video' ? (
                            <button 
                              onClick={() => handlePlay(video)}
                              className="btn-primary flex-1 py-1 text-xs"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Watch
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleDownload(video)}
                              className="btn-primary flex-1 py-1 text-xs"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          
          {playerVideos.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content assigned</h3>
              <p className="text-gray-600">Content will appear here when uploaded and assigned to {selectedPlayer.name}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (viewMode === 'player') {
    return <PlayerDetailView />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-club-black to-club-black-light rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
            <p className="text-gray-300">Manage and monitor all player content and performance</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
        <button
          onClick={() => setActiveTab('players')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'players'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          <User className="w-4 h-4 mr-2 inline" />
          Players
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'content'
              ? 'bg-white text-club-red shadow-md'
              : 'text-gray-600 hover:text-club-red'
          }`}
        >
          <FileText className="w-4 h-4 mr-2 inline" />
          All Content
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
          Vimeo Library
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Platform Content</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setContentViewMode(contentViewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-100 rounded"
              >
                {contentViewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
              <span className="text-sm text-gray-600">
                {getFilteredContent().length} items
              </span>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search content by title, description, match..."
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
                <option value="title">Sort by Title</option>
                <option value="match">Sort by Match</option>
              </select>
            </div>
          </div>

          {/* Content Display */}
          {getFilteredContent().length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' ? 'No content matches your search' : 'No content available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterBy !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Content will appear here when uploaded'
                }
              </p>
            </div>
          ) : contentViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredContent().map((content) => (
                <div key={content.id} className="card group">
                  {content.type === 'video' ? (
                    <div className="relative mb-4">
                      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <Play className="w-16 h-16 text-gray-400" />
                      </div>
                      <button
                        onClick={() => handlePlay(content)}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg"
                      >
                        <div className="bg-white bg-opacity-90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-200">
                          <Play className="w-8 h-8 text-club-red" />
                        </div>
                      </button>
                      {content.isExternal && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          External
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 group-hover:text-club-red transition-colors">
                      {content.title}
                    </h3>
                    {content.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{content.description}</p>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-3 flex-wrap">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(content.date).toLocaleDateString()}
                      </span>
                      {content.matchNumber && content.matchNumber !== 'N/A' && (
                        <span className="bg-club-red text-white px-2 py-1 rounded text-xs">
                          {content.matchNumber}
                        </span>
                      )}
                      {content.size && <span>{content.size}</span>}
                      {content.isExternal && (
                        <span className="text-blue-600">External</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {content.type === 'video' ? (
                        <button 
                          onClick={() => handlePlay(content)}
                          className="btn-primary flex-1 py-2 text-sm"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          {content.isExternal ? 'Watch' : 'Play'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDownload(content)}
                          className="btn-primary flex-1 py-2 text-sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      )}
                      <button 
                        onClick={() => handleDownload(content)}
                        className="btn-outline py-2 px-3 text-sm"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredContent().map((content) => (
                <div key={content.id} className="card">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        content.type === 'video' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {content.type === 'video' ? (
                          <Video className="w-6 h-6 text-red-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{content.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4 flex-wrap">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {content.date}
                        </span>
                        <span>Type: {content.type}</span>
                        {content.matchNumber && content.matchNumber !== 'N/A' && <span>Match: {content.matchNumber}</span>}
                        {content.size && <span>Size: {content.size}</span>}
                        {content.isExternal && <span className="text-blue-600">External Link</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          if (content.type === 'video') {
                            handlePlay(content)
                          } else {
                            handleDownload(content)
                          }
                        }}
                        className="p-2 hover:bg-gray-100 rounded"
                        title={content.type === 'video' ? 'Play' : 'View'}
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDownload(content)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'vimeo' && (
        <VimeoManager 
          mode="user" 
          userRole="staff"
          userId={user?.id}
        />
      )}

      {activeTab === 'players' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Players Management</h2>
            <span className="text-sm text-gray-600">
              {filteredPlayers.length} players
            </span>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search players by name, position, or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Players List */}
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No players found' : 'No players created yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Players will appear here when created by administrators'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="card group cursor-pointer" onClick={() => handlePlayerSelect(player)}>
                  <div className="flex items-center space-x-4 mb-4">
                    {player.profilePhoto && typeof player.profilePhoto === 'string' ? (
                      <img
                        src={player.profilePhoto}
                        alt={player.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-club-red rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {player.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-club-red transition-colors">
                        {player.name}
                      </h3>
                      <p className="text-sm text-gray-600">#{player.number} • {player.position}</p>
                      <p className="text-xs text-gray-500">{player.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Active
                    </span>
                    <button className="btn-primary py-1 px-3 text-sm group-hover:scale-105 transition-transform">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}