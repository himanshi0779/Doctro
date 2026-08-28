import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminContext } from "./context/AdminContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AddDoctor from "./pages/AddDoctor";
import DoctorsList from "./pages/DoctorsList";
import AllAppointments from "./pages/AllAppointments";

function AdminApp() {
  const { aToken } = useContext(AdminContext);

  // Guard against unauthenticated access with localStorage fallback
  const activeToken = aToken || localStorage.getItem("aToken");
  if (!activeToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      <Navbar />

      <div className="flex items-start">
        <Sidebar />

        {/* Responsive Content Container */}
        <main className="flex-1 min-w-0 p-2 sm:p-4 md:p-6 overflow-x-hidden">
          <Routes>
            {/* Default admin index route */}
            <Route index element={<Dashboard />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="all-appointments" element={<AllAppointments />} />
            <Route path="add-doctor" element={<AddDoctor />} />
            <Route path="doctor-list" element={<DoctorsList />} />

            {/* Catch-all unmatched admin routes */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default AdminApp;