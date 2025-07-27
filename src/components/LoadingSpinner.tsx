export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-club-red rounded-full animate-spin mx-auto mb-4"></div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-club-red rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">FC</span>
          </div>
          <h2 className="text-xl font-bold text-club-black">Plougastel FC</h2>
        </div>
        <p className="text-gray-600">Loading platform...</p>
      </div>
    </div>
  )
}