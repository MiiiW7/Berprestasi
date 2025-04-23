import dotenv from 'dotenv'
dotenv.config()

// Log environment variables status
console.log('Environment check:');
console.log('MONGODB_URL exists:', !!process.env.MONGODB_URL);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('PORT exists:', !!process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

export const PORT = process.env.PORT || 3000;
export const mongoDBURL = process.env.MONGODB_URL;
export const JWT_SECRET = process.env.JWT_SECRET;

