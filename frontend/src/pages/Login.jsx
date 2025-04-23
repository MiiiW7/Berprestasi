import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminRedirecting, setAdminRedirecting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAdminRedirecting(false);

    // Validasi form
    if (!formData.email || !formData.password) {
      setError("Email dan password harus diisi");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Format email tidak valid");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting login with:", formData.email);
      const userData = await login(formData);
      console.log("Login berhasil:", userData);
      
      // If this is an admin user
      if (userData.isAdmin || userData.role === "admin") {
        setAdminRedirecting(true);
        // Let the AuthContext handle the redirection
        // The redirection is handled in the AuthContext login function
      } else {
        // Only navigate for non-admin users
        navigate("/");
      }
    } catch (error) {
      console.log("Error detail:", error);

      if (api.isAxiosError && api.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              setError("Email atau password salah");
              break;
            case 404:
              setError("Email belum terdaftar");
              break;
            case 400:
              setError(
                error.response.data.message ||
                  "Data yang dimasukkan tidak valid"
              );
              break;
            case 405:
              setError("Metode HTTP tidak diizinkan. Mohon coba lagi");
              break;
            case 500:
              setError("Terjadi kesalahan pada server");
              break;
            case 504:
              setError("Server mengalami timeout. Coba lagi nanti.");
              break;
            default:
              setError("Terjadi kesalahan. Silakan coba lagi");
          }
        } else if (error.request) {
          // Permintaan dibuat tapi tidak ada respons dari server
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            setError("Koneksi timeout. Server sedang sibuk atau tidak tersedia. Coba lagi nanti.");
          } else {
            setError("Tidak dapat terhubung ke server. Pastikan koneksi internet Anda aktif.");
          }
        } else {
          setError("Terjadi kesalahan. Silakan coba lagi");
        }
      } else {
        // Error bukan dari axios
        setError(error.message || "Terjadi kesalahan. Silakan coba lagi");
      }
    } finally {
      if (!adminRedirecting) {
        setLoading(false);
      }
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
              Selamat Datang Kembali!
            </h1>
            <p className="text-white/90 text-sm md:text-base mt-2 hidden md:block max-w-sm mx-auto">
              Masuk dan jelajahi berbagai kompetisi menarik untuk mengembangkan potensimu
            </p>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 translate-y-20"></div>
        </div>

        {/* Right column - Login Form */}
        <div className="p-8 md:p-12 w-full">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[#1d305f]">
              Masuk ke Akun Anda
            </h2>
            <p className="text-[#bfbebf] text-sm md:text-base">
              Silakan masukkan email dan password Anda untuk melanjutkan
            </p>
          </div>

          {/* Admin redirecting message */}
          {adminRedirecting && (
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r mb-6 flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div>
                <p className="font-medium">Login admin berhasil!</p>
                <p className="text-sm">Mengalihkan ke dashboard admin...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6"
              role="alert"
            >
              <p className="font-medium">Terjadi kesalahan</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                placeholder="Masukkan email Anda"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
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
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-[#5b83c2] focus:ring-[#5b83c2] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-[#1d305f]"
                >
                  Ingat saya
                </label>
              </div>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-[#5b83c2] hover:text-[#1d305f] transition duration-200"
              >
                Lupa password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full px-4 py-3 text-white font-medium rounded-lg transition duration-200 ${
                  loading
                    ? "bg-[#5b83c2]/70 cursor-not-allowed"
                    : "bg-[#5b83c2] hover:bg-[#3a5f93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a5f93]"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  </div>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>

            {/* Registration Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-[#bfbebf]">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-[#5b83c2] hover:text-[#1d305f] font-medium transition duration-200"
                >
                  Daftar Sekarang
                </Link>
              </p>
            </div>
          </form>

          {/* Demo Mode Information */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-1">
              <span className="font-semibold">Status Server:</span>{" "}
              <span className="inline-flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                Mengalami gangguan
              </span>
            </p>
            <p className="text-xs mt-1">
              Server backend saat ini sedang mengalami gangguan. 
              Jika login gagal, coba gunakan:<br />
              <span className="font-mono bg-gray-100 px-1 rounded">demo@example.com / demo123</span> (user) atau{" "}
              <span className="font-mono bg-gray-100 px-1 rounded">admin@example.com / admin123</span> (admin)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
