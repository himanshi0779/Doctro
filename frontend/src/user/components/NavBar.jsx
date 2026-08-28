import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const NavBar = () => {
  const navigate = useNavigate();
  const { token, setToken } = useContext(UserContext);
  const [showMenu, setShowMenu] = useState(false);

  // Authentication check
  const activeToken = token || localStorage.getItem("token");
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
    if (setToken) setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("aToken");
    localStorage.removeItem("dToken");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 sm:px-6 lg:px-0 transition-colors duration-200">
      
      {/* Brand Logo */}
      <img
        onClick={() => navigate('/')}
        className="h-14 w-auto cursor-pointer object-contain"
        src={assets.logo}
        alt="Doctor App Logo"
      />

      {/* Desktop Navigation Links */}
      <ul className="hidden md:flex items-center gap-6 font-medium">
        {[
          { name: 'HOME', path: '/' },
          { name: 'ALL DOCTORS', path: '/doctors' },
          { name: 'ABOUT US', path: '/about' },
          { name: 'CONTACT US', path: '/contact' },
        ].map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className="flex flex-col items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {({ isActive }) => (
              <>
                <li className="py-1">{item.name}</li>
                {isActive && (
                  <hr className="h-0.5 w-3/5 bg-[#5F65FF] border-none mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </ul>

      {/* Right Action Section */}
      <div className="flex items-center gap-4">

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
        >
          {darkMode ? (
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {/* Desktop Conditional Action Button */}
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="hidden md:block bg-[#5F65FF] hover:bg-blue-600 text-white px-8 py-2.5 rounded-full font-medium transition cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="hidden md:block bg-[#5F65FF] hover:bg-blue-600 text-white px-8 py-2.5 rounded-full font-medium transition cursor-pointer"
          >
            Create account
          </button>
        )}

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setShowMenu(true)}
          className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <img
            className="w-5 h-5 dark:invert"
            src={assets.menu_icon}
            alt="Menu"
          />
        </button>
      </div>

      {/* Mobile Drawer */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs md:hidden animate-fadeIn">
          <div className="h-full w-full max-w-[300px] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 flex flex-col justify-between shadow-2xl border-l border-gray-200 dark:border-gray-800 animate-slide-right">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                <img className="w-32 object-contain" src={assets.logo} alt="Logo" />
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                  aria-label="Close menu"
                >
                  <img src={assets.cross_icon} alt="Close" className="w-6 h-6 dark:invert" />
                </button>
              </div>

              {/* Drawer Links */}
              <ul className="flex flex-col gap-3 mt-6 text-base font-medium">
                {[
                  { name: 'HOME', path: '/' },
                  { name: 'ALL DOCTORS', path: '/doctors' },
                  { name: 'ABOUT US', path: '/about' },
                  { name: 'CONTACT US', path: '/contact' },
                ].map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={item.path}
                    onClick={() => setShowMenu(false)}
                    className={({ isActive }) =>
                      `py-2 px-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </ul>
            </div>

            {/* Mobile Action Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    logout();
                  }}
                  className="bg-[#5F65FF] hover:bg-blue-600 text-white px-6 py-2.5 rounded-full w-full text-base font-medium cursor-pointer transition shadow-md"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/login');
                  }}
                  className="bg-[#5F65FF] hover:bg-blue-600 text-white px-6 py-2.5 rounded-full w-full text-base font-medium cursor-pointer transition shadow-md"
                >
                  Create account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;