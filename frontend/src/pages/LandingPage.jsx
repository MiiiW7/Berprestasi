import { Link } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#1d305f] to-[#5b83c2] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pb-48">
          <div className="text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Temukan Prestasi Terbaikmu
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Platform kompetisi terlengkap untuk pelajar dan mahasiswa Indonesia
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-[#fdd813] text-[#1d305f] px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition duration-300 inline-block"
              >
                Daftar Sekarang
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#1d305f] transition duration-300 inline-block"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative wave shape */}
        <div className="absolute bottom-0 left-0 right-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full block" preserveAspectRatio="none">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,160L48,165.3C96,171,192,181,288,181.3C384,181,480,171,576,165.3C672,160,768,160,864,165.3C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1d305f]">
            Kenapa Memilih Platform Kami?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 hover:bg-gray-50 rounded-xl transition duration-300">
              <div className="bg-[#5b83c2]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#5b83c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#1d305f]">Mudah Mencari</h3>
              <p className="text-[#bfbebf]">
                Temukan kompetisi yang sesuai dengan minat dan bakatmu dengan mudah
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 hover:bg-gray-50 rounded-xl transition duration-300">
              <div className="bg-[#5b83c2]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#5b83c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#1d305f]">Terpercaya</h3>
              <p className="text-[#bfbebf]">
                Semua kompetisi telah diverifikasi dan dapat dipertanggungjawabkan
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 hover:bg-gray-50 rounded-xl transition duration-300">
              <div className="bg-[#5b83c2]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#5b83c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#1d305f]">Update Realtime</h3>
              <p className="text-[#bfbebf]">
                Dapatkan notifikasi terbaru untuk setiap kompetisi yang kamu ikuti
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-[#5b83c2]/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1d305f]">
            Kategori Kompetisi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md hover:bg-[#5b83c2]/5 transition duration-300 text-center cursor-pointer"
              >
                <h3 className="font-semibold text-lg mb-2 text-[#1d305f]">{category.name}</h3>
                <p className="text-[#bfbebf] text-sm">{category.count} kompetisi</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#1d305f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Siap Untuk Memulai Perjalanan Prestasimu?
          </h2>
          <p className="text-xl mb-8">
            Bergabung sekarang dan temukan peluang untuk berprestasi!
          </p>
          <Link
            to="/register"
            className="bg-[#fdd813] text-[#1d305f] px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition duration-300 inline-block"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Sample categories data
const categories = [
  { name: "Sains", count: 25 },
  { name: "Teknologi", count: 30 },
  { name: "Seni", count: 20 },
  { name: "Olahraga", count: 15 },
  { name: "Akademik", count: 35 },
  { name: "Bahasa", count: 18 },
  { name: "Musik", count: 22 },
  { name: "Robotik", count: 12 },
];

export default LandingPage; 