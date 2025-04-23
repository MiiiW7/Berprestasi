import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import DetailPost from "./pages/DetailPost";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import CategoryPage from "./pages/CategoryPage";
import JenjangPage from "./pages/JenjangPage";
import EditPost from "./pages/EditPost";
import Lomba from "./pages/Lomba";
import NotificationPage from "./pages/NotificationPage";
import NotificationPenyelenggara from "./pages/NotificationPenyelenggara";
import SearchPage from "./pages/SearchPage";
import LandingPage from "./pages/LandingPage";
import OrganizerDashboard from "./pages/OrganizerDashboard";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user 
            ? user.role === "penyelenggara" 
              ? <OrganizerDashboard /> 
              : <Home />
            : <LandingPage />
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/post/:id" element={<DetailPost />} />
      <Route
        path="/create-post"
        element={
          <ProtectedRoute roles={["penyelenggara"]}>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/kategori/:category" element={<CategoryPage />} />
      <Route path="/jenjang/:jenjang" element={<JenjangPage />} />
      <Route
        path="/edit-post/:id"
        element={
          <ProtectedRoute role="penyelenggara">
            <EditPost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lomba"
        element={
          <ProtectedRoute>
            <Lomba />
          </ProtectedRoute>
        }
      />
      <Route path="/notifications" element={<NotificationPage />} />
      <Route
        path="/notifications-penyelenggara"
        element={
          <ProtectedRoute roles={["penyelenggara"]}>
            <NotificationPenyelenggara />
          </ProtectedRoute>
        }
      />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute roles={["penyelenggara"]}>
          <OrganizerDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;