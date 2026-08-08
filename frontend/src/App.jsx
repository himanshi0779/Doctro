import { Routes, Route, Navigate } from "react-router-dom";
import UserApp from "./user/UserApp";
import AdminApp from "./admin/AdminApp";
import DoctorApp from "./doctor/DoctorApp";
import UserLogin from "./user/pages/Login";
import ProtectedRoute from "./user/components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const role = localStorage.getItem("role");
  const aToken = localStorage.getItem("aToken");
  const dToken = localStorage.getItem("dToken");
  const token = localStorage.getItem("token");

  const isValid = (t) => t && t !== "null" && t !== "undefined" && t !== "";

  // Strictly check that BOTH the role and its specific token exist
  const getAuthenticatedHome = () => {
    if (role === "admin" && isValid(aToken)) return "/admin";
    if (role === "doctor" && isValid(dToken)) return "/doctor";
    if (role === "user" && isValid(token)) return "/";
    return null; // Stay on /login if role-specific token is missing!
  };

  const homePath = getAuthenticatedHome();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Only redirect away from /login if the role-specific token actually exists */}
        <Route
          path="/login"
          element={homePath ? <Navigate to={homePath} replace /> : <UserLogin />}
        />

        {/* Protected Admin Route */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminApp />
            </ProtectedRoute>
          }
        />

        {/* Protected Doctor Route */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorApp />
            </ProtectedRoute>
          }
        />

        {/* Protected Patient/User Route */}
        <Route
          path="/*"
          element={
            <ProtectedRoute allowedRole="user">
              <UserApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;