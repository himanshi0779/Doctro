import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const getInitialToken = () => {
    const token = localStorage.getItem("aToken");
    if (!token || token === "null" || token === "undefined") return "";
    return token;
  };

  const [aToken, setAToken] = useState(getInitialToken());
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);

  const rawBackendUrl =
    import.meta.env?.VITE_BACKEND_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:4000";
  const backendUrl = rawBackendUrl.replace(/\/+$/, "");

  const getAuthHeaders = useCallback(
    () => ({
      headers: {
        atoken: aToken,
        token: aToken,
        Authorization: `Bearer ${aToken}`,
      },
    }),
    [aToken]
  );

  const logoutAdmin = () => {
    setAToken("");
    setDoctors([]);
    setAppointments([]);
    setDashData(null);
    localStorage.removeItem("aToken");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  const getAllDoctors = useCallback(async () => {
    if (!aToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/all-doctors`,
        getAuthHeaders()
      );
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Get All Doctors Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, [aToken, backendUrl, getAuthHeaders]);

  const changeAvailability = async (docId) => {
    if (!aToken) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-availability`,
        { docId },
        getAuthHeaders()
      );
      if (data.success) {
        toast.success(data.message);
        setDoctors((prevDocs) =>
          prevDocs.map((doc) =>
            doc._id === docId ? { ...doc, available: !doc.available } : doc
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Change Availability Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getAllAppointments = useCallback(async () => {
    if (!aToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/appointments`,
        getAuthHeaders()
      );
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Get All Appointments Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, [aToken, backendUrl, getAuthHeaders]);

  const cancelAppointment = async (appointmentId) => {
    if (!aToken) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/cancel-appointment`,
        { appointmentId },
        getAuthHeaders()
      );
      if (data.success) {
        toast.success(data.message);
        // Local state update for immediate UI reflection
        setAppointments((prevAppts) =>
          prevAppts.map((item) =>
            item._id === appointmentId ? { ...item, cancelled: true } : item
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Cancel Appointment Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getDashData = useCallback(async () => {
    if (!aToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/dashboard`,
        getAuthHeaders()
      );
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Get Dash Data Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  }, [aToken, backendUrl, getAuthHeaders]);
  
  useEffect(() => {
    if (aToken) {
      localStorage.setItem("aToken", aToken);
      localStorage.setItem("role", "admin");
    }
  }, [aToken]);

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,
    logoutAdmin,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;