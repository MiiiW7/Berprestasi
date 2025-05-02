import instance from './axios';

// Constant URLs
const BACKEND_URL = instance.defaults.baseURL;

/**
 * Process image URL to handle both local and Cloudinary URLs
 * @param {string} imageUrl - The raw image URL from the API
 * @returns {string} - Properly formatted image URL
 */
export const getImageUrl = (imagePath, baseUrl = 'https://berprestasi-cloudinary.vercel.app') => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

/**
 * Get profile picture URL with fallback to default avatar
 * @param {string} profilePicture - The profile picture URL from the API
 * @returns {string} - Properly formatted profile picture URL
 */
export const getProfilePictureUrl = (imagePath, baseUrl = 'https://berprestasi-cloudinary.vercel.app') => {
  if (!imagePath) return '/default-profile.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Hanya file gambar (JPEG, PNG, GIF) yang diperbolehkan' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Ukuran file maksimal 2MB' };
  }

  return { valid: true };
};

export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}; 