import React from 'react'
import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth()
  const userRole = user?.user_metadata?.role || 'player'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className={`flex-1 ml-0 ${userRole !== 'player' ? 'lg:ml-64' : ''} transition-all duration-200`}>
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && userRole !== 'player' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}