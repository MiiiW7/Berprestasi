/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "../utils/axios"; // Gunakan axios instance yang sudah dikonfigurasi

const AuthContext = createContext(null);

// Mode maintenance - aktifkan jika backend mengalami masalah
const MAINTENANCE_MODE = false; // Ubah ke true untuk mengaktifkan mode maintenance
const DEMO_USERS = [
  { email: "demo@example.com", password: "demo123", role: "user", name: "Demo User" },
  { email: "admin@example.com", password: "admin123", role: "admin", name: "Demo Admin" }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (token) {
        try {
          // Gunakan axios instance dari utils/axios.js
          const response = await api.get('/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data.data);
        } catch (error) {
          console.error('Error loading user data:', error);
          // Handle error (misalnya logout jika token invalid)
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
    };

    loadUserData();
  }, [token]);

  const logout = useCallback(async () => {
    try {
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      
      if (token) {
        if (isAdmin) {
          // Admin logout - just clear local storage, no need for backend call
          console.log("Admin logout detected");
        } else {
          // Regular user logout
          await api.post(
            "/user/auth/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      setToken(null);
      setUser(null);
      setError(null);
      
      // Always redirect to login page after logout
      window.location.href = "/login";
    }
  }, [token]);

  const checkAuth = useCallback(async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const isAdmin = localStorage.getItem("isAdmin") === "true";
      
      if (isAdmin) {
        // Check with admin verify endpoint
        try {
          const response = await api.get("/admin/dashboard/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            setUser({...response.data.admin, isAdmin: true});
            setError(null);
          } else {
            throw new Error("Admin verification failed");
          }
        } catch (adminError) {
          console.error("Admin auth check failed:", adminError);
          logout();
        }
      } else {
        // Regular user verification
        const response = await api.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.data);
        setError(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      // Jika dalam mode maintenance, gunakan login demo
      if (MAINTENANCE_MODE) {
        console.log("MAINTENANCE MODE: Using demo login");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulasi delay
        
        const demoUser = DEMO_USERS.find(user => 
          user.email === credentials.email && user.password === credentials.password
        );
        
        if (!demoUser) {
          throw new Error("Email atau password salah (Demo Mode)");
        }
        
        const isAdmin = demoUser.role === 'admin';
        
        // Simulasi respons dari backend
        if (isAdmin) {
          localStorage.setItem("token", "demo-admin-token");
          localStorage.setItem("isAdmin", "true");
          setToken("demo-admin-token");
          setUser({...demoUser, isAdmin: true});
          setError(null);
          
          console.log("DEMO: Admin login detected, redirecting to admin dashboard...");
          alert("DEMO MODE: Admin login berhasil. Dalam mode produksi, Anda akan dialihkan ke dashboard admin.");
          
          return { ...demoUser, isAdmin: true };
        } else {
          localStorage.setItem("token", "demo-user-token");
          localStorage.removeItem("isAdmin");
          setToken("demo-user-token");
          setUser(demoUser);
          setError(null);
          return demoUser;
        }
      }
      
      // Kode login normal jika tidak dalam mode maintenance
      // Try regular user login first
      let response;
      let isAdmin = false;
      let loginError = null;
      
      // Fungsi helper untuk pengecualian jika terjadi timeout
      const tryLoginEndpoint = async (endpoint, creds, isAdminLogin = false) => {
        try {
          console.log(`Attempting ${isAdminLogin ? 'admin' : 'user'} login to ${endpoint}`);
          const resp = await api.post(
            endpoint,
            creds,
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 30000, // 30s timeout untuk login khususnya
            }
          );
          return { success: true, response: resp, error: null };
        } catch (err) {
          console.error(`${isAdminLogin ? 'Admin' : 'User'} login error:`, err.message);
          return { success: false, response: null, error: err };
        }
      };
      
      // Coba login user
      const userLoginResult = await tryLoginEndpoint("/user/auth/login", credentials);
      
      if (userLoginResult.success) {
        response = userLoginResult.response;
        
        // Check if this is an admin user from regular login
        if (response.data.data && response.data.data.role === "admin") {
          isAdmin = true;
        }
      } else {
        loginError = userLoginResult.error;
        
        // Jika login user gagal, coba login admin
        const adminLoginResult = await tryLoginEndpoint("/admin/dashboard/login", credentials, true);
        
        if (adminLoginResult.success) {
          response = adminLoginResult.response;
          isAdmin = true;
          loginError = null;
        } else {
          // Kedua login gagal
          throw loginError || adminLoginResult.error;
        }
      }
  
      // Handle response based on whether it's admin or regular user
      if (isAdmin) {
        const { token, admin } = response.data.admin ? response.data : { token: response.data.token, admin: response.data.data };
  
        if (!token) {
          throw new Error("Invalid response from server");
        }
  
        localStorage.setItem("token", token);
        localStorage.setItem("isAdmin", "true");
        setToken(token);
        setUser({...admin, isAdmin: true});
        setError(null);
        
        // Redirect to admin dashboard immediately with proper URL
        console.log("Admin login detected, redirecting to admin dashboard...");
        
        // Use better URL detection for redirects
        const isProd = window.location.hostname !== 'localhost';
        const adminDashboardUrl = isProd 
          ? 'https://berprestasi-admin.vercel.app'  // Update this with your actual admin URL
          : 'http://localhost:3000';
          
        window.location.href = adminDashboardUrl;
        return { ...admin, isAdmin: true };
      } else {
        const { token, data } = response.data;
  
        if (!token || !data) {
          throw new Error("Invalid response from server");
        }
  
        localStorage.setItem("token", token);
        localStorage.removeItem("isAdmin");
        setToken(token);
        setUser(data);
        setError(null);
        return data;
      }
    } catch (error) {
      console.error("Login error:", error.response || error);
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      if (!token) {
        throw new Error("No token available");
      }

      const response = await api.put(
        "/user/profile",
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setUser(response.data.data);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Update failed";
      setError(errorMessage);
      throw error;
    }
  };

  const verifyToken = async () => {
    try {
      if (!token) return false;

      const response = await api.get("/user/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.success;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    updateProfile,
    checkAuth,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;