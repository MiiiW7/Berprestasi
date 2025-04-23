import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const OrganizerDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [competitions, setCompetitions] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [participantsData, setParticipantsData] = useState({});
  const [loadingParticipants, setLoadingParticipants] = useState({});

  const BACKEND_URL = "http://localhost:9000";

  // Fetch user data and competitions on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== "penyelenggara") {
        navigate("/");
        return;
      }

      setIsLoading(true);
      try {
        // Fetch user profile data
        const profileResponse = await axios.get(`${BACKEND_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileResponse.data.success) {
          setUserData(profileResponse.data.data);
        }

        // Fetch competitions created by the organizer
        const competitionsResponse = await axios.get(`${BACKEND_URL}/post/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (competitionsResponse.data.success) {
          setCompetitions(competitionsResponse.data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, token, navigate]);

  // Function to fetch participants for a specific competition
  const fetchParticipants = async (postId) => {
    if (participantsData[postId]) return; // Don't fetch if we already have the data
    
    setLoadingParticipants(prev => ({ ...prev, [postId]: true }));
    
    try {
      const response = await axios.get(`${BACKEND_URL}/post/${postId}/followers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setParticipantsData(prev => ({
          ...prev,
          [postId]: response.data.data
        }));
      }
    } catch (err) {
      console.error(`Error fetching participants for post ${postId}:`, err);
    } finally {
      setLoadingParticipants(prev => ({ ...prev, [postId]: false }));
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Filter competitions based on active tab
  const filteredCompetitions = competitions.filter(comp => {
    if (activeTab === 'active') {
      return comp.status === "Belum Dilaksanakan";
    } else if (activeTab === 'completed') {
      return comp.status === "Telah Dilaksanakan";
    }
    return true; // 'all' tab
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5b83c2] border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <>
            {/* Dashboard Header */}
            <div className="bg-[#1d305f] rounded-2xl shadow-lg p-6 mb-8 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white overflow-hidden border-4 border-[#ffd800]">
                    <img 
                      src={userData?.profilePicture ? getImageUrl(userData.profilePicture) : "https://ui-avatars.com/api/?name=User&background=1d305f&color=fff&size=100"} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://ui-avatars.com/api/?name=User&background=1d305f&color=fff&size=100";
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Dashboard Penyelenggara</h1>
                    <p className="text-lg">{userData?.name || 'Penyelenggara'}</p>
                  </div>
                </div>
                <Link 
                  to="/create-post" 
                  className="bg-[#ffd800] hover:bg-yellow-400 text-[#1d305f] px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Buat Lomba Baru
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-1">Total Lomba</h3>
                  <p className="text-3xl font-bold">{competitions.length}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-1">Sedang Berjalan</h3>
                  <p className="text-3xl font-bold">
                    {competitions.filter(comp => comp.status === "Belum Dilaksanakan").length}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-1">Telah Selesai</h3>
                  <p className="text-3xl font-bold">
                    {competitions.filter(comp => comp.status === "Telah Dilaksanakan").length}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Competitions Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1d305f]">Lomba Anda</h2>
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'all' ? 'bg-[#1d305f] text-white' : 'text-gray-500 hover:text-[#1d305f]'}`}
                    onClick={() => setActiveTab('all')}
                  >
                    Semua
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'active' ? 'bg-[#1d305f] text-white' : 'text-gray-500 hover:text-[#1d305f]'}`}
                    onClick={() => setActiveTab('active')}
                  >
                    Berjalan
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'completed' ? 'bg-[#1d305f] text-white' : 'text-gray-500 hover:text-[#1d305f]'}`}
                    onClick={() => setActiveTab('completed')}
                  >
                    Selesai
                  </button>
                </div>
              </div>
              
              {filteredCompetitions.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 mb-4">Belum ada lomba {activeTab === 'active' ? 'yang sedang berjalan' : activeTab === 'completed' ? 'yang telah selesai' : ''}</p>
                  <Link
                    to="/create-post"
                    className="inline-flex items-center px-4 py-2 bg-[#1d305f] text-white rounded-lg hover:bg-[#5b83c2] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Buat Lomba Baru
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCompetitions.map(competition => (
                    <div key={competition.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 h-48 md:h-auto">
                          <img 
                            src={getImageUrl(competition.image)} 
                            alt={competition.title} 
                            className="w-full h-full object-cover bg-gray-100" 
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-bold text-[#1d305f]">{competition.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                competition.status === "Telah Dilaksanakan" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {competition.status}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {competition.categories.map((category, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {category}
                                </span>
                              ))}
                              {competition.jenjangs.map((jenjang, idx) => (
                                <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                  {jenjang}
                                </span>
                              ))}
                            </div>
                            
                            <p className="text-gray-600 mb-3 line-clamp-2">{competition.description}</p>
                            
                            <div className="text-sm text-gray-500 mb-3">
                              <p>Tanggal Pelaksanaan: {formatDate(competition.pelaksanaan)}</p>
                              <p>Peserta: {competition.followers?.length || 0} orang</p>
                            </div>
                            
                            <div className="mt-auto flex flex-wrap gap-2">
                              <Link 
                                to={`/post/${competition.id}`} 
                                className="bg-[#1d305f] text-white px-3 py-1.5 rounded hover:bg-[#5b83c2] transition-colors text-sm"
                              >
                                Lihat Detail
                              </Link>
                              <Link 
                                to={`/edit-post/${competition.id}`}
                                className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm"
                              >
                                Edit Lomba
                              </Link>
                              <button 
                                onClick={() => fetchParticipants(competition.id)}
                                className="bg-[#ffd800] text-[#1d305f] px-3 py-1.5 rounded hover:bg-yellow-400 transition-colors text-sm flex items-center gap-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                Lihat Peserta
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Participants Panel (Expandable) */}
                      {participantsData[competition.id] && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <h4 className="font-medium text-[#1d305f] mb-3">Daftar Peserta ({participantsData[competition.id].length})</h4>
                          
                          {loadingParticipants[competition.id] ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#5b83c2] border-t-transparent"></div>
                            </div>
                          ) : participantsData[competition.id].length === 0 ? (
                            <p className="text-gray-500 text-center py-2">Belum ada peserta yang mengikuti lomba ini</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {participantsData[competition.id].map(participant => (
                                <div key={participant.id} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-100">
                                  <img 
                                    src={participant.profilePicture ? getImageUrl(participant.profilePicture) : "https://ui-avatars.com/api/?name=User&background=1d305f&color=fff&size=100"}
                                    alt={participant.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "https://ui-avatars.com/api/?name=User&background=1d305f&color=fff&size=100";
                                    }}
                                  />
                                  <div className="overflow-hidden">
                                    <p className="font-medium text-[#1d305f] truncate">{participant.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <button
                            onClick={() => setParticipantsData(prev => ({...prev, [competition.id]: null}))}
                            className="text-sm text-gray-500 hover:text-gray-700 mt-3 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Tutup
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default OrganizerDashboard; 