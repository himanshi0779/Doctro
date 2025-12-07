import React, { useContext, useState, useEffect, useRef} from 'react';
import { assets } from '../../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const NavBar = () => {
  const navigate = useNavigate();
  const { token, setToken, userData } = useContext(UserContext);

  const [showMenu, setShowMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    setToken(false);
    localStorage.removeItem('token');
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-gray-300 px-4 sm:px-6 lg:px-0">
      
      {/* Logo */}
      <img
        onClick={() => navigate('/')}
        className="h-14 w-auto sm:h-16 cursor-pointer object-contain"
        src={assets.logo}
        alt="Logo"
      />

      {/* Desktop Menu */}
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

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Profile Dropdown */}
        {token && userData ? (
          <div
            className="relative flex items-center gap-2 cursor-pointer"
            onClick={() => setOpenDropdown(prev => !prev)}
            ref={dropdownRef}
          >
            <img className="w-8 h-8 rounded-full object-cover" src={userData.image} alt="User" />
            <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown" />

            {/* Click Dropdown Menu */}
            {openDropdown && (
              <div
                className="absolute top-10 right-0 bg-stone-100 rounded shadow-md 
                w-44 py-3 px-3 flex flex-col gap-3 text-gray-600 font-medium z-30"
              >
                <p onClick={() => navigate('/my-profile')} className="hover:text-black cursor-pointer">
                  My Profile
                </p>
                <p onClick={() => navigate('/my-appointments')} className="hover:text-black cursor-pointer">
                  My Appointments
                </p>
                <p onClick={() => navigate('/admin/login')} className="hover:text-black cursor-pointer">
                  Admin Login
                </p>
                <p onClick={() => navigate('/doctor/login')} className="hover:text-black cursor-pointer">
                  Doctor Login
                </p>
                <p onClick={logout} className="hover:text-black cursor-pointer">
                  Logout
                </p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="hidden md:block bg-primary text-white px-8 py-3 rounded-full font-light hover:bg-primary/90 transition"
          >
            Create Account
          </button>
        )}

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden cursor-pointer"
          src={assets.menu_icon}
          alt="Menu"
        />
      </div>

      {/* Mobile Menu */}
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

          {!token && (
            <button
              onClick={() => {
                navigate('/login');
                setShowMenu(false);
              }}
              className="bg-primary text-white px-6 py-2 rounded-full mt-4"
            >
              Create Account
            </button>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
