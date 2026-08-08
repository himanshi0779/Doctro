import React, { useContext, useState } from 'react';
import { AppContext } from '../../AppContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);

  const logout = () => {
    if (dToken) {
      setDToken('');
      localStorage.removeItem('dToken');
      localStorage.removeItem('token');
      localStorage.removeItem('aToken')
      localStorage.removeItem('role');
      window.location.href="/login"
    }
  };

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      {/* Logo and user info */}
      <div className='flex items-center gap-2'>
        <img className='w-28 sm:w-36 cursor-pointer' src={assets.logo} alt="Logo" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600 text-xs sm:text-sm'>
          {dToken ? 'Doctor' : 'Admin'}
        </p>
      </div>

      {/* Desktop actions */}
      <div className='hidden md:flex items-center gap-4'>
        <button
          onClick={logout}
          className='bg-[#5F65FF] text-white text-sm px-6 py-2 rounded-full hover:bg-blue-600 transition-colors'
        >
          Logout
        </button>
      </div>

      {/* Mobile menu toggle */}
      <button
        className='md:hidden bg-gray-200 p-2 rounded-full'
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <img src={assets.menu_icon} alt="Menu" className='w-5 h-5' />
      </button>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div className='fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-md p-5 flex flex-col gap-4 md:hidden'>
          <button className='self-end mb-4' onClick={() => setShowSidebar(false)}>
            <img src={assets.cross_icon} alt="Close" className='w-6' />
          </button>
          <p
            className='cursor-pointer hover:text-blue-600'
            onClick={() => { navigate('/doctor/dashboard'); setShowSidebar(false); }}
          >
            Dashboard
          </p>
          <p
            className='cursor-pointer hover:text-blue-600'
            onClick={() => { navigate('/doctor/appointments'); setShowSidebar(false); }}
          >
            Appointments
          </p>
          <p
            className='cursor-pointer hover:text-blue-600'
            onClick={() => { navigate('/doctor/profile'); setShowSidebar(false); }}
          >
            Profile
          </p>
          <button
            onClick={() => { logout(); setShowSidebar(false); }}
            className='bg-[#5F65FF] text-white text-sm px-4 py-2 rounded-full mt-4'
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
