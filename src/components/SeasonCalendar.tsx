import { useState, useEffect } from 'react'
import { Calendar, Download, Play, FileText, ExternalLink, Search, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ContentItem } from '../types'

export default function SeasonCalendar() {
  const { user } = useAuth()
  const [activeMonth, setActiveMonth] = useState('july-2025')
  const [allContent, setAllContent] = useState<ContentItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'video' | 'document'>('all')

  const months = [
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

  useEffect(() => {
    loadAllContent()
  }, [])

  const loadAllContent = () => {
    // Load from all sources
    const uploadedContent = JSON.parse(localStorage.getItem('uploadedContent') || '[]')
    const googleDriveFiles = JSON.parse(localStorage.getItem('googleDriveFiles') || '[]')
    const vimeoVideos = JSON.parse(localStorage.getItem('vimeoVideos') || '[]')

    let allItems: ContentItem[] = []

    // Add uploaded content
    uploadedContent.forEach((item: any) => {
      allItems.push({
        id: `upload-${item.id}`,
        title: item.title,
        type: item.type === 'video' ? 'video' : 'document',
        date: item.date,
        url: item.url,
        isExternal: item.isExternal,
        size: item.size,
        description: item.description,
        matchNumber: item.matchNumber,
        uploadDate: item.uploadDate,
        category: item.category,
        playerName: item.playerName,
        assignedTo: item.assignedTo || 'all',
        isPrivate: item.isPrivate || false,
        authorizedUsers: item.authorizedUsers || []
      })
    })

    // Add Google Drive files
    googleDriveFiles.forEach((item: any) => {
      if (item.type !== 'folder') {
        allItems.push({
          id: `gdrive-${item.id}`,
          title: item.name,
          type: item.type,
          date: item.modifiedTime.split('T')[0], // Convert to date format
          url: item.url,
          isExternal: true,
          size: item.size,
          description: `Google Drive ${item.type}`,
          category: 'google-drive',
          assignedTo: 'all',
          isPrivate: false,
          authorizedUsers: []
        })
      }
    })

    // Add Vimeo videos
    vimeoVideos.forEach((item: any) => {
      allItems.push({
        id: `vimeo-${item.id}`,
        title: item.title,
        type: 'video',
        date: item.uploadDate,
        url: item.embedUrl,
        isExternal: true,
        size: item.size,
        description: item.description,
        matchNumber: item.month,
        category: 'vimeo',
        assignedTo: item.assignedTo?.includes('all') ? 'all' : 'players',
        isPrivate: false,
        authorizedUsers: []
      })
    })

    // Apply access control filtering
    // Filtrer le contenu accessible pour les joueurs
    const accessibleContent = allItems.filter(item => {
      // Les joueurs ne peuvent voir que le contenu assigné à "all", "players" ou à eux spécifiquement
      if (user?.user_metadata?.role === 'player') {
        return item.assignedTo === 'all' || 
               item.assignedTo === 'players' || 
               item.assignedTo === user.id ||
               (item.isPrivate && item.authorizedUsers?.includes(user.id))
      }
      // Staff et admin peuvent tout voir
      return true
    })
    
    setAllContent(accessibleContent)
  }

  const getMonthContent = (monthKey: string) => {
    const monthData = months.find(m => m.key === monthKey)
    if (!monthData) return []

    return allContent.filter(item => {
      const itemDate = new Date(item.date)
      const matchesMonth = itemDate.getMonth() + 1 === monthData.monthNum && 
                          itemDate.getFullYear() === monthData.year
      
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.matchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.playerName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterBy === 'all' || item.type === filterBy
      
      return matchesMonth && matchesSearch && matchesFilter
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const handleDownload = (item: ContentItem) => {
    if (item.isExternal && item.url) {
      // For Google Drive links, convert to download URL
      if (item.url.includes('drive.google.com')) {
        let downloadUrl = item.url
        if (item.url.includes('/view?usp=sharing')) {
          const fileId = item.url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
          if (fileId) {
            downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
          }
        }
        window.open(downloadUrl, '_blank')
      } else {
        window.open(item.url, '_blank')
      }
    } else {
      // For uploaded files, trigger download
      const link = document.createElement('a')
      link.href = item.url || `/api/download/${item.id}`
      link.download = item.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePlay = (item: ContentItem) => {
    if (item.isExternal && item.url) {
      if (item.url.includes('drive.google.com')) {
        // Open Google Drive video player
        window.open(item.url, '_blank')
      } else if (item.url.includes('vimeo.com')) {
        // Open Vimeo player
        window.open(item.url, '_blank')
      } else {
        window.open(item.url, '_blank')
      }
    }
  }

  const ContentCard = ({ item }: { item: ContentItem }) => (
    <div className="card group hover:shadow-xl transition-all duration-200">
      {item.type === 'video' ? (
        <div className="relative mb-4">
          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
            <Play className="w-16 h-16 text-gray-400" />
          </div>
          <button
            onClick={() => handlePlay(item)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg"
          >
            <div className="bg-white bg-opacity-90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-200">
              <Play className="w-8 h-8 text-club-red" />
            </div>
          </button>
          {item.isExternal && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
              <ExternalLink className="w-3 h-3 mr-1" />
              {item.category === 'vimeo' ? 'Vimeo' : 'Drive'}
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
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        )}
        
        <div className="flex items-center text-xs text-gray-500 space-x-3 flex-wrap">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(item.date).toLocaleDateString()}
          </span>
          {item.matchNumber && (
            <span className="bg-club-red text-white px-2 py-1 rounded text-xs">
              {item.matchNumber}
            </span>
          )}
          {item.playerName && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {item.playerName}
            </span>
          )}
          {item.size && <span>{item.size}</span>}
          {item.category && item.category !== 'general' && (
            <span className="capitalize">{item.category}</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {item.type === 'video' ? (
            <button 
              onClick={() => handlePlay(item)}
              className="btn-primary flex-1 py-2 text-sm"
            >
              <Play className="w-4 h-4 mr-1" />
              {item.isExternal ? 'Watch' : 'Play'}
            </button>
          ) : (
            <button 
              onClick={() => handleDownload(item)}
              className="btn-primary flex-1 py-2 text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
          )}
          {item.type === 'video' && (
            <button 
              onClick={() => handleDownload(item)}
              className="btn-outline py-2 px-3 text-sm"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const activeMonthData = {
    name: months.find(m => m.key === activeMonth)?.name || '',
    content: getMonthContent(activeMonth)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Calendar className="w-6 h-6 text-club-red" />
        <h2 className="text-2xl font-bold text-gray-900">Season Calendar 2025-2026</h2>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search content..."
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
          <Filter className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Month Tabs */}
      <div className="bg-gray-100 p-1 rounded-lg overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {months.map((month) => {
            const monthContent = getMonthContent(month.key)
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
                {monthContent.length > 0 && (
                  <span className="ml-2 bg-club-red text-white text-xs px-2 py-1 rounded-full">
                    {monthContent.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Month Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {activeMonthData.name}
          </h3>
          <span className="text-sm text-gray-500">
            {activeMonthData.content.length} items
          </span>
        </div>
        
        {activeMonthData.content.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterBy !== 'all' 
                ? 'No content matches your search' 
                : `No content for ${activeMonthData.name}`
              }
            </h4>
            <p className="text-gray-600">
              {searchTerm || filterBy !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : `Content for ${activeMonthData.name} will appear here when uploaded`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMonthData.content.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}