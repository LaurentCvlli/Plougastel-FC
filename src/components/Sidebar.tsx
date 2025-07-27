interface SidebarProps {
  isMobileMenuOpen: boolean
  onClose: () => void
  activeTab: 'overview' | 'users' | 'content' | 'vimeo'
  setActiveTab: (tab: 'overview' | 'users' | 'content' | 'vimeo') => void
}

export default function Sidebar({
  isMobileMenuOpen,
  onClose,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  return (
    <div
      className={`${
        isMobileMenuOpen ? 'block' : 'hidden md:block'
      } fixed md:static z-50 w-64 h-screen bg-gray-800 text-white`}
    >
      <div className="flex items-center justify-between p-4 md:hidden">
        <h2 className="text-lg font-bold">Menu</h2>
        <button onClick={onClose} className="text-white">
          ✕
        </button>
      </div>
      <nav className="mt-4 space-y-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full text-left px-4 py-2 ${
            activeTab === 'overview' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`w-full text-left px-4 py-2 ${
            activeTab === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`w-full text-left px-4 py-2 ${
            activeTab === 'content' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('vimeo')}
          className={`w-full text-left px-4 py-2 ${
            activeTab === 'vimeo' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          Vimeo
        </button>
      </nav>
    </div>
  )
}

