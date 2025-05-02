import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navbar";
import { BACKEND_URL } from "../config/constants";

const AVAILABLE_CATEGORIES = [
  "Akademik",
  "Non-Akademik",
  "Seni",
  "Olahraga",
  "Teknologi",
  "Bahasa",
  "Sains",
  "Matematika",
];

const AVAILABLE_JENJANG = ["SD", "SMP", "SMA", "SMK", "Mahasiswa", "Umum"];

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [post, setPost] = useState({
    title: "",
    description: "",
    categories: [],
    jenjangs: [],
    pelaksanaan: "",
    status: "",
    image: null,
  });
  const [currentImage, setCurrentImage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/post/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postData = response.data.data;
        const formattedDate = postData.pelaksanaan
          ? new Date(postData.pelaksanaan).toISOString().split("T")[0]
          : "";
        setPost({
          ...postData,
          pelaksanaan: formattedDate,
          jenjangs: postData.jenjangs || [],
        });
        setCurrentImage(postData.image);
      } catch (error) {
        setError(
          "Failed to fetch post data: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === "penyelenggara") {
      fetchPost();
    } else {
      setError("Anda tidak memiliki akses ke halaman ini.");
      setIsLoading(false);
    }
  }, [id, token, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    const isChecked = e.target.checked;

    setPost((prevPost) => {
      if (isChecked) {
        return {
          ...prevPost,
          categories: [...prevPost.categories, category],
        };
      } else {
        return {
          ...prevPost,
          categories: prevPost.categories.filter((c) => c !== category),
        };
      }
    });
  };

  const handleJenjangChange = (e) => {
    const jenjang = e.target.value;
    const isChecked = e.target.checked;

    setPost((prevPost) => {
      if (isChecked) {
        return {
          ...prevPost,
          jenjangs: [...prevPost.jenjangs, jenjang],
        };
      } else {
        return {
          ...prevPost,
          jenjangs: prevPost.jenjangs.filter((j) => j !== jenjang),
        };
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPost((prevPost) => ({
        ...prevPost,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("description", post.description);
    formData.append("categories", JSON.stringify(post.categories));
    formData.append("jenjangs", JSON.stringify(post.jenjangs));
    formData.append("pelaksanaan", post.pelaksanaan);
    formData.append("link", post.link);
    formData.append("status", post.status);
    if (post.image instanceof File) {
      formData.append("image", post.image);
    }

    try {
      await axios.put(`${BACKEND_URL}/post/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/profile");
    } catch (error) {
      setError(
        "Failed to update post: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Edit Lomba</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="title"
            >
              Judul Lomba
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={post.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={post.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="link"
            >
              Link
            </label>
            <textarea
              id="link"
              name="link"
              value={post.link}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Kategori (pilih satu atau lebih)
            </label>
            <div className="space-y-2">
              {AVAILABLE_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    name="categories"
                    value={category}
                    checked={post.categories.includes(category)}
                    onChange={handleCategoryChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Jenjang (pilih satu atau lebih)
            </label>
            <div className="space-y-2">
              {AVAILABLE_JENJANG.map((jenjang) => (
                <div key={jenjang} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`jenjang-${jenjang}`}
                    name="jenjangs"
                    value={jenjang}
                    checked={post.jenjangs.includes(jenjang)}
                    onChange={handleJenjangChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`jenjang-${jenjang}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {jenjang}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Tambahkan input untuk tanggal pelaksanaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Pelaksanaan
            </label>
            <input
              type="date"
              name="pelaksanaan"
              value={post.pelaksanaan}
              onChange={(e) =>
                setPost({
                  ...post,
                  pelaksanaan: e.target.value,
                })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
              min={new Date().toISOString().split("T")[0]} // Batasi tanggal minimal hari ini
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="status"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={post.status}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="Belum Dilaksanakan">Belum Dilaksanakan</option>
              <option value="Sedang Dilaksanakan">Sedang Dilaksanakan</option>
              <option value="Telah Dilaksanakan">Telah Dilaksanakan</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="image"
            >
              Gambar
            </label>
            {currentImage && !previewImage && (
              <img
                src={`${BACKEND_URL}${currentImage}`}
                alt="Current post image"
                className="mb-2 max-w-xs"
              />
            )}
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mb-2 max-w-xs rounded"
              />
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
              accept="image/*"
            />
          </div>
          <div className="flex justify-between space-x-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-600"
              }`}
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
