import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import {
  FaCalendarAlt,
  FaPlusCircle,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

const Navbar = () => {
  const {
    backendurl,
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    isCheckingAuth,
  } = useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await axios.post(
        `${backendurl}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      setIsAuthenticated(false);
      setUser(null);

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error?.response?.data?.message || error.message);
      
      setIsAuthenticated(false);
      setUser(null);
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: <FaHome />, showAlways: true },
  ];

  if (isAuthenticated) {
    navItems.push(
      {
        path: "/events",
        label: "Events",
        icon: <FaCalendarAlt />,
        showAlways: false,
      },
      {
        path: "/create-event",
        label: "Create Event",
        icon: <FaPlusCircle />,
        showAlways: false,
      }
    );
  }

  if (isCheckingAuth) {
    return (
      <nav className="w-full bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse bg-gray-200 w-8 h-8 rounded-lg"></div>
              <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
            </div>
            <div className="hidden md:flex space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
            </div>
            <div className="md:hidden">
              <div className="animate-pulse bg-gray-200 h-6 w-6 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <div className="bg-linear-to-r from-blue-500 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">
                Eventify
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                    <FaUserCircle className="text-blue-600" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium">
                      {user?.name || "User"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isLoggingOut
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                  }`}
                >
                  <FaSignOutAlt />
                  <span>
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <FaUserPlus />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <div className="flex items-center space-x-2 mr-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                  <FaUserCircle className="text-blue-600" />
                </div>
              </div>
            )}
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 pt-2 pb-4">
            {isAuthenticated && user && (
              <div className="px-4 py-3 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                    <FaUserCircle className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-200 my-3"></div>

            {isAuthenticated ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isLoggingOut
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                  }`}
                >
                  <FaSignOutAlt />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  <FaUserPlus />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;