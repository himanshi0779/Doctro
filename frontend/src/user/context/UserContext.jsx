import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const UserContext = createContext();

const UserContextProvider = (props) => {

    const currencySymbol = '$';
    
    // Sanitize base URL by stripping any trailing slash
    const rawBackendUrl = import.meta.env?.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    const backendUrl = rawBackendUrl.replace(/\/+$/, '');
    
    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [role, setRole] = useState(() => localStorage.getItem('role') || '');
    const [userData, setUserData] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);

    // Fetch doctors list for public homepage
    const getDoctorsData = async () => {
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
    };

    // Load Patient profile data ONLY if logged in as a normal 'user'
    const loadUserProfileData = async () => {
        const currentRole = localStorage.getItem('role') || role;

        if (!token) return setUserData(false);
        if (currentRole && currentRole !== 'user') return;

        setLoadingUser(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, { 
                headers: { 
                    token: token,
                    atoken: token,
                    Authorization: `Bearer ${token}` 
                } 
            });

            if (data.success) {
                setUserData(data.userData);
            } else {
                console.warn("Profile load returned unsuccessful:", data.message);
                toast.error(data.message || "Could not load user profile");
            }
        } catch (error) {
            console.error("Profile Load Error:", error);
            const msg = error.response?.data?.message || error.message;
            toast.error(msg);
        } finally {
            setLoadingUser(false);
        }
    };

    useEffect(() => {
        getDoctorsData();
    }, []);

    useEffect(() => {
        if (token) {
            const currentRole = localStorage.getItem('role');
            setRole(currentRole);
            if (currentRole === 'user' || !currentRole) {
                loadUserProfileData();
            }
        } else {
            setUserData(null);
        }
    }, [token]);

    const value = {
        doctors, getDoctorsData,
        currencySymbol,
        token, setToken,
        role, setRole,
        backendUrl,
        userData, setUserData,
        loadUserProfileData,
        loadingUser
    };

    return (
        <UserContext.Provider value={value}>
            {props.children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;