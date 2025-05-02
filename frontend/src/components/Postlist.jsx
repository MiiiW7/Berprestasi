import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../config/constants";

const Postlist = () => {
  const [dataPost, setDataPost] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const postsResponse = await axios.get(`${BACKEND_URL}/post`);
        let posts = postsResponse.data.data || [];

        // Tambahkan logging
        console.log(
          "Fetched Posts:",
          posts.map((post) => ({
            id: post.id,
            title: post.title,
            creator: post.creator,
          }))
        );

        if (user && token) {
          try {
            const followedResponse = await axios.get(
              `${BACKEND_URL}/user/followed-posts`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const followedPostIds = followedResponse.data.data.map(
              (post) => post.id
            );
            posts = posts.map((post) => ({
              ...post,
              isFollowed: followedPostIds.includes(post.id),
            }));
          } catch (followError) {
            console.error("Error fetching followed posts:", followError);
          }
        }

        setDataPost(posts);
      } catch (err) {
        console.error("Error details:", err.response?.data || err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user, token]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  // State Loading
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );

  // State Error
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">
        Error: {error}
      </div>
    );

  // State Tidak Ada Post
  if (!dataPost || dataPost.length === 0)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-xl">
        Tidak ada post tersedia
      </div>
    );

  return (
    <div className="mx-6 my-6 justify-items-center">
      {/* Grid Responsif */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:w-[400px] md:w-[800px] lg:w-[800px] xl:w-[1000px]">
        {dataPost.map((post) => (
          <div key={post.id} className="h-full">
            <Post
              id={post.id}
              title={post.title}
              description={post.description}
              image={getImageUrl(post.image)}
              categories={post.categories}
              jenjangs={post.jenjangs}
              pelaksanaan={post.pelaksanaan}
              creator={post.creator}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Postlist;
