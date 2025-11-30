// Utility function to get full image URL
// Uses environment variable for API URL, falls back to localhost in development
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png'
  
  // If imagePath already starts with http, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Get API base URL from environment or use default
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  return `${API_BASE_URL}${cleanPath}`
}

export default getImageUrl


