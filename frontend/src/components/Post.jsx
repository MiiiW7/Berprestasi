/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const getCategoryColor = (category) => {
  const categoryColors = {
    Akademik: "bg-blue-100 text-blue-800",
    "Non-Akademik": "bg-green-100 text-green-800",
    Seni: "bg-purple-100 text-purple-800",
    Olahraga: "bg-red-100 text-red-800",
    Teknologi: "bg-indigo-100 text-indigo-800",
    Bahasa: "bg-yellow-100 text-yellow-800",
    Sains: "bg-teal-100 text-teal-800",
    Matematika: "bg-pink-100 text-pink-800",
    default: "bg-gray-100 text-gray-800",
  };

  return categoryColors[category] || categoryColors.default;
};

const Post = ({
  id,
  title,
  image,
  categories,
  jenjangs,
  pelaksanaan,
  creatorName,
  profilePicture,
  creator,
}) => {
  // Use refs to store image URLs to avoid rendering loops
  const [imageError, setImageError] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const processedImageRef = useRef(null);
  const processedProfileImageRef = useRef(null);
  const BACKEND_URL = "http://localhost:9000";
  
  // Process the profile picture URL once on component mount or when props change
  useEffect(() => {
    // Reset refs when component receives new props
    processedImageRef.current = null;
    processedProfileImageRef.current = null;
    setProfileImageError(false);
    setImageError(false);
    
    // Process post image URL
    if (image) {
      if (image.startsWith("http")) {
        processedImageRef.current = image;
      } else if (image.startsWith("/")) {
        processedImageRef.current = `${BACKEND_URL}${image}`;
      } else {
        processedImageRef.current = `${BACKEND_URL}/${image}`;
      }
    }
    
    try {
      // Process profile image URL
      if (creator && creator.profilePicture) {
        const pfp = creator.profilePicture;
        
        console.log("Raw profile picture:", pfp);
        
        if (pfp.startsWith("http")) {
          processedProfileImageRef.current = pfp;
        } else if (pfp.startsWith("/uploads")) {
          processedProfileImageRef.current = `${BACKEND_URL}${pfp}`;
        } else if (pfp.startsWith("uploads/")) {
          processedProfileImageRef.current = `${BACKEND_URL}/${pfp}`;
        } else {
          // If it doesn't match expected formats but isn't empty, try to use it with backend URL
          if (pfp && pfp.trim() !== "") {
            if (pfp.startsWith("/")) {
              processedProfileImageRef.current = `${BACKEND_URL}${pfp}`;
            } else {
              processedProfileImageRef.current = `${BACKEND_URL}/${pfp}`;
            }
          } else {
            processedProfileImageRef.current = "/default-avatar.png";
          }
        }
        
        console.log("Setting profile image URL:", processedProfileImageRef.current);
      } else if (profilePicture) {
        if (profilePicture.startsWith("http")) {
          processedProfileImageRef.current = profilePicture;
        } else if (profilePicture.startsWith("/")) {
          processedProfileImageRef.current = `${BACKEND_URL}${profilePicture}`;
        } else if (profilePicture && profilePicture.trim() !== "") {
          processedProfileImageRef.current = `${BACKEND_URL}/${profilePicture}`;
        } else {
          processedProfileImageRef.current = "/default-avatar.png";
        }
      } else {
        processedProfileImageRef.current = "/default-avatar.png";
      }

      // Test if the image URL is valid
      if (processedProfileImageRef.current && 
          processedProfileImageRef.current !== "/default-avatar.png" && 
          !profileImageError) {
        const img = new Image();
        img.onerror = () => {
          console.error("Pre-test profile image failed to load:", processedProfileImageRef.current);
          processedProfileImageRef.current = "/default-avatar.png";
        };
        img.src = processedProfileImageRef.current;
      }
    } catch (error) {
      console.error("Error processing profile picture:", error);
      processedProfileImageRef.current = "/default-avatar.png";
    }
  }, [image, profilePicture, creator, BACKEND_URL, profileImageError]);
  
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  
  const handleImageError = () => {
    console.log("Post image failed to load:", image);
    setImageError(true);
  };
  
  const handleProfileImageError = () => {
    console.log("Profile image error, using default avatar:", processedProfileImageRef.current);
    setProfileImageError(true);
  };
  
  // Format deadline dengan format sama seperti trending
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

  // Get the final image sources, using either the processed URL or fallback
  const postImageSrc = imageError ? null : (processedImageRef.current || image);
  const profileImageSrc = profileImageError ? "/default-avatar.png" : (processedProfileImageRef.current || "/default-avatar.png");

  // Get the creator name, either from props or from creator object
  const displayCreatorName = creatorName || (creator && creator.name) || "Unknown Creator";

  return (
    <Link to={`/post/${id}`} className="block w-full h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300 flex flex-col h-full">
        <div className="relative h-64">
          {!imageError ? (
            <img
              className="w-full h-full object-contain bg-gray-100"
              src={postImageSrc}
              alt={title}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Image not available</span>
            </div>
          )}
          
          {/* Badge tanggal di kanan atas */}
          <div className="absolute top-0 right-0 bg-[#fdd813] text-[#1d305f] px-3 py-1 m-2 rounded-full text-xs font-medium shadow-sm">
            {formatDeadline(pelaksanaan)}
          </div>
        </div>

        {/* Konten Card */}
        <div className="p-3 flex flex-col flex-grow">
          {/* Judul dengan tinggi tetap */}
          <h2 className="font-bold text-[#1d305f] text-lg mb-4 hover:text-[#5b83c2] transition-colors line-clamp-2 h-12">
            {title}
          </h2>

          {/* Tag Container dengan tinggi tetap */}
          <div className="space-y-1.5 mb-2 min-h-[50px]">
            {/* Kategori */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {categories.slice(0, 2).map((category, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(category)}`}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Jenjang */}
            {jenjangs && jenjangs.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {jenjangs.slice(0, 2).map((jenjang, index) => (
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

          {/* Creator Info (pushed to bottom with mt-auto) */}
          <div className="mt-auto pt-1.5 flex items-center text-gray-500 text-sm border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden mr-1.5">
                <img
                  src={profileImageSrc}
                  alt={displayCreatorName}
                  className="w-full h-full object-cover"
                  onError={handleProfileImageError}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 truncate">
                {displayCreatorName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Post;
