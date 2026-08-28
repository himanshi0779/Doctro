import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserApp from "./user/UserApp";
import AdminApp from "./admin/AdminApp";
import DoctorApp from "./doctor/DoctorApp";
import Login from "./Login";
import ProtectedRoute from "./user/components/ProtectedRoute";
import { AdminContext } from "./admin/context/AdminContext";
import { DoctorContext } from "./doctor/context/DoctorContext";
import { UserContext } from "./user/context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { token, role } = useContext(UserContext);

  const isValid = (t) => t && t !== "null" && t !== "undefined" && t !== "";

  // Dynamic active portal determination from React Context + localStorage fallback
  const getAuthenticatedHome = () => {
    const activeRole = role || localStorage.getItem("role");
    const activeAToken = aToken || localStorage.getItem("aToken");
    const activeDToken = dToken || localStorage.getItem("dToken");
    const activeToken = token || localStorage.getItem("token");

    if (activeRole === "admin" && isValid(activeAToken)) return "/admin";
    if (activeRole === "doctor" && isValid(activeDToken)) return "/doctor";
    if (activeRole === "user" && isValid(activeToken)) return "/";
    return null;
  };

  const homePath = getAuthenticatedHome();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Universal Toast Container configured for full clickability */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable={true}
        pauseOnHover={true}
        style={{ zIndex: 99999 }}
      />

      <Routes>
        {/* Unified Login Route: redirects to portal if already authenticated */}
        <Route
          path="/login"
          element={homePath ? <Navigate to={homePath} replace /> : <Login />}
        />

        {/* Protected Admin Portal */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminApp />
            </ProtectedRoute>
          }
        />

        {/* Protected Doctor Portal */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorApp />
            </ProtectedRoute>
          }
        />

        {/* Public & Patient Application */}
        <Route path="/*" element={<UserApp />} />
      </Routes>
    </div>
  );
}

export default App;