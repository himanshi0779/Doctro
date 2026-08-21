import { createContext, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    // Read and sanitize initial token from localStorage
    const getInitialToken = () => {
        const token = localStorage.getItem('aToken');
        if (!token || token === 'null' || token === 'undefined') return '';
        return token;
    };

    const [aToken, setAToken] = useState(getInitialToken());
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);

    // Sanitize base URL by stripping any trailing slash
    const rawBackendUrl = import.meta.env?.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    const backendUrl = rawBackendUrl.replace(/\/+$/, '');

    const getAuthHeaders = () => ({
        headers: {
            atoken: aToken,
            aToken: aToken,
            token: aToken,
            Authorization: `Bearer ${aToken}`
        }
    });

    const logoutAdmin = () => {
        setAToken('');
        localStorage.removeItem('aToken');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/all-doctors`, {}, getAuthHeaders());
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Get All Doctors Error:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/change-availability`, { docId }, getAuthHeaders());
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Change Availability Error:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, getAuthHeaders());
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Get All Appointments Error:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/cancel-appointment`, { appointmentId }, getAuthHeaders());
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Cancel Appointment Error:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, getAuthHeaders());
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Get Dash Data Error:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const value = {
        aToken, setAToken,
        backendUrl, doctors,
        getAllDoctors, changeAvailability,
        appointments, setAppointments,
        getAllAppointments,
        cancelAppointment,
        dashData,
        getDashData,
        logoutAdmin
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;