import { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const rawBackendUrl =
    import.meta.env?.VITE_BACKEND_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:4000";
  const backendUrl = rawBackendUrl.replace(/\/+$/, "");

  const getInitialToken = () => {
    const token = localStorage.getItem("dToken");
    if (!token || token === "null" || token === "undefined") return "";
    return token;
  };

  const [dToken, setDToken] = useState(getInitialToken());
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const getHeaders = useCallback(
    () => ({
      headers: {
        dtoken: dToken,
        token: dToken,
        Authorization: `Bearer ${dToken}`,
      },
    }),
    [dToken]
  );

  const logoutDoctor = useCallback(() => {
    setDToken("");
    setAppointments([]);
    setDashData(null);
    setProfileData(null);
    localStorage.removeItem("dToken");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  // Sync token changes to localStorage and clean up state when cleared
  useEffect(() => {
    if (dToken) {
      localStorage.setItem("dToken", dToken);
      localStorage.setItem("role", "doctor");
    } else {
      localStorage.removeItem("dToken");
      if (localStorage.getItem("role") === "doctor") {
        localStorage.removeItem("role");
      }
      setAppointments([]);
      setDashData(null);
      setProfileData(null);
    }
  }, [dToken]);

  const getAppointments = useCallback(async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/appointments`,
        getHeaders()
      );
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Get Appointments Error:", error);
      if (error.response?.status === 401) {
        logoutDoctor();
      }
      toast.error(error.response?.data?.message || error.message);
    }
  }, [dToken, backendUrl, getHeaders, logoutDoctor]);

  const completeAppointment = async (appointmentId) => {
    if (!dToken) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/complete-appointment`,
        { appointmentId },
        getHeaders()
      );
      if (data.success) {
        toast.success(data.message);
        setAppointments((prev) =>
          prev.map((item) =>
            item._id === appointmentId ? { ...item, isCompleted: true } : item
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Complete Appointment Error:", error);
      if (error.response?.status === 401) {
        logoutDoctor();
      }
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!dToken) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/cancel-appointment`,
        { appointmentId },
        getHeaders()
      );
      if (data.success) {
        toast.success(data.message);
        setAppointments((prev) =>
          prev.map((item) =>
            item._id === appointmentId ? { ...item, cancelled: true } : item
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Cancel Appointment Error:", error);
      if (error.response?.status === 401) {
        logoutDoctor();
      }
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getDashData = useCallback(async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/dashboard`,
        getHeaders()
      );
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Get Dashboard Data Error:", error);
      if (error.response?.status === 401) {
        logoutDoctor();
      }
      toast.error(error.response?.data?.message || error.message);
    }
  }, [dToken, backendUrl, getHeaders, logoutDoctor]);

  const getProfileData = useCallback(async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/profile`,
        getHeaders()
      );
      if (data.success) {
        setProfileData(data.profileData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Get Profile Error:", error);
      if (error.response?.status === 401) {
        logoutDoctor();
      }
      toast.error(error.response?.data?.message || error.message);
    }
  }, [dToken, backendUrl, getHeaders, logoutDoctor]);

  const updateProfileData = async (updatePayload) => {
    if (!dToken) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        updatePayload,
        getHeaders()
      );
      if (data.success) {
        toast.success(data.message);
        setProfileData(data.profileData);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
      if (error.response?.status === 401) {
        logoutDoctor();
      }
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    updateProfileData,
    logoutDoctor,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;