import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const UserContext = createContext();

const UserContextProvider = (props) => {

    const currencySymbol = '$';
    // Support both Vite (import.meta.env) and Create React App (process.env)
    const backendUrl = import.meta.env?.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    
    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [role, setRole] = useState(() => localStorage.getItem('role') || '');
    const [userData, setUserData] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);

    // Fetch doctors list for public homepage
    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list');
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message || "Failed to fetch doctors");
            }
        } catch (error) {
            console.log("Fetch Doctors Error:", error);
            toast.error(error.message);
        }
    };

    // Load Patient profile data ONLY if logged in as a normal 'user'
    const loadUserProfileData = async () => {
        const currentRole = localStorage.getItem('role') || role;

        // Skip fetching profile if not logged in or if user is Admin / Doctor
        if (!token) return setUserData(false);
        if (currentRole && currentRole !== 'user') return;

        setLoadingUser(true);
        try {
            // Note: Make sure backend header key matches what your middleware expects (token or atoken)
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { 
                headers: { token, atoken: token } 
            });

            if (data.success) {
                setUserData(data.userData);
            } else {
                // If it fails for a normal user, clear session
                setToken(null);
                setRole('');
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                toast.error(data.message);
            }
        } catch (error) {
            console.log("Profile Load Error:", error);
            setToken(null);
            setRole('');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            setUserData(false);
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