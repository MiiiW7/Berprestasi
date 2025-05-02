export const BACKEND_URL = 'http://localhost:9000';

export const AVAILABLE_CATEGORIES = [
  "Akademik",
  "Non-Akademik",
  "Seni",
  "Olahraga",
  "Teknologi",
  "Bahasa",
  "Sains",
  "Matematika",
];

export const AVAILABLE_JENJANG = [
  "SD",
  "SMP",
  "SMA",
  "SMK",
  "Mahasiswa",
  "Umum"
];

export const POST_STATUS = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};

export const USER_ROLES = {
  PENDAFTAR: "pendaftar",
  PENYELENGGARA: "penyelenggara",
  ADMIN: "admin"
};

export const NOTIFICATION_TYPES = {
  SYSTEM: "system",
  POST: "post",
  USER: "user"
};

export const IMAGE_CONFIG = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  DEFAULT_PROFILE: '/default-profile.png',
  DEFAULT_POST: '/placeholder-image.jpg'
}; 