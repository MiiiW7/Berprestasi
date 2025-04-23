// src/pages/jenjangPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Post from "../components/Post";
import Footer from "../components/Footer";

const JenjangPage = () => {
  const { jenjang } = useParams();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:9000";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`; // Tambahkan ini
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${BACKEND_URL}/post/jenjang/${jenjang}`
        );
        console.log(response.data);
        if (response.data.success) {
          setPosts(response.data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [jenjang]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-xl font-bold mb-6">
            Lomba Jenjang: {jenjang}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:w-[400px] md:w-[800px] lg:w-[800px] xl:w-[1000px]">
            {posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                title={post.title}
                description={post.description}
                image={getImageUrl(post.image)}
                categories={post.categories}
                jenjangs={post.jenjangs}
                pelaksanaan={post.pelaksanaan}
                creator={post.creator}
              />
            ))}
          </div>
          {posts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada lomba dalam Jenjang ini
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default JenjangPage;
