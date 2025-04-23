/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    posts: [],
    users: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:9000";

  // Fungsi untuk mendapatkan URL gambar
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  // Fungsi untuk mendapatkan URL profile picture
  const getProfilePictureUrl = (profilePicture) => {
    console.log("Raw profilePicture:", profilePicture);
    
    // Default avatar URL (online)
    const defaultAvatarUrl = "https://ui-avatars.com/api/?name=User&background=1d305f&color=fff&size=100";
    
    // Handle null/undefined
    if (!profilePicture) {
      console.log("No profile picture provided, using default");
      return defaultAvatarUrl;
    }
    
    if (typeof profilePicture === "string") {
      // Handle empty string
      if (profilePicture.trim() === "") {
        console.log("Empty profile picture string, using default");
        return defaultAvatarUrl;
      }
      
      // Check if it's our default placeholder
      if (profilePicture === "/default-avatar.png") {
        console.log("Default avatar path detected, using online avatar");
        return defaultAvatarUrl;
      }
      
      // Handle backend paths (both with and without starting slash)
      if (profilePicture.startsWith("/uploads") || profilePicture.startsWith("uploads")) {
        // Make sure the path starts with /
        const normalizedPath = profilePicture.startsWith("/") 
          ? profilePicture 
          : `/${profilePicture}`;
          
        const fullUrl = `${BACKEND_URL}${normalizedPath}`;
        console.log("Constructed backend URL:", fullUrl);
        return fullUrl;
      }
      
      // Already a complete URL (http/https)
      if (profilePicture.startsWith("http")) {
        console.log("Using profile URL as is:", profilePicture);
        return profilePicture;
      }
      
      // Any other path pattern, assume it's in the backend
      console.log("Assuming backend path:", profilePicture);
      const normalizedPath = profilePicture.startsWith("/") 
        ? profilePicture 
        : `/${profilePicture}`;
      return `${BACKEND_URL}${normalizedPath}`;
    }
    
    console.log("Unknown profile picture format, using default");
    return defaultAvatarUrl;
  };

  // Format deadline seperti di trending dan post
  const formatDeadline = (deadlineDate) => {
    if (!deadlineDate) return "Tidak ada tanggal";
    
    const deadline = new Date(deadlineDate);
    const now = new Date();
    const diffTime = Math.abs(deadline - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Hari ini";
    } else if (diffDays === 1) {
      return "1 hari lagi";
    } else if (diffDays <= 7) {
      return `${diffDays} hari lagi`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} minggu lagi`;
    } else {
      return deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  // Ambil query dari URL saat komponen dimuat
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryFromUrl = searchParams.get('query');
    
    if (queryFromUrl) {
      setQuery(queryFromUrl);
      handleSearch(queryFromUrl);
    }
  }, [location.search]);

  // Fungsi pencarian
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery?.trim()) {
      setError('Masukkan kata kunci pencarian');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      // Update URL dengan query pencarian
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`, { replace: true });
      
      const response = await axios.get(`${BACKEND_URL}/search/search`, {
        params: { query: searchQuery }
      });
      
      console.log("Search response:", response.data);
  
      if (response.data && response.data.success) {
        // Tambahkan default profile picture jika tidak ada
        const processedPosts = response.data.data.posts.map(post => {
          // Combine creator and creatorDetails for consistency
          const creatorInfo = post.creator || {};
          
          return {
            ...post,
            creatorDetails: {
              ...creatorInfo,
              // Ensure we're getting the complete profilePicture path if it exists
              profilePicture: creatorInfo.profilePicture || '/default-avatar.png'
            }
          };
        });
        
        const processedUsers = response.data.data.users.map(user => ({
          ...user,
          // Ensure we're getting the complete profile picture path
          profilePicture: user.profilePicture || '/default-avatar.png'
        }));
        
        setResults({
          posts: processedPosts,
          users: processedUsers
        });
        
        console.log("Processed posts:", processedPosts);
        
        if (processedPosts.length === 0 && processedUsers.length === 0) {
          setError('Tidak ada hasil yang ditemukan');
        }
      } else {
        setError(response.data.message || 'Gagal mengambil hasil pencarian');
      }
    } catch (error) {
      console.error('Detailed Search Error:', error);
      
      // Tangani berbagai skenario error
      if (error.response) {
        // Error dari server
        setError(error.response.data.message || 'Terjadi kesalahan');
      } else if (error.request) {
        // Request terkirim tapi tidak ada response
        setError('Tidak dapat terhubung ke server');
      } else {
        // Error lainnya
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi submit pencarian
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Search Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1d305f] mb-2">Pencarian Lomba dan Penyelenggara</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Temukan berbagai lomba dan penyelenggara sesuai dengan minat dan bakatmu
          </p>
        </div>
      
        {/* Search Input */}
        <form onSubmit={handleSubmit} className="mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row shadow-lg rounded-lg overflow-hidden">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari lomba atau penyelenggara..."
              className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-[#5b83c2]"
            />
            <button 
              type="submit"
              className="bg-[#1d305f] hover:bg-[#5b83c2] text-white px-6 py-3 transition duration-300 font-medium"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span>Cari</span>
              </div>
            </button>
          </div>
        </form>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 border-b">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'posts' 
                ? 'border-b-2 border-[#1d305f] text-[#1d305f]' 
                : 'text-gray-500 hover:text-[#5b83c2]'
            }`}
          >
            Lomba ({results.posts.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'users' 
                ? 'border-b-2 border-[#1d305f] text-[#1d305f]' 
                : 'text-gray-500 hover:text-[#5b83c2]'
            }`}
          >
            Penyelenggara ({results.users.length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5b83c2] border-t-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded max-w-4xl mx-auto mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hasil Pencarian Lomba */}
        {!isLoading && activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {results.posts.map((post) => (
              <Link to={`/post/${post.id}`} key={post.id} className="block w-full h-full">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300 flex flex-col h-full">
                  <div className="relative h-64">
                    <img 
                      src={getImageUrl(post.image)} 
                      alt={post.title}
                      className="w-full h-full object-contain bg-gray-100"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <div className="absolute top-0 right-0 bg-[#fdd813] text-[#1d305f] px-3 py-1 m-2 rounded-full text-xs font-medium shadow-sm">
                      {formatDeadline(post.pelaksanaan)}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h2 className="font-bold text-[#1d305f] text-lg mb-2.5 hover:text-[#5b83c2] transition-colors line-clamp-2 h-12">
                      {post.title}
                    </h2>
                    
                    <div className="space-y-1.5 mb-2 min-h-[50px]">
                      {/* Kategori */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.categories.slice(0, 2).map((category, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Jenjang */}
                      {post.jenjangs && post.jenjangs.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.jenjangs.slice(0, 2).map((jenjang, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700"
                            >
                              {jenjang}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-1.5 flex items-center text-gray-500 text-sm border-t border-gray-100">
                      <div className="flex items-center">
                        <img
                          src={getProfilePictureUrl(post.creatorDetails?.profilePicture)}
                          alt={post.creatorDetails?.name || "Unknown Creator"}
                          className="w-5 h-5 rounded-full object-cover border border-gray-200 mr-1.5"
                          onError={(e) => {
                            console.log("Profile image error, using online avatar");
                            e.target.src = "https://ui-avatars.com/api/?name=User&background=1d305f&color=fff&size=100";
                          }}
                        />
                        <span className="text-xs font-medium text-gray-700 truncate">
                          {post.creatorDetails?.name || "Unknown Creator"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Hasil Pencarian Penyelenggara */}
        {!isLoading && activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {results.users.map((user) => (
              <Link to={`/profile/${user.id}`} key={user.id} className="block">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300 p-6">
                  <div className="flex flex-col items-center">
                    <img 
                      src={getProfilePictureUrl(user.profilePicture)} 
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-[#5b83c2]"
                      onError={(e) => {
                        console.log("User profile image error, using online avatar");
                        e.target.src = "https://ui-avatars.com/api/?name=User&background=1d305f&color=fff&size=100";
                      }}
                    />
                    <h3 className="font-bold text-[#1d305f] text-lg mb-1">{user.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                    
                    <div className="flex items-center mb-4 text-sm text-gray-500">
                      <svg className="w-5 h-5 mr-2 text-[#5b83c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">{user.postCount || 0} Lomba Dibuat</span>
                    </div>
                    
                    <button className="mt-2 w-full py-2 bg-[#1d305f] hover:bg-[#5b83c2] text-white rounded-lg transition duration-300 flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Lihat Profil
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Tidak ada hasil */}
        {!isLoading && activeTab === 'posts' && results.posts.length === 0 && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Tidak ada lomba ditemukan</h3>
            <p className="text-gray-500">Coba kata kunci lain atau filter yang berbeda</p>
          </div>
        )}
        
        {!isLoading && activeTab === 'users' && results.users.length === 0 && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Tidak ada penyelenggara ditemukan</h3>
            <p className="text-gray-500">Coba kata kunci lain atau filter yang berbeda</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;