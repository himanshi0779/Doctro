import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);

  const logout = () => {
    if (aToken) {
      setAToken("");
      localStorage.removeItem("aToken");
    }
    navigate("/admin/login");
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white sticky top-0 z-40 shadow-sm">

      {/* Left Section */}
      <div className="flex items-center gap-3">
        <img
          src={assets.logo}
          alt="Admin Logo"
          className="w-28 sm:w-36 md:w-40 cursor-pointer flex-shrink-0"
          onClick={() => navigate("/admin")}
        />

        <p className="border px-3 py-1 rounded-full border-gray-400 text-gray-700 text-xs sm:text-sm whitespace-nowrap">
          Admin
        </p>
      </div>

      {/* Desktop Logout */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={logout}
          className="bg-[#5F65FF] text-white text-sm sm:text-base px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-[#4a54cc] transition"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden bg-gray-200 p-2 rounded-full"
        onClick={() => setShowSidebar(true)}
      >
        <img
          src={assets.menu_icon}
          alt="Menu"
          className="w-6 h-6 object-contain"
        />
      </button>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-6 flex flex-col gap-6 animate-slide-right">

          {/* Close Button */}
          <button
            className="self-end"
            onClick={() => setShowSidebar(false)}
          >
            <img
              src={assets.cross_icon}
              alt="Close"
              className="w-7 h-7 object-contain"
            />
          </button>

          {/* Sidebar Links */}
          <p
            onClick={() => {
              navigate("/admin");
              setShowSidebar(false);
            }}
            className="cursor-pointer hover:text-blue-600 text-lg"
          >
            Dashboard
          </p>

          <p
            onClick={() => {
              navigate("/admin/all-appointments");
              setShowSidebar(false);
            }}
            className="cursor-pointer hover:text-blue-600 text-lg"
          >
            Appointments
          </p>

          <p
            onClick={() => {
              navigate("/admin/add-doctor");
              setShowSidebar(false);
            }}
            className="cursor-pointer hover:text-blue-600 text-lg"
          >
            Add Doctor
          </p>

          <p
            onClick={() => {
              navigate("/admin/doctor-list");
              setShowSidebar(false);
            }}
            className="cursor-pointer hover:text-blue-600 text-lg"
          >
            Doctors List
          </p>

          {/* Logout Button in Sidebar */}
          <button
            onClick={logout}
            className="bg-[#5F65FF] text-white text-sm px-4 py-2 rounded-full hover:bg-[#4a54cc] transition mt-6"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
