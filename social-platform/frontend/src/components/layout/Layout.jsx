import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => (
  <div className="min-h-screen bg-surface">
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 py-6">
      <Outlet />
    </main>
  </div>
);

export default Layout;
