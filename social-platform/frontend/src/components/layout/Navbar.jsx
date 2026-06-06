import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../api/users";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setResults([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await userAPI.search(query);
        setResults(data.users);
      } catch { /* silent */ } finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navLink = (path, label, icon) => {
    const active = location.pathname === path;
    return (
      <Link to={path} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all duration-200 ${active ? "bg-brand-600/20 text-brand-400" : "text-gray-400 hover:text-white hover:bg-surface-hover"}`}>
        <span>{icon}</span>{label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-black text-sm">DC</span>
          </div>
          <span className="font-display font-bold text-white hidden sm:block">DevConnect</span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-xs" ref={searchRef}>
          <input
            type="text"
            placeholder="Search developers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface-raised border border-surface-border text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
          {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border border-brand-500 border-t-transparent rounded-full animate-spin" />}

          {results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
              {results.map((u) => (
                <Link key={u._id} to={`/profile/${u.username}`} onClick={() => { setQuery(""); setResults([]); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors">
                  <Avatar src={u.profileImage} username={u.username} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">@{u.username}</p>
                    {u.bio && <p className="text-xs text-gray-500 truncate max-w-[200px]">{u.bio}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLink("/", "Feed", "⚡")}
          {navLink("/explore", "Explore", "🌐")}
        </nav>

        {/* User Menu */}
        <div className="ml-auto relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 hover:bg-surface-hover px-2 py-1.5 rounded-xl transition-colors">
            <Avatar src={user?.profileImage} username={user?.username || "?"} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-gray-300">@{user?.username}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-surface-border">
                <p className="text-sm font-display font-semibold text-white">{user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link to={`/profile/${user?.username}`} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-surface-hover hover:text-white transition-colors">
                <span>👤</span> My Profile
              </Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-surface-hover hover:text-white transition-colors">
                <span>⚙️</span> Settings
              </Link>
              <div className="border-t border-surface-border">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors">
                  <span>🚪</span> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
