import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import { PORT, mongoDBURL } from "./config.js";
import adminRoutes from "./routes/adminRoute.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoute from './routes/searchRoute.js';
import './src/postSchedulerJob.js';

const app = express();

// Middleware untuk parsing req body
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS
app.use(cors());

// Set server timeout for all requests
app.use((req, res, next) => {
  // Set timeout to 2 minutes (120000ms)
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// No need to create local upload directories as we're using Cloudinary
console.log("Using Cloudinary for image storage");

app.get("/", (req, res) => {
  console.log("Root endpoint called");
  return res.status(200).json({ 
    message: "Hello World", 
    env: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      port: process.env.PORT
    }
  });
});

// Route admin
app.use('/admin', adminRoutes);

// Route post
app.use('/post', postRoutes);

// Route user
app.use('/user', userRoutes);

// Route Notif
app.use('/notifications', notificationRoutes);

app.use('/search', searchRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('ERROR DETAILS:');
  console.error(err.stack);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error code:', err.code);
  console.log(`Received ${req.method} request to ${req.path}`);
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  
  return res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message || 'Internal server error',
    path: req.path
  });
});

mongoose
  .connect(mongoDBURL, {})
  .then(() => {
    console.log("Database connected successfully");
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    
    // Set server-wide timeout
    server.timeout = 120000; // 2 minutes
  })
  .catch((err) => {
    console.log("MongoDB connection error:");
    console.log(err);
    console.log("MongoDB URL (masked):", mongoDBURL.replace(/:([^:@]+)@/, ':***@'));
  });

// Export app untuk Vercel serverless
export default app;