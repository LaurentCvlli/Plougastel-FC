import { useState } from 'react'
import { Menu, X, LogOut, User, Shield, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface HeaderProps {
  onMenuToggle?: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const userRole = user?.user_metadata?.role || 'player'
  
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Video Analyst'
      case 'staff': return 'Technical Staff'
      default: return 'Player'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Settings className="w-4 h-4" />
      case 'staff': return <Shield className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen)
    if (onMenuToggle) {
      onMenuToggle()
    }
  }
  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Club Name */}
          <div className="flex items-center space-x-4">
            {(userRole === 'staff' || userRole === 'admin') && (
              <button
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={handleMenuClick}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-club-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">FC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-club-black">Plougastel FC</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Club Management Platform</p>
              </div>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
              {getRoleIcon(userRole)}
              <span className="text-sm font-medium text-gray-700">
                {getRoleDisplayName(userRole)}
              </span>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <button
              onClick={signOut}
              className="p-2 text-gray-600 hover:text-club-red hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {getRoleIcon(userRole)}
              <span>{getRoleDisplayName(userRole)}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
        </div>
      )}
    </header>
  )
}