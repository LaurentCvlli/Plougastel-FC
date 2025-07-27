import { User } from '@supabase/supabase-js'
import { ContentItem } from '../types'

export const hasContentAccess = (user: User | null, content: ContentItem): boolean => {
  if (!user) return false
  
  const userRole = user.user_metadata?.role
  const userId = user.id
  
  // Admins have access to everything
  if (userRole === 'admin') return true
  
  // Staff have access to all content for management purposes
  if (userRole === 'staff') return true
  
  // If content is private, check specific authorization
  if (content.isPrivate) {
    // Check if user is specifically authorized
    if (content.authorizedUsers?.includes(userId)) return true
    
    // Check if user created the content
    if (content.createdBy === userId) return true
    
    // No access for private content
    return false
  }
  
  // For non-private content, check regular assignment rules
  if (content.assignedTo === 'all') return true
  if (content.assignedTo === userRole) return true
  if (content.assignedTo === userId) return true
  
  return false
}

export const filterContentByAccess = (user: User | null, contentList: ContentItem[]): ContentItem[] => {
  if (!user) return []
  
  return contentList.filter(content => hasContentAccess(user, content))
}

export const getAccessLevelDisplay = (content: ContentItem): string => {
  if (content.isPrivate) {
    const userCount = content.authorizedUsers?.filter(u => u !== 'staff' && u !== 'admin').length || 0
    return `🔒 Private (${userCount} users + staff/admin)`
  }
  
  switch (content.assignedTo) {
    case 'all': return '🌐 Public (All Users)'
    case 'players': return '⚽ Players Only'
    case 'staff': return '👥 Staff Only'
    case 'admin': return '🔧 Admin Only'
    default: return '👤 Specific User'
  }
}

export const canUserDownload = (user: User | null, content: ContentItem): boolean => {
  // Same access rules apply for downloads
  return hasContentAccess(user, content)
}

export const getPrivacyWarning = (content: ContentItem): string | null => {
  if (content.isPrivate) {
    return "⚠️ This is private content. Only authorized users can access this material."
  }
  return null
}