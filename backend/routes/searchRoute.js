import express from "express";
import Post from "../models/post.js";
import { User } from "../models/user.js";

const router = express.Router();

router.get("/search", async (req, res) => {
    try {
      const { query } = req.query;
  
      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Query parameter is required",
        });
      }
  
      // Pencarian post dengan $or operator
      const posts = await Post.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { categories: { $regex: query, $options: "i" } },
          { jenjangs: { $regex: query, $options: "i" } },
        ],
      }).lean(); // Gunakan .lean() untuk performa lebih baik
  
      // Pencarian users berdasarkan ID kustom
      const users = await User.find({
        role: "penyelenggara",
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { id: { $regex: query, $options: "i" } } // Tambahkan pencarian berdasarkan ID kustom
        ],
      }).lean();
  
      // Populate creator untuk posts
      const populatedPosts = await Promise.all(
        posts.map(async (post) => {
          const creator = await User.findOne({ id: post.creator }).lean();
          return {
            ...post,
            creator: creator 
              ? { 
                  id: creator.id, 
                  name: creator.name, 
                  email: creator.email,
                  profilePicture: creator.profilePicture || '/uploads/profiles/default-avatar.png'
                } 
              : null,
          };
        })
      );
  
      // Log untuk debugging
      console.log("Search Query:", query);
      console.log("Posts Found:", populatedPosts.length);
      console.log("Users Found:", users.length);
  
      // Jika tidak ada hasil, kirim respons khusus
      if (populatedPosts.length === 0 && users.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Tidak ada hasil yang ditemukan",
          data: {
            posts: [],
            users: [],
          },
        });
      }
  
      res.status(200).json({
        success: true,
        data: {
          posts: populatedPosts.map((post) => ({
            id: post.id,
            title: post.title,
            description: post.description,
            image: post.image,
            categories: post.categories,
            jenjangs: post.jenjangs,
            pelaksanaan: post.pelaksanaan,
            creator: post.creator,
          })),
          users: users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
          })),
        },
      });
    } catch (error) {
      console.error("Detailed Search Error Backend:", {
        message: error.message,
        stack: error.stack,
      });
  
      res.status(500).json({
        success: false,
        message: "Error searching",
        error: error.message,
      });
    }
  });

export default router;
