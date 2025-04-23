/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const ProfilePenyelenggara = () => {
  const navigate = useNavigate();
  const { user, updateProfile, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nomor: user?.nomor || '',
  });
  const [imageErrors, setImageErrors] = useState({});
  const [profileImageError, setProfileImageError] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe dan ukuran file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        alert('Hanya file gambar (JPEG, PNG, GIF) yang diperbolehkan');
        return;
      }

      if (file.size > maxSize) {
        alert('Ukuran file maksimal 2MB');
        return;
      }

      setProfilePicture(file);

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Buat FormData untuk mengirim data
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('nomor', formData.nomor);
    
    // Tambahkan profile picture jika ada
    if (profilePicture) {
      submitData.append('profilePicture', profilePicture);
    }

    try {
      const response = await axios.put(
        'http://localhost:9000/user/profile', 
        submitData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      // Update profil di context atau state
      updateProfile(response.data.data);
      
      // Reset state editing
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Tangani error
    }
  };

  // Fungsi untuk mendapatkan URL gambar profil
  const getProfilePictureUrl = () => {
    // If we already know this profile image failed, return default immediately
    if (profileImageError) {
      return '/default-avatar.png';
    }
    
    // Jika ada preview image (baru diupload), gunakan preview
    if (previewImage) return previewImage;
    
    // Jika ada foto profil dari user, gunakan URL backend
    if (user?.profilePicture) {
      return `http://localhost:9000${user.profilePicture}`;
    }
    
    // Jika tidak ada, gunakan default
    return '/default-avatar.png';
  };

  const BACKEND_URL = "http://localhost:9000";

  const fetchUserPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/post/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setPosts(response.data.data);
        console.log(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      await axios.delete(`${BACKEND_URL}/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh posts after deletion
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      setError(
        "Failed to delete post: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  useEffect(() => {
    if (user && user.role === "penyelenggara") {
      fetchUserPosts();
    }
  }, [user]);

  const getImageUrl = (imagePath, postId) => {
    // If we've already had an error for this image, return placeholder immediately
    if (imageErrors[postId]) {
      return "/placeholder-image.jpg";
    }
    
    if (!imagePath) return "/placeholder-image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    console.log("Constructing image URL for post:", imagePath);
    return `${BACKEND_URL}${imagePath}`;
  };

  if (user.role !== "penyelenggara") {
    return <div>Anda tidak memiliki akses ke halaman ini.</div>;
  }

  return (
    <div className="min-h-screen bg-[#5b83c2]/5">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#1d305f] hover:text-[#5b83c2] mb-6"
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

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Left Section - Profile Picture */}
            <div className="w-full md:w-1/3 p-6 md:p-8 bg-gradient-to-br from-[#1d305f] to-[#5b83c2] flex flex-col items-center justify-center">
              <div className="relative group">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={!isEditing}
                />
                <label
                  htmlFor={isEditing ? "profilePicture" : undefined}
                  className="cursor-pointer block"
                >
                  <div className="relative">
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        console.log("Profile image error, using default");
                        e.target.src = "/default-avatar.png";
                        setProfileImageError(true);
                      }}
                    />
                    {isEditing && (
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm">Ubah Foto</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
              <h2 className="mt-4 text-xl md:text-2xl font-bold text-white text-center">{user.name}</h2>
              <p className="text-[#fdd813] mt-1">Penyelenggara</p>
            </div>

            {/* Right Section - Profile Info */}
            <div className="w-full md:w-2/3 p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1d305f] mb-4">Informasi Profil</h3>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b83c2] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b83c2] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                      <input
                        type="tel"
                        name="nomor"
                        value={formData.nomor}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b83c2] focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setPreviewImage(null);
                          setProfilePicture(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1d305f] text-white rounded-lg hover:bg-[#5b83c2] transition-colors"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-[#1d305f]">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nomor Telepon</p>
                        <p className="font-medium text-[#1d305f]">{user.nomor || "-"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 w-full sm:w-auto px-4 py-2 bg-[#fdd813] text-[#1d305f] rounded-lg hover:bg-yellow-400 transition-colors inline-flex items-center justify-center sm:justify-start"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Profil
                    </button>
                  </>
                )}
              </div>

              {/* Stats Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-[#1d305f] mb-4">Statistik</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[#5b83c2]/5 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-[#1d305f]">{posts.length}</p>
                    <p className="text-sm text-gray-500">Total Lomba</p>
                  </div>
                  <div className="bg-[#5b83c2]/5 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-[#1d305f]">
                      {posts.filter(post => post.status === "Sedang Dilaksanakan").length}
                    </p>
                    <p className="text-sm text-gray-500">Lomba Aktif</p>
                  </div>
                  <div className="bg-[#5b83c2]/5 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-[#1d305f]">
                      {posts.filter(post => post.status === "Telah Dilaksanakan").length}
                    </p>
                    <p className="text-sm text-gray-500">Lomba Selesai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-6">
            <h2 className="text-xl font-bold text-[#1d305f]">Lomba Yang Diselenggarakan</h2>
            <Link
              to="/create-post"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-[#1d305f] text-white rounded-lg hover:bg-[#5b83c2] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Buat Lomba Baru
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5b83c2] border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 mb-4">Anda belum membuat lomba apapun</p>
              <Link
                to="/create-post"
                className="inline-flex items-center px-4 py-2 bg-[#1d305f] text-white rounded-lg hover:bg-[#5b83c2] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Buat Lomba Pertama
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={getImageUrl(post.image, post.id)}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("Post image error, using placeholder");
                        e.target.src = "/placeholder-image.jpg";
                        setImageErrors(prev => ({...prev, [post.id]: true}));
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#1d305f] mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.categories?.map((category, index) => (
                        <span
                          key={index}
                          className="inline-block bg-[#5b83c2]/10 text-[#1d305f] text-xs px-2 py-1 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.status === "Belum Dilaksanakan"
                          ? "bg-yellow-100 text-yellow-800"
                          : post.status === "Sedang Dilaksanakan"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {post.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/post/${post.id}`}
                          className="text-[#5b83c2] hover:text-[#1d305f] font-medium"
                        >
                          Detail
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm('Apakah Anda yakin ingin menghapus lomba ini?')) {
                              deletePost(post.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Hapus Lomba"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePenyelenggara;
