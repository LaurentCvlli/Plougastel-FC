# Plougastel FC - Club Management Platform

A secure, role-based football club management system built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Vimeo Integration
- **Professional Video Hosting**: Seamless integration with Vimeo for high-quality video streaming
- **Responsive Video Players**: Embedded Vimeo players that work perfectly on all devices
- **Domain-Restricted Privacy**: Videos can only be played on the official platform domain
- **Monthly Organization**: Videos organized by season months (July 2025 - June 2026)
- **Download Controls**: Configurable download permissions for different user roles
- **Advanced Video Management**: Upload, organize, and manage video content with metadata

### Authentication & Security
- **Secure Login System**: Email/password authentication with role-based access control
- **Three User Roles**:
  - **Players**: Access to personal videos and statistics
  - **Staff**: Full access to all player profiles and content
  - **Admin/Video Analyst**: Complete platform management capabilities

### Admin Dashboard
- **User Management**: Create, edit, and manage player and staff accounts
- **Content Upload**: Upload videos and documents (PDF, Excel) for individual players or entire team
- **Content Organization**: Categorize content by type, player, match, or training session
- **Analytics**: Track content views, user activity, and platform usage

### Player Experience
- **Personal Dashboard**: Access to assigned videos and statistics
- **Vimeo Video Library**: Dedicated section for streaming Vimeo-hosted content
- **Team Content**: View collective training videos and match analyses
- **Statistics Reports**: Download personal performance reports and statistics
- **Mobile Optimized**: Fully responsive design for all devices

### Staff Tools
- **Player Management**: View and manage all player profiles
- **Vimeo Access**: Full access to all Vimeo videos and content library
- **Content Access**: Full access to all videos and documents
- **Search & Filter**: Advanced search capabilities across all content
- **Player Analytics**: Individual player performance tracking

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Video Platform**: Vimeo integration with embedded players
- **Styling**: Tailwind CSS with custom club theme
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT tokens
- **File Storage**: Supabase Storage (AWS S3 compatible)

## 🎨 Design System

- **Colors**: Club red (#DC2626), deep black (#1F2937), pure white
- **Typography**: Inter font family for modern, readable text
- **Components**: Reusable card system, consistent button styles
- **Responsive**: Mobile-first design with breakpoints for tablet and desktop

## 🔧 Installation & Setup

### Vimeo Setup (for Production)
1. **Create Vimeo Account**
   - Sign up for Vimeo Pro or Business plan
   - Enable domain restrictions in privacy settings
   - Configure download permissions as needed

2. **Get API Credentials**
   - Go to Vimeo Developer portal
   - Create new app and get API tokens
   - Add tokens to environment variables

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd plougastel-fc-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials or use demo mode

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔐 Demo Credentials

For testing purposes, use these demo accounts:

- **Player**: `player@plougastel-fc.com` / `password123`
- **Staff**: `staff@plougastel-fc.com` / `password123`
- **Admin**: `admin@plougastel-fc.com` / `password123`

## 📱 Responsive Design

The platform is optimized for:
- **Mobile**: < 768px (touch-friendly interface)
- **Tablet**: 768px - 1024px (hybrid layout)
- **Desktop**: > 1024px (full sidebar navigation)

## 🔒 Security Features

- **Role-Based Access Control**: Strict permission system
- **Secure Authentication**: JWT tokens with automatic refresh
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Input Validation**: Comprehensive form validation and sanitization
- **HTTPS Only**: Secure connections enforced

## 📊 Scalability Considerations

### Vimeo Integration Benefits
- **Professional Video Hosting**: Reliable, high-quality video streaming
- **Bandwidth Optimization**: Vimeo handles all video delivery and streaming
- **Mobile Optimization**: Automatic video quality adjustment for different devices
- **Security Features**: Domain restrictions and privacy controls
- **Analytics**: Built-in video analytics and viewing statistics

The platform is designed to handle 50-100 users efficiently:

- **Database Optimization**: Indexed queries and efficient data structures
- **File Storage**: CDN-backed storage for fast video delivery
- **Caching Strategy**: Browser and server-side caching
- **Performance Monitoring**: Built-in analytics and performance tracking

## 🚀 Deployment

The application can be deployed to:
- **Netlify** (recommended for frontend)
- **Vercel** (alternative frontend hosting)
- **Supabase** (backend and database)

## 📋 Content Management

### Video Upload
- Supports MP4, MOV, AVI formats up to 500MB
- Automatic thumbnail generation
- Streaming-optimized delivery
- Download controls per content item

### Document Management
- PDF, Excel, Word document support
- Up to 50MB file size limit
- Secure download links
- Version control and organization

### User Assignment
- Individual player assignment
- Team-wide content distribution
- Role-based visibility controls
- Notification system for new content

## 🔄 Future Enhancements

- **Advanced Vimeo Features** including live streaming and interactive videos
- **Two-Factor Authentication** for enhanced security
- **Video Annotations** for detailed analysis
- **Mobile App** for iOS and Android
- **Advanced Analytics** with detailed reporting
- **Integration APIs** for external tools
- **Automated Backups** and disaster recovery

## 📞 Support

For technical support or feature requests, contact the development team or refer to the technical documentation.

---

Built with ❤️ for Plougastel FC