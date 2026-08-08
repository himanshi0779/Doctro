import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const aToken = localStorage.getItem("aToken");
  const dToken = localStorage.getItem("dToken");
  const userRole = localStorage.getItem("role");

  // Helper to ensure token is non-empty and valid
  const isValid = (t) => Boolean(t) && t !== "null" && t !== "undefined";

  // 1. Admin Route Protection: MUST have aToken AND role === "admin"
  if (allowedRole === "admin") {
    if (!isValid(aToken) || userRole !== "admin") {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // 2. Doctor Route Protection: MUST have dToken AND role === "doctor"
  if (allowedRole === "doctor") {
    if (!isValid(dToken) || userRole !== "doctor") {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // 3. User Route Protection: MUST have standard token
  if (allowedRole === "user") {
    if (!isValid(token)) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  return children;
};

export default ProtectedRoute;