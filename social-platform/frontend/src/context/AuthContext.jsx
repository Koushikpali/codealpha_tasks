import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api/auth";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("devconnect_token"));
  const [loading, setLoading] = useState(true);

  // Persist token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("devconnect_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("devconnect_token");
      localStorage.removeItem("devconnect_user");
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // On mount, verify token and hydrate user
  useEffect(() => {
    const init = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
        localStorage.setItem("devconnect_user", JSON.stringify(data.user));
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("devconnect_user", JSON.stringify(data.user));
    return data;
  }, []);

  const login = useCallback(async (formData) => {
    const { data } = await authAPI.login(formData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("devconnect_user", JSON.stringify(data.user));
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("devconnect_user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
