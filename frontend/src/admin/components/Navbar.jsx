import React, { useContext, useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);

  // Determine authentication status
  const activeToken = aToken || localStorage.getItem("aToken");
  const isAuthenticated = Boolean(
    activeToken &&
      activeToken !== "null" &&
      activeToken !== "undefined" &&
      activeToken !== ""
  );

  // Dark mode state initialization
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Sync dark class on document root (<html>)
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const logout = () => {
    if (setAToken) setAToken("");
    localStorage.removeItem("aToken");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("dToken");
    window.location.href = "/login";
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <img
          src={assets.logo}
          alt="Admin Logo"
          className="w-14 sm:w-14 md:w-14 cursor-pointer flex-shrink-0"
          onClick={() => navigate("/admin")}
        />

        <p className="border px-3 py-1 rounded-full border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap">
          Admin
        </p>
      </div>

      {/* Desktop Right Section (Toggle + Dynamic Auth Button) */}
      <div className="hidden md:flex items-center gap-4">
        {/* Dark/Light Toggle Button */}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
        >
          {darkMode ? (
            <svg
              className="w-5 h-5 text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {/* Dynamic Desktop Action: Logout when logged in, Login when logged out */}
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="bg-[#5F65FF] text-white text-sm sm:text-base px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-[#4a54cc] transition cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-[#5F65FF] text-white text-sm sm:text-base px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-[#4a54cc] transition cursor-pointer"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Controls (Toggle + Menu Button) */}
      <div className="flex md:hidden items-center gap-3">
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 transition cursor-pointer"
        >
          {darkMode ? (
            <svg
              className="w-5 h-5 text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        <button
          className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full cursor-pointer"
          onClick={() => setShowSidebar(true)}
        >
          <img
            src={assets.menu_icon}
            alt="Menu"
            className="w-6 h-6 object-contain dark:invert"
          />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-lg z-50 p-6 flex flex-col gap-6 animate-slide-right border-r border-gray-200 dark:border-gray-800">
          {/* Close Button */}
          <button
            className="self-end cursor-pointer"
            onClick={() => setShowSidebar(false)}
          >
            <img
              src={assets.cross_icon}
              alt="Close"
              className="w-7 h-7 object-contain dark:invert"
            />
          </button>

          {/* Sidebar Links */}
          <p
            onClick={() => {
              navigate("/admin");
              setShowSidebar(false);
            }}
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-lg"
          >
            Dashboard
          </p>

          <p
            onClick={() => {
              navigate("/admin/all-appointments");
              setShowSidebar(false);
            }}
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-lg"
          >
            Appointments
          </p>

          <p
            onClick={() => {
              navigate("/admin/add-doctor");
              setShowSidebar(false);
            }}
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-lg"
          >
            Add Doctor
          </p>

          <p
            onClick={() => {
              navigate("/admin/doctor-list");
              setShowSidebar(false);
            }}
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-lg"
          >
            Doctors List
          </p>

          {/* Mobile Dynamic Action Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="bg-[#5F65FF] text-white text-sm px-4 py-2 rounded-full hover:bg-[#4a54cc] transition mt-6 cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setShowSidebar(false);
                navigate("/login");
              }}
              className="bg-[#5F65FF] text-white text-sm px-4 py-2 rounded-full hover:bg-[#4a54cc] transition mt-6 cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;