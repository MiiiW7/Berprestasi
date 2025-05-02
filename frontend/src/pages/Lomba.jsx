// src/pages/Lomba.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navbar";
import Post from "../components/Post";
import { BACKEND_URL } from "../config/constants";

const Lomba = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user || !token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let response;

        if (user.role === "pendaftar") {
          // Untuk pendaftar, ambil lomba yang diikuti
          response = await axios.get(`${BACKEND_URL}/user/followed-posts`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(response);
        } else if (user.role === "penyelenggara") {
          // Untuk penyelenggara, ambil lomba yang dibuat
          response = await axios.get(`${BACKEND_URL}/post/user/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          console.log(response);
        }

        setPosts(response.data.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError(error.response?.data?.message || "Gagal mengambil data lomba");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user, token]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Silakan login terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">
          {user.role === "pendaftar"
            ? "Lomba yang Diikuti"
            : "Lomba yang Dibuat"}
        </h1>

        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {user.role === "pendaftar"
              ? "Anda belum mengikuti lomba apapun"
              : "Anda belum membuat lomba"}
          </div>
        )}

        <div className="justify-items-center">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:w-[400px] md:w-[800px] lg:w-[800px] xl:w-[1000px]">
            {posts.map((post) => (
              <Post
                key={post._id}
                id={post.id}
                title={post.title}
                description={post.description}
                image={getImageUrl(post.image)}
                categories={post.categories}
                jenjangs={post.jenjangs}
                pelaksanaan={post.pelaksanaan}
                profilePicture={post.creator?.profilePicture}
                creatorName={post.creator?.name || "Unknown"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lomba;
