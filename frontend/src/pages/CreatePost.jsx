/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../config/constants";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: [],
    jenjangs: [],
    image: null,
    pelaksanaan: "",
    link: "",
    status: "Belum Dilaksanakan",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Judul lomba wajib diisi";
    }
    if (!formData.description.trim()) {
      errors.description = "Deskripsi lomba wajib diisi";
    }
    if (formData.categories.length === 0) {
      errors.categories = "Pilih minimal satu kategori";
    }
    if (formData.jenjangs.length === 0) {
      errors.jenjangs = "Pilih minimal satu jenjang";
    }
    if (!formData.pelaksanaan) {
      errors.pelaksanaan = "Tanggal pelaksanaan wajib diisi";
    }
    if (!formData.link.trim()) {
      errors.link = "Link detail lomba wajib diisi";
    } else if (!formData.link.startsWith('http://') && !formData.link.startsWith('https://')) {
      errors.link = "Link harus dimulai dengan http:// atau https://";
    }
    if (!formData.image) {
      errors.image = "Poster lomba wajib diunggah";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setValidationErrors((prev) => ({
          ...prev,
          image: "Ukuran file tidak boleh lebih dari 5MB"
        }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setValidationErrors((prev) => ({
          ...prev,
          image: "Format file harus JPG, JPEG, atau PNG"
        }));
        return;
      }
      setFormData((prevState) => ({
        ...prevState,
        image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setValidationErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setError("");

    if (!user || !token) {
      setError("User tidak terautentikasi. Silakan login kembali.");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categories", JSON.stringify(formData.categories));
      formDataToSend.append("jenjangs", JSON.stringify(formData.jenjangs));
      formDataToSend.append("pelaksanaan", formData.pelaksanaan);
      formDataToSend.append("link", formData.link);
      formDataToSend.append("status", formData.status);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await axios.post(
        `${BACKEND_URL}/post`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat membuat post."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prevState) => {
      const newCategories = isChecked
        ? [...prevState.categories, category]
        : prevState.categories.filter((c) => c !== category);
      
      // Clear validation error when user selects a category
      if (newCategories.length > 0) {
        setValidationErrors((prev) => ({ ...prev, categories: "" }));
      }
      
      return {
        ...prevState,
        categories: newCategories,
      };
    });
  };

  const handleJenjangChange = (e) => {
    const jenjang = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prevState) => {
      const newJenjangs = isChecked
        ? [...prevState.jenjangs, jenjang]
        : prevState.jenjangs.filter((j) => j !== jenjang);
      
      // Clear validation error when user selects a jenjang
      if (newJenjangs.length > 0) {
        setValidationErrors((prev) => ({ ...prev, jenjangs: "" }));
      }
      
      return {
        ...prevState,
        jenjangs: newJenjangs,
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#5b83c2]/5 py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-[#1d305f]">Buat Lomba Baru</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1d305f] mb-2">
              Judul Lomba
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                validationErrors.title ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-[#5b83c2]`}
              placeholder="Masukkan judul lomba"
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d305f] mb-2">
              Deskripsi Lomba
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-3 py-2 border ${
                validationErrors.description ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-[#5b83c2]`}
              placeholder="Deskripsikan detail lomba"
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1d305f] mb-2">
                Kategori Lomba
              </label>
              <div className="space-y-2">
                {AVAILABLE_CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      value={category}
                      checked={formData.categories.includes(category)}
                      onChange={handleCategoryChange}
                      className="rounded border-gray-300 text-[#5b83c2] focus:ring-[#5b83c2]"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
              {validationErrors.categories && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.categories}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1d305f] mb-2">
                Jenjang Pendidikan
              </label>
              <div className="space-y-2">
                {AVAILABLE_JENJANG.map((jenjang) => (
                  <label key={jenjang} className="flex items-center">
                    <input
                      type="checkbox"
                      value={jenjang}
                      checked={formData.jenjangs.includes(jenjang)}
                      onChange={handleJenjangChange}
                      className="rounded border-gray-300 text-[#5b83c2] focus:ring-[#5b83c2]"
                    />
                    <span className="ml-2 text-sm text-gray-700">{jenjang}</span>
                  </label>
                ))}
              </div>
              {validationErrors.jenjangs && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.jenjangs}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d305f] mb-2">
              Tanggal Pelaksanaan
            </label>
            <input
              type="date"
              name="pelaksanaan"
              value={formData.pelaksanaan}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                validationErrors.pelaksanaan ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-[#5b83c2]`}
            />
            {validationErrors.pelaksanaan && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.pelaksanaan}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d305f] mb-2">
              Link Detail Lomba
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://example.com"
              className={`w-full px-3 py-2 border ${
                validationErrors.link ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-[#5b83c2]`}
            />
            {validationErrors.link && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.link}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d305f] mb-2">
              Poster Lomba
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="mx-auto h-48 w-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData((prev) => ({ ...prev, image: null }));
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#5b83c2] hover:text-[#1d305f] focus-within:outline-none"
                      >
                        <span>Upload poster</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG hingga 5MB</p>
                  </>
                )}
              </div>
            </div>
            {validationErrors.image && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.image}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5b83c2]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white bg-[#1d305f] rounded-md hover:bg-[#5b83c2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5b83c2] ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                'Simpan Lomba'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
