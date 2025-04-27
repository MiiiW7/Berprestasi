/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getImageUrl, getProfilePictureUrl } from "../utils/imageUtils";

const getCategoryColor = (category) => {
  switch (category) {
    case "Matematika":
      return "bg-blue-100 text-blue-700";
    case "Sains":
      return "bg-green-100 text-green-700";
    case "Bahasa":
      return "bg-purple-100 text-purple-700";
    case "Seni":
      return "bg-pink-100 text-pink-700";
    case "Olahraga":
      return "bg-orange-100 text-orange-700";
    case "Teknologi":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
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
  const [imageError, setImageError] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  
  // Get processed URLs for images
  const postImageUrl = image ? getImageUrl(image) : null;
  const profileImageUrl = getProfilePictureUrl(
    creator?.profilePicture || profilePicture
  );
  
  const handleImageError = () => {
    console.log("Post image failed to load:", image);
    setImageError(true);
  };
  
  const handleProfileImageError = () => {
    console.log("Profile image error, using default avatar");
    setProfileImageError(true);
  };
  
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  // Get the creator name, either from props or from creator object
  const displayCreatorName = creatorName || (creator && creator.name) || "Unknown Creator";
  
  // Final image URLs with fallbacks
  const finalPostImageSrc = imageError ? null : postImageUrl;
  const finalProfileImageSrc = profileImageError ? "/default-avatar.png" : profileImageUrl;

  return (
    <Link to={`/post/${id}`} className="block w-full h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300 flex flex-col h-full">
        <div className="relative h-64">
          {!imageError ? (
            <img
              className="w-full h-full object-contain bg-gray-100"
              src={finalPostImageSrc}
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
                  src={finalProfileImageSrc}
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
