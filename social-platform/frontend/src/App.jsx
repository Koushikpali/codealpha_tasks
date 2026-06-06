import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1c1c28",
              color: "#f3f4f6",
              border: "1px solid #2a2a3d",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
            },
            success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
            error: { iconTheme: { primary: "#f87171", secondary: "#fff" } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes wrapped in Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
