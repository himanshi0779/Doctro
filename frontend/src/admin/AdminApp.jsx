import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AdminContext } from "./context/AdminContext";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AddDoctor from "./pages/AddDoctor";
import DoctorsList from "./pages/DoctorsList";
import AllAppointments from "./pages/AllAppointments";

function AdminApp() {
  const { aToken } = useContext(AdminContext);

  // Require login for admin portal — redirect to unified /login if missing aToken
  if (!aToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />

      <Navbar />
      <div className="flex items-start">
        <Sidebar />

        <Routes>
          {/* Default admin route = dashboard */}
          <Route index element={<Dashboard />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="all-appointments" element={<AllAppointments />} />
          <Route path="add-doctor" element={<AddDoctor />} />
          <Route path="doctor-list" element={<DoctorsList />} />

          {/* Invalid admin URLs → redirect to dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>

      </div>
    </div>
  );
}

export default AdminApp;