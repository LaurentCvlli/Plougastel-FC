import { X, Users, Upload, Video, TrendingUp } from 'lucide-react'

interface SidebarProps {
  isMobileMenuOpen: boolean
  onClose: () => void
  setActiveTab: (tab: 'overview' | 'users' | 'content' | 'vimeo') => void
  activeTab: 'overview' | 'users' | 'content' | 'vimeo'
}

export default function Sidebar({
  isMobileMenuOpen,
  onClose,
  setActiveTab,
  activeTab,
}: SidebarProps) {
  return (
    <div
      className={`fixed z-50 top-0 left-0 h-full w-64 bg-gray-800 text-white transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Menu</h2>
        <button className="lg:hidden" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex flex-col space-y-2 p-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 py-2 px-4 rounded ${
            activeTab === 'overview'
              ? 'bg-red-600 text-white'
              : 'hover:bg-gray-700 text-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 py-2 px-4 rounded ${
            activeTab === 'users'
              ? 'bg-red-600 text-white'
              : 'hover:bg-gray-700 text-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center space-x-2 py-2 px-4 rounded ${
            activeTab === 'content'
              ? 'bg-red-600 text-white'
              : 'hover:bg-gray-700 text-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Content</span>
        </button>

        <button
          onClick={() => setActiveTab('vimeo')}
          className={`flex items-center space-x-2 py-2 px-4 rounded ${
            activeTab === 'vimeo'
              ? 'bg-red-600 text-white'
              : 'hover:bg-gray-700 text-gray-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Vimeo</span>
        </button>
      </nav>
    </div>
  )
}
