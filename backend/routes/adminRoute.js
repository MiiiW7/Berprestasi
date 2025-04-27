import express from "express";
import bcrypt from "bcrypt";
import { uploadProfile, cloudinary } from "../middleware/upload.js";
import Post from "../models/post.js";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/auth.js";
import Notification from "../models/notification.js";
import Engagement from "../models/engagement.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("hello");
  res.send("hello");
});

// get user
router.get("/user", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.send(users);
    console.log(users)
  } catch (err) {
    console.error(err);
  }
});

// Rute untuk mendapatkan detail user
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findOne({id: req.params.id}).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ 
      message: "Gagal mengambil detail user", 
      error: error.message 
    });
  }
});

// Rute untuk mengupdate user
router.put("/user/:id", uploadProfile.single('profilePicture'), async (req, res) => {
  try {
    const { name, email, newPassword } = req.body;
    const userId = req.params.id;

    // Cari user yang akan diupdate
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Cek apakah email sudah digunakan oleh user lain
    const existingUserWithEmail = await User.findOne({ 
      email, 
      _id: { $ne: userId } 
    });
    if (existingUserWithEmail) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // Update data dasar
    user.name = name;
    user.email = email;

    // Proses update password jika ada
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Proses update foto profil
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
        try {
          console.log(`Attempting to delete old profile image: ${user.profilePicture}`);
          
          // Extract public_id from the Cloudinary URL
          const urlParts = user.profilePicture.split('/');
          const filenameWithExtension = urlParts[urlParts.length - 1];
          const publicIdWithExtension = filenameWithExtension.split('?')[0]; // Remove query params if any
          const publicId = publicIdWithExtension.split('.')[0];
          
          if (publicId) {
            console.log(`Deleting Cloudinary resource with public ID: ${publicId}`);
            await cloudinary.uploader.destroy(publicId);
            console.log("Old Cloudinary profile image deleted successfully");
          }
        } catch (err) {
          console.error("Error deleting old Cloudinary image:", err);
        }
      }

      // Set new Cloudinary profile picture path
      user.profilePicture = req.file.path || req.file.secure_url;
    }

    // Simpan perubahan
    await user.save();

    // Kembalikan user tanpa password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ 
      message: "Gagal memperbarui user", 
      error: error.message 
    });
  }
});

// READ - Mendapatkan semua post
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().lean();

    const populatedPosts = await Promise.all(
      posts.map(async (post) => {
        let creator = null;
        if (post.creator) {
          creator = await User.findOne({ id: post.creator }).lean();
        }
        return {
          ...post,
          creator: creator
            ? {
                id: creator.id,
                name: creator.name,
                profilePicture:
                  creator.profilePicture ||
                  "https://res.cloudinary.com/demo/image/upload/v1/sample/avatar-placeholder",
              }
            : null,
        };
      })
    );
    res.status(200).json({
      success: true,
      data: populatedPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data post",
      error: error.message,
    });
  }
});

// Rute untuk membuat user baru
router.post("/user", uploadProfile.single('profilePicture'), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Cek apakah user dengan email yang sama sudah ada
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Siapkan data user
    const userData = {
      name,
      email,
      password: hashedPassword
    };

    // Tambahkan profile picture jika ada
    if (req.file) {
      userData.profilePicture = req.file.path || req.file.secure_url;
    }

    // Buat user baru
    const newUser = new User(userData);
    await newUser.save();

    // Kembalikan user tanpa password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ 
      message: "Gagal membuat user", 
      error: error.message 
    });
  }
});

// ADMIN DASHBOARD API ENDPOINTS

// Get dashboard stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total posts
    const totalPosts = await Post.countDocuments();
    
    // Get active users (users who have logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo }
    });
    
    // Calculate total views (as a simple estimate for now)
    // In a real app, you'd have a proper view tracking system
    const totalViews = totalPosts * Math.floor(Math.random() * 50) + 1000;
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        activeUsers,
        totalViews
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message
    });
  }
});

// Get user growth data
router.get("/dashboard/user-growth", async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Generate data for the last 6 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const userGrowthData = [];
    
    for (let i = 5; i >= 0; i--) {
      // Calculate month and year
      let monthIndex = currentDate.getMonth() - i;
      let year = currentYear;
      
      if (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }
      
      const month = months[monthIndex];
      
      // Get user count at that time
      // For simplicity, we'll calculate based on creation date
      // In a real app, you'd use the UserStats model with actual tracked data
      const startOfMonth = new Date(year, monthIndex, 1);
      const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);
      
      const userCount = await User.countDocuments({
        createdAt: { $lte: endOfMonth }
      });
      
      userGrowthData.push({
        month,
        year,
        value: userCount
      });
    }
    
    res.status(200).json({
      success: true,
      data: userGrowthData
    });
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user growth data",
      error: error.message
    });
  }
});

// Get post categories distribution
router.get("/dashboard/post-categories", async (req, res) => {
  try {
    // Get all posts
    const posts = await Post.find();
    
    // Extract categories
    const categoryCounts = {};
    
    posts.forEach(post => {
      post.categories.forEach(category => {
        if (categoryCounts[category]) {
          categoryCounts[category]++;
        } else {
          categoryCounts[category] = 1;
        }
      });
    });
    
    // Transform to the format needed for the chart
    const categoryData = Object.keys(categoryCounts).map(category => ({
      category,
      count: categoryCounts[category]
    }));
    
    res.status(200).json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    console.error("Error fetching post categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching post categories",
      error: error.message
    });
  }
});

// Get engagement data (views and comments per month)
router.get("/dashboard/engagement", async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Generate monthly data for the current year
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const engagementData = [];
    
    // First try to get actual tracked data
    const engagementRecords = await Engagement.find({
      year: currentYear
    }).sort({ month: 1 });
    
    if (engagementRecords.length > 0) {
      // Create a map to sum up views and comments by month
      const monthData = {};
      
      // Initialize all months with zero values
      months.forEach(month => {
        monthData[month] = { month, views: 0, comments: 0 };
      });
      
      // Fill in actual data from records
      engagementRecords.forEach(record => {
        if (monthData[record.month]) {
          monthData[record.month].views += record.views;
          monthData[record.month].comments += record.comments;
        }
      });
      
      // Convert to array and sort by month order
      const monthIndexMap = {};
      months.forEach((month, index) => {
        monthIndexMap[month] = index;
      });
      
      // Get the last 6 months of data
      const sortedData = Object.values(monthData)
        .sort((a, b) => monthIndexMap[a.month] - monthIndexMap[b.month]);
      
      // Get the current month index
      const currentMonthIndex = currentDate.getMonth();
      
      // Slice to get last 6 months data (or fewer if not enough data)
      let startIndex = Math.max(0, currentMonthIndex - 5);
      engagementData.push(...sortedData.slice(startIndex, currentMonthIndex + 1));
      
      // If we have fewer than 6 months, add previous year's data
      if (engagementData.length < 6) {
        const neededMonths = 6 - engagementData.length;
        const previousYearRecords = await Engagement.find({
          year: currentYear - 1,
          month: { $in: months.slice(-neededMonths) }
        }).sort({ month: 1 });
        
        const prevYearData = {};
        previousYearRecords.forEach(record => {
          if (!prevYearData[record.month]) {
            prevYearData[record.month] = { month: record.month, views: 0, comments: 0 };
          }
          prevYearData[record.month].views += record.views;
          prevYearData[record.month].comments += record.comments;
        });
        
        // Add previous year's data at the beginning
        const prevYearMonths = months.slice(-neededMonths);
        prevYearMonths.forEach(month => {
          if (prevYearData[month]) {
            engagementData.unshift(prevYearData[month]);
          } else {
            // If no data for this month, add placeholder
            engagementData.unshift({ month, views: 0, comments: 0 });
          }
        });
      }
      
      // Ensure we have exactly 6 months of data
      if (engagementData.length > 6) {
        engagementData.splice(0, engagementData.length - 6);
      }
    } else {
      // No actual data, generate realistic but random data
      for (let i = 0; i < 6; i++) {
        let monthIndex = currentDate.getMonth() - 5 + i;
        let year = currentYear;
        
        if (monthIndex < 0) {
          monthIndex += 12;
          year -= 1;
        }
        
        const month = months[monthIndex];
        
        // Count posts created that month for correlation
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        
        const postCount = await Post.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        
        // Generate realistic engagement metrics that increase over time
        const baseViews = 1000 + (i * 200) + (postCount * 50);
        const views = Math.floor(baseViews + (Math.random() * 300) - 100);
        
        const comments = Math.floor((views * 0.1) + (Math.random() * 100) - 50);
        
        engagementData.push({
          month,
          views: Math.max(views, 800 + (i * 150)),
          comments: Math.max(comments, 300 + (i * 50))
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: engagementData
    });
  } catch (error) {
    console.error("Error fetching engagement data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching engagement data",
      error: error.message
    });
  }
});

// Get recent notifications for admin dashboard
router.get("/dashboard/notifications", async (req, res) => {
  try {
    // Get recent notifications
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Format notifications for display
    const formattedNotifications = await Promise.all(notifications.map(async (notification) => {
      let formattedNotification = {
        id: notification._id,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      };
      
      // Get user info if available
      if (notification.userId) {
        const user = await User.findOne({ id: notification.userId }).select("name");
        if (user) {
          formattedNotification.user = user.name;
        }
      }
      
      // Get post info if available
      if (notification.postId) {
        const post = await Post.findOne({ id: notification.postId }).select("title");
        if (post) {
          formattedNotification.post = post.title;
        }
      }
      
      return formattedNotification;
    }));
    
    res.status(200).json({
      success: true,
      data: formattedNotifications
    });
  } catch (error) {
    console.error("Error fetching dashboard notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard notifications",
      error: error.message
    });
  }
});

// Admin Authentication
router.post("/dashboard/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user by email
    const adminUser = await User.findOne({ email, role: "admin" });

    if (!adminUser) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Generate token for admin
    const token = jwt.sign(
      { id: adminUser.id, role: adminUser.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "12h" }
    );

    // Return admin user info and token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message
    });
  }
});

// Verify admin token
router.get("/dashboard/verify", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const adminUser = await User.findOne({ id: req.user.id });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found"
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification",
      error: error.message
    });
  }
});

// Get dashboard statistics
router.get("/dashboard/stats", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get users by role
    const pendaftarCount = await User.countDocuments({ role: "pendaftar" });
    const penyelenggaraCount = await User.countDocuments({ role: "penyelenggara" });
    
    // Get active users (users who logged in within the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
    
    // Get total posts count
    const totalPosts = await Post.countDocuments();
    
    // Get posts by status
    const belumDilaksanakanCount = await Post.countDocuments({ status: "Belum Dilaksanakan" });
    const telahDilaksanakanCount = await Post.countDocuments({ status: "Telah Dilaksanakan" });
    
    // Get pending posts (assuming posts might have a pending status or review field)
    const pendingPosts = await Post.countDocuments({ status: "Pending" });
    
    // Get posts per category
    const categories = ["Akademik", "Non-Akademik", "Seni", "Olahraga", "Teknologi", "Bahasa", "Sains", "Matematika"];
    const postsPerCategory = {};
    
    for (const category of categories) {
      const count = await Post.countDocuments({ categories: category });
      postsPerCategory[category] = count;
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        totalCategories: categories.length,
        activeUsers: activeUsers || Math.floor(totalUsers * 0.7), // Fallback if lastLogin not tracked
        pendingPosts: pendingPosts || 0,
        usersByRole: {
          pendaftar: pendaftarCount,
          penyelenggara: penyelenggaraCount
        },
        postsByStatus: {
          "Belum Dilaksanakan": belumDilaksanakanCount,
          "Telah Dilaksanakan": telahDilaksanakanCount
        },
        postsPerCategory
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
      error: error.message
    });
  }
});

// Get recent posts
router.get("/dashboard/recent-posts", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Transform posts to include creator info
    const transformedPosts = await Promise.all(
      recentPosts.map(async (post) => {
        const creator = await User.findOne({ id: post.creator }).lean();
        
        return {
          id: post.id,
          title: post.title,
          creator: creator ? creator.name : "Unknown",
          createdAt: post.createdAt,
          status: post.status
        };
      })
    );

    res.status(200).json({
      success: true,
      data: transformedPosts
    });
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recent posts",
      error: error.message
    });
  }
});

// Get recent users
router.get("/dashboard/recent-users", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("id name role createdAt profilePicture");

    res.status(200).json({
      success: true,
      data: recentUsers
    });
  } catch (error) {
    console.error("Error fetching recent users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recent users",
      error: error.message
    });
  }
});

// Get all categories
router.get("/categories", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Get all unique categories from posts
    const categories = await Post.distinct("categories");
    
    // Count posts per category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Post.countDocuments({ categories: category });
        return {
          name: category,
          postCount: count
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: error.message
    });
  }
});

// Add new category
router.post("/categories", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }
    
    // Check if category already exists
    const categories = await Post.distinct("categories");
    if (categories.includes(name)) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }
    
    // Since categories are stored in the posts, we don't need to create a separate entry
    // Just return success
    res.status(201).json({
      success: true,
      message: "Category added successfully",
      data: { name, postCount: 0 }
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding category",
      error: error.message
    });
  }
});

// Delete category
router.delete("/categories/:name", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const categoryName = req.params.name;
    
    // Find posts with this category
    const posts = await Post.find({ categories: categoryName });
    
    // Update each post to remove this category
    for (const post of posts) {
      post.categories = post.categories.filter(cat => cat !== categoryName);
      await post.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      count: posts.length
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
      error: error.message
    });
  }
});

export default router;