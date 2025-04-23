import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Postlist from '../components/Postlist';
import Footer from "../components/Footer";

const Home = () => {
  const postListRef = useRef(null);
  const BACKEND_URL = "http://localhost:9000";
  
  const [trendingCompetitions, setTrendingCompetitions] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [trendingError, setTrendingError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [slideTimer, setSlideTimer] = useState(100);

  // Mock data for testing
  const mockUserData = {
    id: "U1234",
    name: "Fadlan",
    role: "penyelenggara",
    profilePicture: null,
    followedPosts: [1, 2, 3],
    completedPosts: []
  };

  const [announcements, setAnnouncements] = useState([
    {
      id: "1",
      title: "Peluncuran Kategori Baru: Robotik & AI",
      date: "2 Juli 2023",
      summary: "Kami telah menambahkan kategori baru untuk lomba robotik dan kecerdasan buatan.",
      link: "#"
    },
    {
      id: "2",
      title: "Kerjasama dengan Kementerian Pendidikan",
      date: "15 Juni 2023",
      summary: "Berprestasi resmi bermitra dengan Kemendikbud untuk program beasiswa pemenang lomba.",
      link: "#"
    }
  ]);

  // Function to get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Pagi";
    if (hour < 15) return "Siang";
    if (hour < 19) return "Sore";
    return "Malam";
  };

  // Fetch trending competitions
  useEffect(() => {
    const fetchTrendingCompetitions = async () => {
      setIsLoadingTrending(true);
      try {
        console.log("Fetching trending competitions from:", `${BACKEND_URL}/post/trending`);
        const response = await axios.get(`${BACKEND_URL}/post/trending`);
        console.log("Trending API response:", response.data);
        
        if (response.data.success) {
          console.log("Trending competitions data:", response.data.data);
          setTrendingCompetitions(response.data.data);
        } else {
          console.error("API returned success: false", response.data.message);
          setTrendingError("Failed to fetch trending competitions");
        }
      } catch (error) {
        console.error("Error fetching trending competitions:", error);
        setTrendingError(error.response?.data?.message || "Network error occurred");
      } finally {
        setIsLoadingTrending(false);
      }
    };

    fetchTrendingCompetitions();
  }, []);

  // Fetch user data if logged in
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      
      // For development testing - uncomment to use mock data
      // setTimeout(() => {
      //   setUserData(mockUserData);
      //   setIsLoadingUser(false);
      // }, 1000);
      // return;
      
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const response = await axios.get(`${BACKEND_URL}/user/profile`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            setUserData(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // Hero slider timing
  useEffect(() => {
    const slideDuration = 5000; // 5 seconds per slide
    const timerInterval = 50; // Update timer every 50ms for smoother animation
    const timerSteps = slideDuration / timerInterval;
    
    // Initialize timer to 100%
    setSlideTimer(100);
    
    // Timer interval for visual countdown
    const timerIntervalId = setInterval(() => {
      setSlideTimer(prev => {
        const newValue = prev - (100 / timerSteps);
        return newValue < 0 ? 0 : newValue;
      });
    }, timerInterval);
    
    // Slide change interval
    const slideIntervalId = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % (announcements.length + 1));
      setSlideTimer(100); // Reset timer when slide changes
    }, slideDuration);
    
    return () => {
      clearInterval(slideIntervalId);
      clearInterval(timerIntervalId);
    };
  }, [announcements.length]);

  // Smooth scroll function
  const scrollToPostList = (e) => {
    e.preventDefault();
    postListRef.current.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Add global smooth scrolling
  useEffect(() => {
    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Clean up when component unmounts
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  // Format deadline
  const formatDeadline = (deadlineDate) => {
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

  // Get image URL with proper backend prefix
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/600x400/1d305f/fdd813?text=Berprestasi";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      {/* Hero Slider Section - Contained, not full-width */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Main slider - hidden on mobile */}
            <div className="w-full md:w-3/4 relative bg-[#ffd800] rounded-lg overflow-hidden hidden md:block">
              <div className="flex transition-transform duration-500 ease-in-out" 
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                
                {/* Welcome slide */}
                <div className="w-full flex-shrink-0 relative overflow-hidden">
                  <div className="p-6 md:p-8 lg:p-12 flex flex-col md:flex-row items-start md:items-center">
                    <div className="flex-1 space-y-3 md:space-y-4 mb-6 md:mb-0 md:pr-8">
                      <h2 className="text-lg md:text-xl lg:text-2xl font-medium text-[#1d305f]">
                        Selamat {getGreeting()}, Sobat Berprestasi!
                      </h2>
                      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold leading-tight text-[#1d305f]">
                        Rintis Pencapaian Bersama Berprestasi
                      </h1>
                      <p className="text-sm md:text-md lg:text-lg text-[#1d305f]">
                        Platform terlengkap untuk siswa dan mahasiswa Indonesia mencari, mengikuti, dan meraih prestasi.
                      </p>
                      <div className="pt-4">
                        <button 
                          onClick={scrollToPostList}
                          className="inline-block bg-[#1d305f] text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium hover:bg-[#324b80] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md text-sm md:text-base"
                        >
                          Jelajahi Lomba Sekarang
                        </button>
                      </div>
                    </div>
                    <div className="w-1/2 mx-auto md:w-1/3 flex justify-center">
                      <div className="w-full max-w-[150px] md:max-w-[200px] lg:max-w-none">
                        <img 
                          src="/hero-illustration.svg" 
                          alt="Berprestasi Hero" 
                          className="w-full h-auto"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/600x400/1d305f/fdd813?text=Berprestasi";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* News/Announcement Slides */}
                {announcements.map((announcement, index) => (
                  <div key={announcement.id} className="w-full flex-shrink-0 relative overflow-hidden">
                    {/* Background Effect */}
                    <div className="absolute inset-0 z-0">
                      <div className="absolute inset-0 bg-[#ffd800] z-10"></div>
                      {index === 0 && (
                        <div className="absolute right-0 bottom-0 opacity-10 z-0">
                          <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M150 0C232.843 0 300 67.1573 300 150C300 232.843 232.843 300 150 300C67.1573 300 0 232.843 0 150C0 67.1573 67.1573 0 150 0Z" fill="#1d305f"/>
                            <path d="M150 50C200.751 50 241.667 90.9167 241.667 141.667C241.667 192.418 200.751 233.333 150 233.333C99.2487 233.333 58.3333 192.418 58.3333 141.667C58.3333 90.9167 99.2487 50 150 50Z" fill="#1d305f"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 md:p-8 lg:p-12 flex flex-col md:flex-row items-start md:items-center relative z-10">
                      <div className="flex-1 space-y-3 md:space-y-4 mb-6 md:mb-0 md:pr-8">
                        <div className="inline-block bg-[#1d305f]/20 text-[#1d305f] text-xs md:text-sm font-medium px-3 py-1 rounded-full mb-2">
                          {announcement.date}
                        </div>
                        <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-[#1d305f]">
                          {announcement.title}
                        </h2>
                        <p className="text-sm md:text-md lg:text-lg text-[#1d305f]">
                          {announcement.summary}
                        </p>
                        <div className="pt-4">
                          <Link 
                            to={announcement.link}
                            className="inline-block bg-[#1d305f] text-white px-4 py-2 md:px-5 md:py-2 rounded-lg font-medium hover:bg-[#324b80] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md text-sm md:text-base"
                          >
                            Baca Selengkapnya
                          </Link>
                        </div>
                      </div>
                      <div className="w-1/2 mx-auto md:w-1/3 flex justify-center">
                        <div className="w-full">
                          <img 
                            src={index === 0 ? "/robot-icon.svg" : `/news-${index + 1}.svg`} 
                            alt={announcement.title} 
                            className="w-full h-auto max-w-[100px] md:max-w-[120px] lg:max-w-[180px] mx-auto"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/600x400/1d305f/fdd813?text=Berprestasi";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Buttons - hidden on small screens */}
              <div className="absolute top-1/2 transform -translate-y-1/2 left-0 right-0 flex justify-between px-2 z-30">
                <button 
                  onClick={() => {
                    setActiveSlide(prev => (prev === 0 ? announcements.length : prev - 1));
                    setSlideTimer(100); // Reset timer when manually changing slides
                  }}
                  className="bg-[#1d305f] text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md hover:bg-[#324b80] focus:outline-none"
                  aria-label="Previous slide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    setActiveSlide(prev => (prev === announcements.length ? 0 : prev + 1));
                    setSlideTimer(100); // Reset timer when manually changing slides
                  }}
                  className="bg-[#1d305f] text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md hover:bg-[#324b80] focus:outline-none"
                  aria-label="Next slide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Slider indicators */}
              <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                <button 
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${activeSlide === 0 ? 'bg-[#1d305f]' : 'bg-[#1d305f]/40'}`}
                  onClick={() => {
                    setActiveSlide(0);
                    setSlideTimer(100); // Reset timer when manually changing slides
                  }}
                  aria-label="Go to slide 1"
                />
                {announcements.map((_, index) => (
                  <button 
                    key={index}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${activeSlide === index + 1 ? 'bg-[#1d305f]' : 'bg-[#1d305f]/40'}`}
                    onClick={() => {
                      setActiveSlide(index + 1);
                      setSlideTimer(100); // Reset timer when manually changing slides
                    }}
                    aria-label={`Go to slide ${index + 2}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Right side user profile box - shown on all screens (including mobile) */}
            <div className="w-full mt-0 md:mt-0 md:w-1/4 bg-[#1d305f] rounded-lg overflow-hidden block">
              {isLoadingUser ? (
                <div className="flex justify-center items-center h-full p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#ffd800] border-t-transparent"></div>
                </div>
              ) : userData ? (
                <div className="flex flex-col h-full items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-white mb-4 overflow-hidden border-4 border-white">
                    <img 
                      src={userData.profilePicture ? `${BACKEND_URL}${userData.profilePicture}` : "/default-avatar.png"} 
                      alt={userData.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://ui-avatars.com/api/?name=User&background=ffd800&color=1d305f&size=100";
                      }}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{userData.name}</h3>
                  <p className="text-[#ffd800] text-sm mb-4">{userData.role === 'penyelenggara' ? 'Penyelenggara' : userData.role || 'Peserta'}</p>
                  
                  <div className="w-full space-y-2 mt-2">
                    <div className="flex justify-between items-center bg-[#243761] rounded px-3 py-2">
                      <span className="text-white text-sm">Lomba Diikuti</span>
                      <span className="text-[#ffd800] font-bold">{userData.followedPosts?.length || userData.participatedContests?.length || 3}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#243761] rounded px-3 py-2">
                      <span className="text-white text-sm">Lomba Selesai</span>
                      <span className="text-[#ffd800] font-bold">{userData.completedPosts?.length || userData.completedContests?.length || 0}</span>
                    </div>
                  </div>
                  {/* Mobile-only button */}
                  <div className="mt-4 w-full md:hidden">
                    <button 
                      onClick={scrollToPostList}
                      className="w-full bg-[#ffd800] text-[#1d305f] px-4 py-3 rounded-lg font-medium hover:bg-[#ffe566] transition-all text-sm"
                    >
                      Jelajahi Lomba Sekarang
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-white mb-4 overflow-hidden border-4 border-white">
                    <img 
                      src="/default-avatar.png" 
                      alt="Default Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://ui-avatars.com/api/?name=Fadlan&background=ffd800&color=1d305f&size=100";
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Masuk untuk melihat profil Anda</h3>
                  <div className="flex gap-2">
                    <Link 
                      to="/signin"
                      className="inline-block bg-[#ffd800] text-[#1d305f] px-4 py-2 rounded-lg font-medium hover:bg-[#ffe566] transition-all text-sm"
                    >
                      Masuk
                    </Link>
                    <Link 
                      to="/signup"
                      className="inline-block bg-white text-[#1d305f] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all text-sm"
                    >
                      Daftar
                    </Link>
                  </div>
                  {/* Mobile-only button */}
                  <div className="mt-4 w-full md:hidden">
                    <button 
                      onClick={scrollToPostList}
                      className="w-full bg-[#ffd800] text-[#1d305f] px-4 py-3 rounded-lg font-medium hover:bg-[#ffe566] transition-all text-sm"
                    >
                      Jelajahi Lomba Sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trending Competitions */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1d305f] mb-2">Lomba Yang Sedang Ramai</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Lomba-lomba berikut sedang banyak diminati. Segera daftar sebelum batas waktu berakhir!
            </p>
          </div>
          
          {isLoadingTrending ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5b83c2] border-t-transparent"></div>
            </div>
          ) : trendingError ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded max-w-4xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">Post tidak ditemukan. Silakan coba lagi nanti.</p>
                </div>
              </div>
            </div>
          ) : !trendingCompetitions || trendingCompetitions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 max-w-4xl mx-auto">
              Belum ada lomba yang ramai saat ini. Silahkan cek kembali nanti!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {trendingCompetitions.slice(0, 3).map(comp => (
                <Link to={`/post/${comp.id}`} key={comp.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300 flex flex-col h-full">
                  <div className="relative h-64">
                    <img src={getImageUrl(comp.image)} alt={comp.title} className="w-full h-full object-contain bg-gray-100" />
                    <div className="absolute top-0 right-0 bg-[#fdd813] text-[#1d305f] px-3 py-1 m-2 rounded-full text-sm font-medium">
                      {formatDeadline(comp.deadline || comp.pelaksanaan)}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h2 className="font-bold text-[#1d305f] text-lg mb-2 hover:text-[#5b83c2] transition-colors line-clamp-2 h-14">
                      {comp.title}
                    </h2>
                    <div className="min-h-[50px]"></div>
                    <div className="mt-auto pt-3 flex items-center text-gray-500 text-sm border-t border-gray-100">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">{comp.followersCount || 0} Peserta</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <button
              onClick={scrollToPostList} 
              className="inline-block bg-[#1d305f] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5b83c2] transition-all hover:-translate-y-1 duration-300"
            >
              Lihat Semua Lomba
            </button>
          </div>
        </div>
      </div>

      {/* Featured Post Heading */}
      <div ref={postListRef} className="container mx-auto px-4 pt-10 pb-4 scroll-mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1d305f] mb-2">Jelajahi Semua Lomba</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Temukan berbagai lomba yang sesuai dengan minat dan bakatmu
          </p>
        </div>
      </div>
      
      <Postlist />
      <Footer />
    </div>
  );
};

export default Home;