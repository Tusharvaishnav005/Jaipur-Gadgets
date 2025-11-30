// Utility function to get full image URL
// Uses environment variable for API URL, falls back to localhost in development
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('getImageUrl: No image path provided');
    return '/placeholder.png';
  }
  
  // If imagePath already starts with http, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Get API base URL from environment or use default
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  // Log in development to help debug
  if (import.meta.env.DEV) {
    console.log('getImageUrl:', { imagePath, API_BASE_URL });
  }
  
  // Ensure imagePath starts with / for proper URL construction
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Construct full URL
  const fullUrl = `${API_BASE_URL}${cleanPath}`;
  
  // Log in development
  if (import.meta.env.DEV) {
    console.log('getImageUrl result:', fullUrl);
  }
  
  return fullUrl;
}

export default getImageUrl



