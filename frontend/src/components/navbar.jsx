/* eslint-disable react-hooks/exhaustive-deps */
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showJenjang, setshowJenjang] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [showMobileJenjang, setShowMobileJenjang] = useState(false);
  const [categoryTimeout, setCategoryTimeout] = useState(null);
  const [jenjangTimeout, setJenjangTimeout] = useState(null);
  const { user, logout, checkAuth, token } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [
    unreadPenyelenggaraNotifications,
    setUnreadPenyelenggaraNotifications,
  ] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate ke halaman search dengan query
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Fungsi untuk fetch notifikasi umum
  const fetchUnreadNotificationsCount = async () => {
    if (!user || !token || user.role !== "pendaftar") return;

    try {
      const response = await axios.get(
        "http://localhost:9000/user/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Gunakan unreadCount dari response
      setUnreadNotifications(response.data.unreadCount);
    } catch (error) {
      console.error(
        "Gagal mengambil jumlah notifikasi yang belum dibaca",
        error
      );
    }
  };

  // Fungsi untuk fetch notifikasi penyelenggara
  const fetchPenyelenggaraNotificationsCount = async () => {
    if (!user || !token || user.role !== "penyelenggara") return;

    try {
      const response = await axios.get(
        "http://localhost:9000/user/notifications/penyelenggara",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Gunakan unreadCount dari response
      setUnreadPenyelenggaraNotifications(response.data.unreadCount);
    } catch (error) {
      console.error("Gagal mengambil jumlah notifikasi penyelenggara", error);
    }
  };

  // Effect untuk fetch notifikasi saat komponen dimuat dan setiap interval
  useEffect(() => {
    // Fungsi fetch notifikasi berdasarkan peran user
    const fetchNotifications = () => {
      if (user && token) {
        if (user.role === "pendaftar") {
          fetchUnreadNotificationsCount();
        } else if (user.role === "penyelenggara") {
          fetchPenyelenggaraNotificationsCount();
        }
      }
    };

    // Fetch notifikasi pertama kali
    fetchNotifications();

    // Set interval untuk fetch notifikasi setiap 30 detik
    const intervalId = setInterval(fetchNotifications, 30000);

    // Bersihkan interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, [user, token]);

  const categories = [
    "Akademik",
    "Non-Akademik",
    "Seni",
    "Olahraga",
    "Teknologi",
    "Bahasa",
    "Sains",
    "Matematika",
  ];

  const jenjangs = ["SD", "SMP", "SMA", "SMK", "Mahasiswa", "Umum"];

  const handleMouseEnterCategories = () => {
    if (categoryTimeout) {
      clearTimeout(categoryTimeout);
    }
    setShowCategories(true);
  };

  const handleMouseLeaveCategories = () => {
    setCategoryTimeout(
      setTimeout(() => {
        setShowCategories(false);
      }, 200)
    ); // 200 ms delay before hiding
  };

  const handleMouseEnterJenjang = () => {
    if (jenjangTimeout) {
      clearTimeout(jenjangTimeout);
    }
    setshowJenjang(true);
  };

  const handleMouseLeaveJenjang = () => {
    setJenjangTimeout(
      setTimeout(() => {
        setshowJenjang(false);
      }, 200)
    ); // 200 ms delay before hiding
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Tambahkan useEffect untuk memanggil checkAuth saat komponen dimount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="bg-white sticky top-0 left-0 w-full z-50 shadow-sm py-1 text-sm">
      <nav className="flex justify-between items-center w-[92%] mx-auto">
        <div className="flex items-center">
          <Link to={user?.role === "penyelenggara" ? "/dashboard" : "/"}>
            <img src={logo} alt="Logo" width="45" className="mr-4" />
          </Link>
        </div>

        {/* Search Bar - Only visible for non-penyelenggara users */}
        {user && user.role !== "penyelenggara" && (
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lomba atau penyelenggara..."
                className="w-full px-3 py-2 text-sm border rounded-l-md focus:outline-none focus:border-[#5b83c2]"
              />
              <button
                type="submit"
                className="bg-[#fdd813] text-[#1d305f] px-3 py-2 rounded-r-md hover:bg-yellow-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* Empty div to maintain centering for penyelenggara users */}
        {user && user.role === "penyelenggara" && (
          <div className="flex-1"></div>
        )}

        {/* Mobile menu button */}
        <div className="relative md:hidden">
          <button
            onClick={toggleMenu}
            className="text-[#1d305f] hover:text-[#5b83c2] focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Mobile Menu Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white shadow-lg py-2 border border-gray-100">
              {user ? (
                <>
                  <div className="border-t border-gray-100">
                    {user.role === "pendaftar" ? (
                      <>
                        <Link
                          to="/"
                          className="block px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                          onClick={() => setIsOpen(false)}
                        >
                          Home
                        </Link>

                        {/* Categories Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setShowMobileCategories(!showMobileCategories)}
                            className="flex items-center justify-between w-full px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                          >
                            <span>Kategori</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 transition-transform ${showMobileCategories ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showMobileCategories && (
                            <div className="bg-gray-50">
                              {categories.map((category) => (
                                <Link
                                  key={category}
                                  to={`/kategori/${category}`}
                                  className="block px-8 py-2 text-sm text-[#1d305f] hover:bg-[#5b83c2]/10"
                                  onClick={() => {
                                    setShowMobileCategories(false);
                                    setIsOpen(false);
                                  }}
                                >
                                  {category}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Jenjang Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setShowMobileJenjang(!showMobileJenjang)}
                            className="flex items-center justify-between w-full px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                          >
                            <span>Jenjang</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 transition-transform ${showMobileJenjang ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showMobileJenjang && (
                            <div className="bg-gray-50">
                              {jenjangs.map((jenjang) => (
                                <Link
                                  key={jenjang}
                                  to={`/jenjang/${jenjang}`}
                                  className="block px-8 py-2 text-sm text-[#1d305f] hover:bg-[#5b83c2]/10"
                                  onClick={() => {
                                    setShowMobileJenjang(false);
                                    setIsOpen(false);
                                  }}
                                >
                                  {jenjang}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        <Link
                          to="/notifications"
                          className="flex items-center justify-between px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                          onClick={() => setIsOpen(false)}
                        >
                          <span>Notifikasi</span>
                          {unreadNotifications > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {unreadNotifications}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                          onClick={() => setIsOpen(false)}
                        >
                          Profile 
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          className="flex items-center justify-between px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                          onClick={() => setIsOpen(false)}
                        >
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/notifications-penyelenggara"
                          className="flex items-center justify-between px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                          onClick={() => setIsOpen(false)}
                        >
                          <span>Notifikasi</span>
                          {unreadPenyelenggaraNotifications > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {unreadPenyelenggaraNotifications}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                          onClick={() => setIsOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/create-post"
                          className="block px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                          onClick={() => setIsOpen(false)}
                        >
                          Buat Lomba
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="mx-auto w-[120px] block bg-[#1d305f] text-white px-3 py-1.5 rounded-md hover:bg-[#5b83c2] transition mt-2"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                    onClick={() => setIsOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-[#1d305f] hover:bg-[#5b83c2]/10"
                    onClick={() => setIsOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        {user ? (
          <div className="hidden md:flex items-center gap-4">
            {user.role === "pendaftar" ? (
              <>
                <Link to="/" className="text-[#1d305f] hover:text-[#5b83c2]">
                  Home
                </Link>

                <div
                  className="relative"
                  onMouseEnter={handleMouseEnterCategories}
                  onMouseLeave={handleMouseLeaveCategories}
                >
                  <button className="text-[#1d305f] hover:text-[#5b83c2]">
                    Kategori
                  </button>
                  {showCategories && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {categories.map((category) => (
                          <Link
                            key={category}
                            to={`/kategori/${category}`}
                            className="block px-4 py-2 text-sm text-[#1d305f] hover:bg-[#5b83c2]/10"
                          >
                            {category}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="relative"
                  onMouseEnter={handleMouseEnterJenjang}
                  onMouseLeave={handleMouseLeaveJenjang}
                >
                  <button className="text-[#1d305f] hover:text-[#5b83c2]">
                    Jenjang
                  </button>
                  {showJenjang && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {jenjangs.map((jenjang) => (
                          <Link
                            key={jenjang}
                            to={`/jenjang/${jenjang}`}
                            className="block px-4 py-2 text-sm text-[#1d305f] hover:bg-[#5b83c2]/10"
                          >
                            {jenjang}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="/notifications"
                  className="text-[#1d305f] hover:text-[#5b83c2] relative"
                >
                  Notifikasi
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="text-[#1d305f] hover:text-[#5b83c2]"
                >
                  Profile 
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="text-[#1d305f] hover:text-[#5b83c2]"
                >
                  Dashboard
                </Link>
                <Link
                  to="/notifications-penyelenggara"
                  className="text-[#1d305f] hover:text-[#5b83c2] relative"
                >
                  Notifikasi
                  {unreadPenyelenggaraNotifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadPenyelenggaraNotifications}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="text-[#1d305f] hover:text-[#5b83c2]"
                >
                  Profile
                </Link>
                <Link
                  to="/create-post"
                  className="bg-[#1d305f] text-white px-3 py-1.5 rounded-md hover:bg-[#5b83c2] transition min-w-[80px]"
                >
                  Buat Lomba
                </Link>
              </>
            )}
            <button
              onClick={logout}
              className="bg-[#1d305f] text-white px-3 py-1.5 rounded-md hover:bg-[#5b83c2] transition min-w-[80px]"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-[#1d305f] hover:text-[#5b83c2]"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="bg-[#1d305f] text-white px-4 py-2 rounded-md hover:bg-[#5b83c2] transition"
            >
              Daftar
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;