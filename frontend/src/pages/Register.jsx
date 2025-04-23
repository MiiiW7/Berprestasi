import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    nomor: "",
    profilePicture: null,
    role: "pendaftar", // default value
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe dan ukuran file
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        setError("Hanya file gambar (JPEG, PNG, GIF) yang diperbolehkan");
        return;
      }

      if (file.size > maxSize) {
        setError("Ukuran file maksimal 2MB");
        return;
      }

      setFormData((prevState) => ({
        ...prevState,
        profilePicture: file,
      }));

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Reset error
      setError(null);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.password || !formData.nomor) {
        setError("Semua kolom wajib diisi");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Format email tidak valid");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Password dan konfirmasi password tidak cocok");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }

      // Process the form data
      setLoading(true);

      // Create form data for submission
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("nomor", formData.nomor);
      submitData.append("role", formData.role);

      // Tambahkan profile picture jika ada
      if (formData.profilePicture) {
        submitData.append("profilePicture", formData.profilePicture);
      }

      // Log debug info
      console.log("Submitting registration form...");
      
      // Submit data to server
      const response = await axios.post(
        "http://localhost:9000/user/auth/register",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // Add timeout to avoid hanging requests
          timeout: 15000,
        }
      );

      console.log("Registration response:", response.data);

      if (response.data.success) {
        // Clear any error messages
        setError("");
        // Show success message and redirect
        alert("Registrasi berhasil! Silakan login dengan akun baru Anda.");
        navigate("/login");
      } else {
        // Handle unexpected success:false response
        setError(response.data.message || "Terjadi kesalahan saat registrasi");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Detailed error logging for debugging
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error("Server error details:", error.response.data);
        console.error("Status code:", error.response.status);
        
        if (error.response.status === 500) {
          setError("Terjadi kesalahan pada server. Silakan coba lagi nanti atau hubungi administrator.");
        } else if (error.response.status === 400) {
          // Handle validation errors
          setError(error.response.data.message || "Data yang dikirim tidak valid");
        } else if (error.response.status === 413) {
          setError("Ukuran file terlalu besar. Maksimal ukuran file adalah 2MB.");
        } else {
          setError(error.response.data.message || "Terjadi kesalahan saat registrasi");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setError("Tidak dapat menghubungi server. Mohon periksa koneksi internet Anda.");
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
        setError("Terjadi kesalahan saat mengirim data. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#5b83c2]/5 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl mx-auto overflow-hidden grid md:grid-cols-2 grid-cols-1">
        {/* Left column - Logo and Description */}
        <div className="bg-gradient-to-r from-[#1d305f] to-[#5b83c2] p-6 md:p-10 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="relative z-10">
            <img
              src="/src/assets/logo.png"
              alt="Logo"
              className="mb-6 w-24 h-24 mx-auto"
            />
            <h1 className="text-white text-2xl md:text-4xl font-bold mb-4">
              Bergabung Sekarang!
            </h1>
            <p className="text-white/90 text-sm md:text-base mt-2 hidden md:block max-w-sm mx-auto">
              Daftarkan dirimu dan mulai perjalanan prestasimu bersama kami
            </p>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 translate-y-20"></div>
        </div>

        {/* Right column - Registration Form */}
        <div className="p-8 md:p-12 w-full">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[#1d305f]">
              Buat Akun Baru
            </h2>
            <p className="text-[#bfbebf] text-sm md:text-base">
              Lengkapi data diri Anda untuk membuat akun
            </p>
          </div>

          {error && (
            <div
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6"
              role="alert"
            >
              <p className="font-medium">Terjadi kesalahan</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#1d305f] mb-2"
                >
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b83c2] focus:border-transparent text-sm transition duration-200"
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#1d305f] mb-2"
                >
                  Alamat Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b83c2] focus:border-transparent text-sm transition duration-200"
                  placeholder="Masukkan alamat email Anda"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label
                  htmlFor="nomor"
                  className="block text-sm font-medium text-[#1d305f] mb-2"
                >
                  Nomor Telepon
                </label>
                <input
                  id="nomor"
                  name="nomor"
                  type="tel"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b83c2] focus:border-transparent text-sm transition duration-200"
                  placeholder="Masukkan nomor telepon Anda"
                  value={formData.nomor}
                  onChange={handleChange}
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#1d305f] mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b83c2] focus:border-transparent text-sm transition duration-200"
                  placeholder="Masukkan password Anda"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#1d305f] mb-2"
                >
                  Konfirmasi Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b83c2] focus:border-transparent text-sm transition duration-200"
                  placeholder="Masukkan ulang password Anda"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Profile Picture Field */}
              <div>
                <label className="block text-sm font-medium text-[#1d305f] mb-2">
                  Foto Profil
                </label>
                <div className="mt-1 flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <img
                      src={previewImage || "/default-avatar.png"}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-[#5b83c2]/20"
                    />
                  </div>
                  <label className="relative cursor-pointer">
                    <span className="px-4 py-3 text-sm bg-[#5b83c2] text-white rounded-lg hover:bg-[#1d305f] transition-colors duration-200 inline-flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Pilih Foto</span>
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-[#bfbebf]">
                  Format: JPG, PNG, GIF (Maks. 2MB)
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-[#1d305f] mb-3">
                  Daftar Sebagai
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative flex cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-[#5b83c2] transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="pendaftar"
                      checked={formData.role === "pendaftar"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-medium text-[#1d305f]">Pendaftar</span>
                        <span className="mt-1 flex items-center text-xs text-[#bfbebf]">Daftar sebagai peserta lomba</span>
                      </span>
                    </span>
                    <svg className={`h-5 w-5 ${formData.role === "pendaftar" ? "text-[#5b83c2]" : "text-transparent"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </label>

                  <label className="relative flex cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-[#5b83c2] transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="penyelenggara"
                      checked={formData.role === "penyelenggara"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-medium text-[#1d305f]">Penyelenggara</span>
                        <span className="mt-1 flex items-center text-xs text-[#bfbebf]">Daftar sebagai penyelenggara lomba</span>
                      </span>
                    </span>
                    <svg className={`h-5 w-5 ${formData.role === "penyelenggara" ? "text-[#5b83c2]" : "text-transparent"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-[#1d305f]
                bg-[#fdd813] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-[#fdd813] disabled:bg-[#bfbebf] disabled:cursor-not-allowed transition duration-200
                flex justify-center items-center shadow-sm hover:shadow-md mt-8"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#1d305f]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-[#bfbebf]">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="text-[#5b83c2] hover:text-[#1d305f] font-medium transition duration-200"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
