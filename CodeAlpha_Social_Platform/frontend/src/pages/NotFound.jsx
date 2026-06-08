import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center px-4">
    <p className="text-8xl mb-4">🔭</p>
    <h1 className="font-display font-black text-6xl text-white mb-2">404</h1>
    <p className="text-gray-400 text-lg mb-6">This page doesn't exist in our universe.</p>
    <Link to="/" className="btn-primary px-8 py-3">← Back to Feed</Link>
  </div>
);

export default NotFound;
