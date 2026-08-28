import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const UserContext = createContext();

const UserContextProvider = (props) => {
  const currencySymbol = "$";

  // Sanitize base URL
  const rawBackendUrl =
    import.meta.env?.VITE_BACKEND_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:4000";
  const backendUrl = rawBackendUrl.replace(/\/+$/, "");

  const getInitialToken = () => {
    const t = localStorage.getItem("token");
    if (!t || t === "null" || t === "undefined") return "";
    return t;
  };

  const getInitialRole = () => {
    const r = localStorage.getItem("role");
    if (!r || r === "null" || r === "undefined") return "";
    return r;
  };

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(getInitialToken);
  const [role, setRole] = useState(getInitialRole);
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);

  const getAuthHeaders = useCallback(
    () => ({
      headers: {
        token: token,
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const logoutUser = useCallback(() => {
    setToken("");
    setRole("");
    setUserData(null);
    setAppointments([]);
    localStorage.removeItem("token");
    if (localStorage.getItem("role") === "user") {
      localStorage.removeItem("role");
    }
  }, []);

  // 1. Fetch public doctors list
  const getDoctorsData = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message || "Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Fetch Doctors Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, [backendUrl]);

  // 2. Load user profile (strictly for role === 'user')
  const loadUserProfileData = useCallback(async () => {
    const currentRole = localStorage.getItem("role") || role;
    const currentToken = localStorage.getItem("token") || token;

    if (!currentToken || currentRole !== "user") {
      setUserData(null);
      return;
    }

    setLoadingUser(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/get-profile`,
        getAuthHeaders()
      );

      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "Could not load user profile");
      }
    } catch (error) {
      console.error("Profile Load Error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logoutUser();
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    } finally {
      setLoadingUser(false);
    }
  }, [token, role, backendUrl, getAuthHeaders, logoutUser]);

  // 3. Fetch user appointments
  const getUserAppointments = useCallback(async () => {
    const currentRole = localStorage.getItem("role") || role;
    if (!token || currentRole !== "user") return;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/appointments`,
        getAuthHeaders()
      );
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Get User Appointments Error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logoutUser();
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  }, [token, role, backendUrl, getAuthHeaders, logoutUser]);

  // 4. Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    if (!token) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        getAuthHeaders()
      );
      if (data.success) {
        toast.success(data.message);
        setAppointments((prev) =>
          prev.map((item) =>
            item._id === appointmentId ? { ...item, cancelled: true } : item
          )
        );
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Cancel Appointment Error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logoutUser();
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  // Sync token changes safely across app state and storage
  useEffect(() => {
    if (token) {
      const activeRole = localStorage.getItem("role");
      if (!activeRole || activeRole === "user") {
        localStorage.setItem("token", token);
        localStorage.setItem("role", "user");
        setRole("user");
        loadUserProfileData();
      }
    } else {
      localStorage.removeItem("token");
      if (localStorage.getItem("role") === "user") {
        localStorage.removeItem("role");
      }
      setRole("");
      setUserData(null);
      setAppointments([]);
    }
  }, [token, loadUserProfileData]);

  // Initial public data load
  useEffect(() => {
    getDoctorsData();
  }, [getDoctorsData]);

  // Handle storage changes across multiple browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setToken(e.newValue || "");
      }
      if (e.key === "role") {
        setRole(e.newValue || "");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = {
    doctors,
    setDoctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    role,
    setRole,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    loadingUser,
    appointments,
    setAppointments,
    getUserAppointments,
    cancelAppointment,
    logoutUser,
  };

  return (
    <UserContext.Provider value={value}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;