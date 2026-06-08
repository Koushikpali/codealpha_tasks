import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold tracking-tight">TaskFlow</Link>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-100">{user.name}</span>
          <button onClick={handleLogout} className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded transition">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
