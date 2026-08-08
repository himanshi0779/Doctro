import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const NavBar = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(UserContext);
  const [showMenu, setShowMenu] = useState(false);

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