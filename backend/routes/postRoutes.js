import express from "express";
import { uploadPost, cloudinary } from "../middleware/upload.js";
import Post from "../models/post.js";
import { User } from "../models/user.js";
import { verifyToken } from "../middleware/auth.js";
import Notification from "../models/notification.js";
import Engagement from "../models/engagement.js";

const router = express.Router();

// CREATE - Membuat post baru
router.post("/", verifyToken, uploadPost.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const categories = JSON.parse(req.body.categories); // Ubah ini untuk mengurai string JSON
    const jenjangs = JSON.parse(req.body.jenjangs); // Ubah ini untuk mengurai string JSON

    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      categories: categories,
      jenjangs: jenjangs,
      creator: req.user.id,
      pelaksanaan: new Date(req.body.pelaksanaan),
      link: req.body.link || "",
      image: req.file.path || req.file.secure_url,
      status: req.body.status || "Belum Dilaksanakan",
    });

    const savedPost = await post.save();

    // Create notification for admin dashboard
    const newPostNotification = new Notification({
      userId: req.user.id,
      postId: savedPost.id,
      message: `Postingan baru dibuat: "${savedPost.title}"`,
      type: 'general'
    });
    await newPostNotification.save();

    res.status(201).json({
      message: "Post created successfully",
      data: savedPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      message: "Error creating post",
      error: error.message,
    });
  }
});

// READ - Mendapatkan semua post
router.get("/", async (req, res) => {
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
          creator: creator ? { 
            id: creator.id, 
            name: creator.name,
            profilePicture: creator.profilePicture || 'https://res.cloudinary.com/demo/image/upload/v1/sample/avatar-placeholder'
          } : null,
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

// GET - Mendapatkan lomba trending berdasarkan jumlah follower
// PENTING: Pindahkan endpoint trending sebelum endpoint dengan parameter dinamis
router.get("/trending", async (req, res) => {
  try {
    console.log("Fetching trending posts...");
    
    // Periksa apakah ada post di database
    const postCount = await Post.countDocuments();
    console.log(`Total posts in database: ${postCount}`);
    
    if (postCount === 0) {
      console.log("No posts found in database");
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Aggregate pipeline untuk mengurutkan post berdasarkan jumlah followers
    const posts = await Post.aggregate([
      // Tambahkan field followersCount yang menghitung panjang array followers
      { 
        $addFields: { 
          followersCount: { 
            $size: { 
              $ifNull: ["$followers", []] 
            } 
          } 
        } 
      },
      // Urutkan berdasarkan followersCount secara descending
      { $sort: { followersCount: -1 } },
      // Batasi hasil ke 10 dokumen
      { $limit: 10 }
    ]);
    
    console.log(`Found ${posts.length} trending posts`);
    
    // Populasikan informasi creator untuk setiap post
    const populatedPosts = await Promise.all(
      posts.map(async (post) => {
        const creator = await User.findOne({ id: post.creator }).lean();
        console.log(`Processing post ${post.id} created by ${post.creator}`);
        return {
          ...post,
          creator: creator ? { 
            id: creator.id, 
            name: creator.name,
            profilePicture: creator.profilePicture || 'https://res.cloudinary.com/demo/image/upload/v1/sample/avatar-placeholder'
          } : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedPosts,
    });
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trending posts",
      error: error.message,
    });
  }
});

// READ - Mendapatkan satu post berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ id: id }).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan",
      });
    }

    // Tambahkan ini untuk mengambil data creator
    const creator = await User.findOne({ id: post.creator }).lean();

    // Gabungkan data post dengan data creator
    const postWithCreator = {
      ...post,
      creator: creator ? { 
        id: creator.id, 
        name: creator.name, 
        profilePicture: creator.profilePicture || 'https://res.cloudinary.com/demo/image/upload/v1/sample/avatar-placeholder'
      } : null,
    };

    res.status(200).json({
      success: true,
      data: postWithCreator,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil detail post",
      error: error.message,
    });
  }
});

// berdasarkan id pembuat
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verifikasi akses berdasarkan peran
    if (req.user.id !== userId && req.user.role !== "admin") {
      if (req.user.role === "pendaftar") {
        // Pendaftar hanya bisa melihat post yang dipublish
        const publishedPosts = await Post.find({
          creator: userId,
          status: "published",
        });
        return res.status(200).json({
          success: true,
          data: publishedPosts,
        });
      } else if (req.user.role !== "penyelenggara") {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki izin untuk mengakses post ini",
        });
      }
    }

    // Penyelenggara atau admin bisa melihat semua post
    const posts = await Post.find({ creator: userId });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error in /user/:userId:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil post",
      error: error.message,
    });
  }
});

// Berdasarkan Kategori
router.get("/kategori/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const posts = await Post.find({
      categories: category,
    }).lean();

    const populatedPosts = await Promise.all(
      posts.map(async (post) => {
        const creator = await User.findOne({ id: post.creator }).lean();
        return {
          ...post,
          creator: creator ? { id: creator.id, name: creator.name, profilePicture: creator.profilePicture } : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching posts by category",
      error: error.message,
    });
  }
});

// Berdasarkan Jenjang
router.get("/jenjang/:jenjang", async (req, res) => {
  try {
    const { jenjang } = req.params;
    const posts = await Post.find({
      jenjangs: jenjang,
    }).lean();

    const populatedPosts = await Promise.all(
      posts.map(async (post) => {
        const creator = await User.findOne({ id: post.creator }).lean();
        return {
          ...post,
          creator: creator ? { id: creator.id, name: creator.name, profilePicture: creator.profilePicture } : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching posts by category",
      error: error.message,
    });
  }
});

// UPDATE - Memperbarui post berdasarkan ID
router.put("/:id", verifyToken, uploadPost.single("image"), async (req, res) => {
  console.log(`Starting update for post ID: ${req.params.id}`);
  console.log(`Request has image: ${!!req.file}`);
  
  try {
    // Validate post exists first
    const existingPost = await Post.findOne({ id: req.params.id });
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan",
      });
    }
    
    console.log("Parsing categories and jenjangs");
    let categories;
    try {
      // Parse categories dan ambil array yang unik (tidak duplikat)
      const parsedCategories = JSON.parse(req.body.categories);
      // Filter hanya kategori yang valid (tidak terpecah menjadi karakter)
      categories = parsedCategories.filter((cat) =>
        [
          "Matematika",
          "Sains",
          "Bahasa",
          "Seni",
          "Olahraga",
          "Teknologi",
        ].includes(cat)
      );
      console.log(`Categories parsed successfully: ${categories.join(', ')}`);
    } catch (parseError) {
      console.error("Error parsing categories:", parseError);
      return res.status(400).json({
        success: false,
        message: "Format kategori tidak valid",
        error: parseError.message,
      });
    }

    let jenjangs;
    try {
      // Parse categories dan ambil array yang unik (tidak duplikat)
      const parsedJenjangs = JSON.parse(req.body.jenjangs);
      // Filter hanya kategori yang valid (tidak terpecah menjadi karakter)
      jenjangs = parsedJenjangs.filter((cat) =>
        ["SD", "SMP", "SMA", "SMK", "Mahasiswa", "Umum"].includes(cat)
      );
      console.log(`Jenjangs parsed successfully: ${jenjangs.join(', ')}`);
    } catch (parseError) {
      console.error("Error parsing jenjangs:", parseError);
      return res.status(400).json({
        success: false,
        message: "Format jenjang tidak valid",
        error: parseError.message,
      });
    }

    // Prepare update data
    let updateData = {
      title: req.body.title,
      description: req.body.description,
      categories: categories,
      jenjangs: jenjangs,
      pelaksanaan: new Date(req.body.pelaksanaan),
      link: req.body.link || "",
      status: req.body.status,
    };
    
    // Handle image update if needed
    if (req.file) {
      console.log("Processing new image upload");
      console.log(`New image info: ${JSON.stringify({
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      })}`);

      // Set the new image URL
      updateData.image = req.file.path || req.file.secure_url;
      
      // Delete old image from Cloudinary
      if (existingPost.image && existingPost.image.includes('cloudinary')) {
        try {
          console.log(`Attempting to delete old image: ${existingPost.image}`);
          
          // Extract public_id from the Cloudinary URL
          const urlParts = existingPost.image.split('/');
          const filenameWithExtension = urlParts[urlParts.length - 1];
          const publicIdWithExtension = filenameWithExtension.split('?')[0]; // Remove query params if any
          const publicId = publicIdWithExtension.split('.')[0];
          
          if (publicId) {
            console.log(`Deleting Cloudinary resource with public ID: ${publicId}`);
            await cloudinary.uploader.destroy(publicId);
            console.log("Old Cloudinary post image deleted successfully");
          } else {
            console.log("Could not extract valid public ID from image URL");
          }
        } catch (err) {
          // Just log the error, but don't fail the update
          console.error("Error deleting old Cloudinary image:", err);
          console.error("Error details:", {
            name: err.name,
            message: err.message,
            stack: err.stack
          });
        }
      }
    } else {
      console.log("No new image uploaded, keeping existing image");
    }

    console.log("Updating post in database");
    const updatedPost = await Post.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true }
    );

    if (!updatedPost) {
      console.error(`Post not found during update. ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan saat mengupdate",
      });
    }

    // Get creator data
    console.log(`Fetching creator data for ID: ${updatedPost.creator}`);
    const creator = await User.findOne({ id: updatedPost.creator }).lean();

    // Combine post with creator data
    const postWithCreator = {
      ...updatedPost.toObject(),
      creator: creator ? { id: creator.id, name: creator.name } : null,
    };

    console.log(`Post updated successfully. ID: ${updatedPost.id}`);
    res.status(200).json({
      success: true,
      message: "Post berhasil diperbarui",
      data: postWithCreator,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Handle timeouts specifically
    if (error.name === 'TimeoutError') {
      return res.status(504).json({
        success: false,
        message: "Waktu upload gambar habis. Coba lagi dengan gambar yang lebih kecil atau koneksi yang lebih stabil.",
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui post",
      error: error.message,
    });
  }
});

// DELETE - Menghapus post berdasarkan ID
router.delete("/:id", verifyToken, async (req, res) => {
  console.log(`Starting deletion for post ID: ${req.params.id}`);
  
  try {
    const post = await Post.findOne({ id: req.params.id });

    if (!post) {
      console.log(`Post not found for deletion. ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan",
      });
    }

    // Hapus file gambar dari Cloudinary jika ada
    if (post.image && post.image.includes('cloudinary')) {
      try {
        console.log(`Attempting to delete image: ${post.image}`);
        
        // Extract public_id from the Cloudinary URL
        const urlParts = post.image.split('/');
        const filenameWithExtension = urlParts[urlParts.length - 1];
        const publicIdWithExtension = filenameWithExtension.split('?')[0]; // Remove query params if any
        const publicId = publicIdWithExtension.split('.')[0];
        
        if (publicId) {
          console.log(`Deleting Cloudinary resource with public ID: ${publicId}`);
          const deleteResult = await cloudinary.uploader.destroy(publicId);
          console.log(`Cloudinary deletion result: ${JSON.stringify(deleteResult)}`);
        } else {
          console.log("Could not extract valid public ID from image URL");
        }
      } catch (err) {
        // Log the error but continue with post deletion
        console.error("Error deleting Cloudinary image:", err);
        console.error("Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
    } else {
      console.log("No Cloudinary image to delete");
    }

    // Delete the post from the database
    console.log(`Deleting post from database. ID: ${req.params.id}`);
    const deleteResult = await Post.findOneAndDelete({ id: req.params.id });
    console.log(`Deletion result: ${deleteResult ? 'Success' : 'No post deleted'}`);

    res.status(200).json({
      success: true,
      message: "Post berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus post",
      error: error.message,
    });
  }
});

// Follow a post
router.post("/:postId/follow", verifyToken, async (req, res) => {
  try {
    // Pastikan hanya pendaftar yang bisa follow
    if (req.user.role !== "pendaftar") {
      return res.status(403).json({
        success: false,
        message: "Hanya pendaftar yang dapat mengikuti lomba",
      });
    }

    // Cari user untuk mendapatkan nama
    const user = await User.findOne({ id: req.user.id });
    const post = await Post.findOne({ id: req.params.postId });

    if (!user || !post) {
      return res.status(404).json({
        success: false,
        message: "User atau Post tidak ditemukan",
      });
    }

    // Cek apakah sudah follow
    if (post.followers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah mengikuti lomba ini",
      });
    }

    // Tambahkan follower
    post.followers.push(req.user.id);
    await post.save();

    // Buat notifikasi untuk penyelenggara
    const notification = new Notification({
      userId: post.creator, // ID penyelenggara
      postId: post.id,
      message: `${user.name} mengikuti lomba ${post.title}`,
      type: "follow",
      isRead: false, // Pastikan notifikasi baru belum dibaca
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Berhasil mengikuti lomba",
    });
  } catch (error) {
    console.error("Error following post:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengikuti lomba",
      error: error.message,
    });
  }
});

// Unfollow a post
router.post("/:postId/unfollow", verifyToken, async (req, res) => {
  try {
    // Pastikan hanya pendaftar yang bisa unfollow
    if (req.user.role !== "pendaftar") {
      return res.status(403).json({
        success: false,
        message: "Hanya pendaftar yang dapat berhenti mengikuti lomba",
      });
    }

    const post = await Post.findOne({ id: req.params.postId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan",
      });
    }

    // Hapus follower
    post.followers = post.followers.filter(
      (followerId) => followerId !== req.user.id
    );
    await post.save();

    res.status(200).json({
      success: true,
      message: "Berhasil berhenti mengikuti lomba",
    });
  } catch (error) {
    console.error("Error unfollowing post:", error);
    res.status(500).json({
      success: false,
      message: "Gagal berhenti mengikuti lomba",
      error: error.message,
    });
  }
});

// Di postRoutes.js
router.get("/check-status-manually", async (req, res) => {
  try {
    const now = new Date();
    console.log("Current date:", now);

    // Cari post yang seharusnya diupdate
    const postsToUpdate = await Post.find({
      pelaksanaan: { $lte: now },
      status: "Belum Dilaksanakan",
    });

    console.log(
      "Posts to update:",
      postsToUpdate.map((post) => ({
        id: post.id,
        title: post.title,
        pelaksanaan: post.pelaksanaan,
        status: post.status,
      }))
    );

    // Lakukan update manual
    const updateResult = await Post.updateMany(
      {
        pelaksanaan: { $lte: now },
        status: "Belum Dilaksanakan",
      },
      { $set: { status: "Sedang Dilaksanakan" } }
    );

    res.json({
      message: "Status check completed",
      currentDate: now,
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      postsToUpdate: postsToUpdate,
    });
  } catch (error) {
    console.error("Error in manual status check:", error);
    res.status(500).json({
      message: "Error checking status",
      error: error.message,
    });
  }
});

// Di postRoutes.js, tambahkan route baru
router.get("/:postId/followers", verifyToken, async (req, res) => {
  try {
    // Pastikan hanya penyelenggara yang membuat post bisa melihat followers
    const post = await Post.findOne({ id: req.params.postId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post tidak ditemukan",
      });
    }

    // Cek apakah user yang request adalah pembuat post
    if (post.creator !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki izin",
      });
    }

    console.log("Fetching followers for post:", post.id);
    console.log("Followers list:", post.followers);

    // Ambil detail followers
    const followers = await User.find({
      id: { $in: post.followers },
    }).select("id name email nomor profilePicture");

    console.log("Found followers:", followers.length);
    // Log each follower for debugging
    followers.forEach(follower => {
      console.log(`Follower ${follower.name} (${follower.id}) - Profile picture: ${follower.profilePicture}`);
    });

    res.status(200).json({
      success: true,
      data: followers,
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar peserta",
      error: error.message,
    });
  }
});

// Track post view
router.post("/:postId/view", async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Check if post exists
    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }
    
    // Get current date info
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'short' });
    const year = now.getFullYear();
    
    // Find or create engagement record
    let engagement = await Engagement.findOne({ 
      postId,
      month,
      year
    });
    
    if (engagement) {
      // Update existing record
      engagement.views += 1;
      await engagement.save();
    } else {
      // Create new record
      engagement = new Engagement({
        postId,
        month,
        year,
        views: 1,
        comments: 0
      });
      await engagement.save();
    }
    
    res.status(200).json({
      success: true,
      message: "View recorded successfully"
    });
  } catch (error) {
    console.error("Error recording view:", error);
    res.status(500).json({
      success: false,
      message: "Error recording view",
      error: error.message
    });
  }
});

// Track post comment
router.post("/:postId/comment", async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Check if post exists
    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }
    
    // Get current date info
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'short' });
    const year = now.getFullYear();
    
    // Find or create engagement record
    let engagement = await Engagement.findOne({ 
      postId,
      month,
      year
    });
    
    if (engagement) {
      // Update existing record
      engagement.comments += 1;
      await engagement.save();
    } else {
      // Create new record
      engagement = new Engagement({
        postId,
        month,
        year,
        views: 0,
        comments: 1
      });
      await engagement.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Comment recorded successfully"
    });
  } catch (error) {
    console.error("Error recording comment:", error);
    res.status(500).json({
      success: false,
      message: "Error recording comment",
      error: error.message
    });
  }
});

export default router;
