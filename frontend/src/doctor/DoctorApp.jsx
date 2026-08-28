import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DoctorContext } from "./context/DoctorContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorProfile from "./pages/DoctorProfile";

const DoctorApp = () => {
  const { dToken } = useContext(DoctorContext);

  // Redirect to the unified login page if not authenticated
  const activeToken = dToken || localStorage.getItem("dToken");
  if (!activeToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      <Navbar />
      <div className="flex items-start">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-2 sm:p-4 md:p-6 overflow-x-hidden">
          <Routes>
            {/* Default index route */}
            <Route index element={<DoctorDashboard />} />

            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="profile" element={<DoctorProfile />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/doctor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DoctorApp;