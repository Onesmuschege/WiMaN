// src/components/layout/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-lg">
      <div className="flex justify-between items-center">
        {/* Left side (Links) */}
        <div className="flex space-x-6">
          <Link to="/" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/networks" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Networks
              </Link>
              <Link to="/devices" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Devices
              </Link>
              <Link to="/subscriptions" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Subscriptions
              </Link>
            </>
          )}

          {isAdmin && (
            <div className="relative group">
              <button className="hover:text-gray-300 flex items-center">
                Admin <span className="ml-1">▼</span>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>
                  Users
                </Link>
                <Link to="/admin/subscriptions" className="block px-4 py-2 hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>
                  Subscriptions
                </Link>
                <Link to="/admin/settings" className="block px-4 py-2 hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>
                  Settings
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right side (Logo & Auth) */}
        <div className="flex items-center">
          {/* WIMAN Logo */}
          <Link to="/" className="text-xl font-bold text-blue-400">
            WIMAN
          </Link>

          {/* Authentication Buttons */}
          <div className="ml-6">
            {isAuthenticated ? (
              <button className="hover:text-red-400" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-300 mr-4" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="ml-4 lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 space-y-2 bg-gray-800 p-4 rounded-lg">
          <Link to="/" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/networks" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Networks
              </Link>
              <Link to="/devices" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Devices
              </Link>
              <Link to="/subscriptions" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Subscriptions
              </Link>
            </>
          )}

          {isAdmin && (
            <div>
              <p className="font-semibold">Admin</p>
              <Link to="/admin/users" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Users
              </Link>
              <Link to="/admin/subscriptions" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Subscriptions
              </Link>
              <Link to="/admin/settings" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Settings
              </Link>
            </div>
          )}

          {isAuthenticated ? (
            <button className="w-full text-left hover:text-red-400" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
