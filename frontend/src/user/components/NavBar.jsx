import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const NavBar = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(UserContext);
  const [showMenu, setShowMenu] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const logout = () => {
    if (setToken) setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("aToken");
    localStorage.removeItem("dToken");
    window.location.href = "/login";
  };


  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-gray-300 px-4 sm:px-6 lg:px-0">
      
      {/* Logo */}
      <img
        onClick={() => navigate('/')}
        className="h-14 w-auto cursor-pointer object-contain"
        src={assets.logo}
        alt="Logo"
      />

      {/* Desktop Navigation Links */}
      <ul className="hidden md:flex items-center gap-6 font-medium">
        {[
          { name: 'HOME', path: '/' },
          { name: 'ALL DOCTORS', path: '/doctors' },
          { name: 'ABOUT US', path: '/about' },
          { name: 'CONTACT US', path: '/contact' },
        ].map((item, idx) => (
          <NavLink key={idx} to={item.path} className="flex flex-col items-center">
            {({ isActive }) => (
              <>
                <li className="py-1">{item.name}</li>
                {isActive && (
                  <hr className="h-0.5 w-3/5 bg-primary border-none mt-1" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </ul>

      {/* Right Section: Desktop Logout Button */}
      <div className="flex items-center gap-4">

        {/* Dark/Light Toggle Button */}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
        >
          {darkMode ? (
            /* Sun Icon for Light Mode */
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            /* Moon Icon for Dark Mode */
            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        <button
          onClick={logout}
          className="hidden md:block bg-primary text-white px-8 py-2.5 rounded-full font-medium hover:bg-primary/90 transition cursor-pointer"
        >
          Logout
        </button>

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden cursor-pointer"
          src={assets.menu_icon}
          alt="Menu"
        />
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 bg-white transition-all duration-300
        ${showMenu ? 'w-full max-w-[300px]' : 'w-0 overflow-hidden'}`}
      >
        <div className="flex items-center justify-between px-5 py-6 border-b">
          <img className="w-32" src={assets.logo} alt="Logo" />
          <img
            className="w-7 cursor-pointer"
            onClick={() => setShowMenu(false)}
            src={assets.cross_icon}
            alt="Close"
          />
        </div>

        <ul className="flex flex-col items-start gap-4 mt-6 px-6 text-lg font-medium">
          <NavLink to="/" onClick={() => setShowMenu(false)}>
            <p className="py-2">HOME</p>
          </NavLink>
          <NavLink to="/doctors" onClick={() => setShowMenu(false)}>
            <p className="py-2">ALL DOCTORS</p>
          </NavLink>
          <NavLink to="/about" onClick={() => setShowMenu(false)}>
            <p className="py-2">ABOUT</p>
          </NavLink>
          <NavLink to="/contact" onClick={() => setShowMenu(false)}>
            <p className="py-2">CONTACT</p>
          </NavLink>

          {/* Mobile Logout Button */}
          <button
            onClick={logout}
            className="bg-primary text-white px-6 py-2.5 rounded-full mt-4 w-full text-base cursor-pointer hover:bg-primary/90 transition"
          >
            Logout
          </button>
        </ul>
      </div>
    </div>
  );
};

export default NavBar;