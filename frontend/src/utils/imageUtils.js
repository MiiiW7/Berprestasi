import instance from './axios';

// Constant URLs
const BACKEND_URL = instance.defaults.baseURL;

/**
 * Process image URL to handle both local and Cloudinary URLs
 * @param {string} imageUrl - The raw image URL from the API
 * @returns {string} - Properly formatted image URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "/default-avatar.png";
  
  // If it's already a full URL (Cloudinary URLs are https://...)
  if (imageUrl.startsWith('http')) {
    console.log("Using direct URL:", imageUrl);
    return imageUrl;
  }
  
  // Handle cloudinary URLs
  if (imageUrl.includes('cloudinary')) {
    console.log("Detected Cloudinary URL:", imageUrl);
    // It might be a partial URL without protocol
    if (!imageUrl.startsWith('https://')) {
      return `https://${imageUrl.replace(/^\/+/, '')}`;
    }
    return imageUrl;
  }
  
  // Handle backend paths
  console.log("Using backend URL:", `${BACKEND_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`);
  return `${BACKEND_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

/**
 * Get profile picture URL with fallback to default avatar
 * @param {string} profilePicture - The profile picture URL from the API
 * @returns {string} - Properly formatted profile picture URL
 */
export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture || profilePicture.trim() === '') {
    return "/default-avatar.png";
  }
  
  return getImageUrl(profilePicture);
}; 