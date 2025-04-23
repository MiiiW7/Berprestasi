// src/pages/DetailPost.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const DetailPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);


  const BACKEND_URL = "http://localhost:9000";

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BACKEND_URL}/post/${id}`);
        if (response.data.success) {
          const postData = response.data.data;
          // Add follower count to post data
          postData.followersCount = postData.followers ? postData.followers.length : 0;
          setPost(postData);
          setIsFollowed(
            user && postData.followers && postData.followers.includes(user.id)
          );
        }
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError(
          err.response?.data?.message || "Failed to load post details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [id, user, token]);

  // Tambahkan fungsi untuk mengambil daftar followers
  const fetchFollowers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/post/${id}/followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response)

      if (response.data.success) {
        setFollowers(response.data.data);
        console.log(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  // Format tanggal
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "Tanggal tidak tersedia";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  const handleFollow = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      const endpoint = isFollowed ? "unfollow" : "follow";
      const response = await axios.post(
        `${BACKEND_URL}/post/${id}/${endpoint}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Gunakan response dari backend
      if (response.data.success) {
        setIsFollowed(!isFollowed);
        // Optional: Tampilkan pesan sukses
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Detailed error following/unfollowing post:", error.response);

      // Tampilkan pesan error dari backend atau pesan default
      const errorMessage =
        error.response?.data?.message ||
        "Gagal mengikuti/berhenti mengikuti lomba. Silakan coba lagi.";

      alert(errorMessage);
    }
  };

  const handleBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#5b83c2]/5">
        <Navbar />
        <div className="container mx-auto p-4 flex justify-center items-center flex-grow">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5b83c2] border-t-transparent"></div>
            <p className="text-[#1d305f] font-medium">Memuat detail lomba...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#5b83c2]/5">
        <Navbar />
        <div className="container mx-auto p-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-[#1d305f] hover:text-[#5b83c2] transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </button>
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r">
            <p className="font-medium">Terjadi kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-[#5b83c2]/5">
        <Navbar />
        <div className="container mx-auto p-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-[#1d305f] hover:text-[#5b83c2] transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </button>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r">
            <p className="font-medium">Lomba tidak ditemukan</p>
            <p className="text-sm">Lomba yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#5b83c2]/5">
      <Navbar />
      <div className="w-full px-0 md:container md:mx-auto md:px-2 py-4 md:max-w-7xl">
        <div className="bg-white shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 p-2 md:p-4">
            {/* Image Section - Fixed on the left */}
            <div className="relative md:col-span-1">
              <div className="md:sticky md:top-20 md:h-[calc(100vh-120px)]">
                <div className="h-full rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(post.image)}
                    alt={post.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Content Section - Scrollable */}
            <div className="flex flex-col md:col-span-2 h-full">
              {/* Scrollable content */}
              <div className="md:max-h-[calc(100vh-220px)] md:overflow-y-auto">
                <div className="mb-4">
                  <h1 className="text-xl md:text-2xl font-bold text-[#1d305f] mb-2">
                    {post.title}
                  </h1>
                  <p className="text-[#bfbebf] text-sm mb-3">
                    Diposting oleh {post.creator?.name || "Unknown"}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-[#5b83c2]">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatTanggal(post.pelaksanaan)}
                    </span>
                    {/* Show follower count for everyone, but restrict viewing the list */}
                    {user && (user.role === "admin" || user.role === "penyelenggara") ? (
                      <button
                        onClick={() => {
                          fetchFollowers();
                          setShowFollowers(true);
                        }}
                        className="flex items-center hover:text-[#1d305f] transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {post.followersCount || 0} Peserta
                      </button>
                    ) : (
                      <div className="flex items-center text-[#5b83c2]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {post.followersCount || 0} Peserta
                      </div>
                    )}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none mb-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-[#1d305f] mb-1">Deskripsi Lomba</h3>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{post.description}</p>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#1d305f] mb-1">Kategori</h3>
                      <div className="flex flex-wrap gap-2">
                        {post.categories.map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5b83c2]/10 text-[#1d305f]"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#1d305f] mb-1">Jenjang</h3>
                      <div className="flex flex-wrap gap-2">
                        {post.jenjangs.map((jenjang, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fdd813]/20 text-[#1d305f]"
                          >
                            {jenjang}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#1d305f] mb-1">Link Detail Lomba</h3>
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#5b83c2] hover:text-[#1d305f] transition-colors"
                      >
                        {post.link}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed follow/unfollow button */}
              {user && user.role === "pendaftar" && (
                <div className="mt-auto pt-4 md:sticky md:bottom-0 bg-white">
                  <button
                    onClick={handleFollow}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2
                      ${isFollowed
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-[#fdd813] text-[#1d305f] hover:bg-yellow-400'
                      }`}
                  >
                    {isFollowed ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Berhenti Mengikuti</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span>Ikuti Lomba</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Followers Modal */}
        {showFollowers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-[#1d305f]">Daftar Peserta</h3>
                  <button
                    onClick={() => setShowFollowers(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[60vh]">
                  {followers.length > 0 ? (
                    <div className="space-y-4">
                      {followers.map((follower) => (
                        <div key={follower.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                          <img
                            src={getImageUrl(follower.profilePicture) || "/default-avatar.png"}
                            alt={follower.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-[#1d305f]">{follower.name}</p>
                            <p className="text-sm text-[#bfbebf]">{follower.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-[#bfbebf] py-4">Belum ada peserta yang mengikuti lomba ini</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center text-[#1d305f] hover:text-[#5b83c2] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Kembali
        </button>
      </div>
      <Footer className="w-full" />
    </div>
  );
};

export default DetailPost;