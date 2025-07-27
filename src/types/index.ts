// Types pour l'application Plougastel FC
export interface User {
  id: string
  aud: string
  email: string
  phone: string
  created_at: string
  updated_at: string
  email_confirmed_at: string
  last_sign_in_at: string
  role: string
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_metadata: {
    role: string
    full_name?: string
    username?: string
    position?: string
    number?: string
  }
  identities: any[]
}

export interface ContentItem {
  id: string
  title: string
  type: 'video' | 'document'
  date: string
  url?: string
  isExternal?: boolean
  size?: string
  description?: string
  matchNumber?: string
  uploadDate?: string
  category?: string
  playerName?: string
  assignedTo: string
  isPrivate?: boolean
  authorizedUsers?: string[]
  createdBy?: string
  thumbnail?: string
}

export interface DriveFile {
  id: string
  name: string
  type: 'video' | 'document' | 'folder' | 'image'
  size: string
  modifiedTime: string
  owner: string
  url?: string
  thumbnailUrl?: string
  isExternal?: boolean
  assignedTo?: string[]
  description?: string
  path: string[]
  parentId?: string
  shared?: boolean
  starred?: boolean
  permissions?: {
    canView: string[]
    canEdit: string[]
    canDownload: string[]
  }
}

export interface VimeoVideo {
  id: string
  title: string
  description: string
  embedUrl: string
  thumbnailUrl: string
  duration: string
  uploadDate: string
  month: string
  season: string
  privacy: 'public' | 'private' | 'domain-restricted'
  downloadEnabled: boolean
  views: number
  owner: string
  assignedTo: string[]
  tags: string[]
  quality: string
  size: string
}

export interface CreatedUser {
  id: string
  fullName: string
  username: string
  password: string
  role: 'player' | 'staff' | 'admin'
  position?: string
  jerseyNumber?: string
  profilePhoto?: string
  createdAt: string
  status: 'active' | 'inactive'
}