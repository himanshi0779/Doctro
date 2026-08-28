import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { AdminContext } from "./admin/context/AdminContext";
import { DoctorContext } from "./doctor/context/DoctorContext";
import { UserContext } from "./user/context/UserContext";
import { assets } from "./assets/assets";

const Login = () => {
  const navigate = useNavigate();

  // Mode: "Login" or "Sign Up"
  const [state, setState] = useState("Login");

  // Context Hooks
  const { setAToken, backendUrl: adminBackendUrl } = useContext(AdminContext);
  const { setDToken, backendUrl: docBackendUrl } = useContext(DoctorContext);
  const { setToken, backendUrl: userBackendUrl } = useContext(UserContext);

  const backendUrl =
    userBackendUrl || adminBackendUrl || docBackendUrl || "http://localhost:4000";

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

  // Clear previous session tokens
  const clearSession = () => {
    localStorage.removeItem("aToken");
    localStorage.removeItem("dToken");
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setAToken?.("");
    setDToken?.("");
    setToken?.("");
  };

  // Submit Handler: Sign Up or Log In
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (state === "Sign Up") {
        // --- PATIENT REGISTRATION ---
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name: name.trim(),
          email: email.trim(),
          password: password,
        });

        if (data.success) {
          clearSession();
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", "user");
          setToken(data.token);
          toast.success("Account created successfully!");
          navigate("/");
        } else {
          toast.error(data.message || "Registration failed");
        }
      } else {
        // --- UNIFIED LOGIN (Admin / Doctor / User) ---
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email: email.trim(),
          password: password,
        });

        if (data.success) {
          clearSession();

          if (data.role === "admin") {
            localStorage.setItem("aToken", data.token);
            localStorage.setItem("role", "admin");
            setAToken(data.token);
            toast.success("Admin Login Successful");
            navigate("/admin");
          } else if (data.role === "doctor") {
            localStorage.setItem("dToken", data.token);
            localStorage.setItem("role", "doctor");
            setDToken(data.token);
            toast.success("Doctor Login Successful");
            navigate("/doctor");
          } else if (data.role === "user") {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", "user");
            setToken(data.token);
            toast.success("Login Successful");
            navigate("/");
          } else {
            toast.error("Unrecognized account role returned by server");
          }
        } else {
          toast.error(data.message || "Invalid credentials");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, {
        email: resetEmail.trim(),
      });
      if (data.success) {
        toast.success(data.message || "Reset code sent to your email");
        setForgotStep(2);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset code");
    } finally {
      setResetLoading(false);
    }
  };

  // Forgot Password: Reset with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword: newPassword.trim(),
      });
      if (data.success) {
        toast.success(data.message || "Password reset successfully!");
        setShowForgotModal(false);
        setForgotStep(1);
        setResetEmail("");
        setResetOtp("");
        setNewPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#f4f7fc] dark:bg-gray-900 transition-colors duration-300">
      {/* Floating Dark Mode Toggle */}
      <button
        type="button"
        onClick={toggleDarkMode}
        aria-label="Toggle Dark Mode"
        className="absolute top-5 right-5 z-40 p-2.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-400 shadow-md border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Left Column: Brand Hero */}
      <div className="hidden lg:flex flex-col items-center justify-between bg-[#1155ff] dark:bg-blue-800 p-12 text-white relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900 dark:from-blue-800 dark:to-gray-950 opacity-90" />
        <div className="relative z-10 w-full" />
        
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="w-72 h-72 rounded-full bg-blue-700/40 dark:bg-blue-900/60 flex items-center justify-center relative mb-6 shadow-2xl backdrop-blur-sm border border-white/10">
            <img src={assets.doctor_icon} alt="Doctor Illustration" className="w-52 h-52 object-contain drop-shadow-xl" />
          </div>
        </div>

        <div className="relative z-10 text-center mt-auto">
          <h1 className="text-xl font-bold tracking-wide">Doctor Management App</h1>
          <p className="text-xs text-blue-200 dark:text-blue-300 mt-1 tracking-wider uppercase font-medium">
            Efficient, Organized, Reliable
          </p>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 bg-[#f4f7fc] dark:bg-gray-900 min-h-screen lg:min-h-0 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center p-3 shadow-sm border border-blue-100 dark:border-gray-600 mb-4 transition-colors duration-300">
              <img src={assets.doctor_icon} alt="Doctor Icon" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {state === "Sign Up" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-400 mt-1 font-medium tracking-wide">
              {state === "Sign Up"
                ? "Please sign up to book an appointment"
                : "Log in to manage appointments and records"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {state === "Sign Up" && (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm transition-all placeholder:text-gray-400"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Remember Me / Forgot Password (Login mode only) */}
            {state === "Login" && (
              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 dark:text-gray-300 font-medium">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700" />
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowForgotModal(true);
                    setForgotStep(1);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer border-none bg-transparent"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1155ff] hover:bg-blue-700 dark:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{state === "Sign Up" ? "Creating Account..." : "Logging in..."}</span>
                </>
              ) : (
                state === "Sign Up" ? "Create Account" : "Log In"
              )}
            </button>
          </form>

          {/* Toggle between Sign Up and Login */}
          <div className="mt-5 text-center text-xs text-gray-600 dark:text-gray-400">
            {state === "Sign Up" ? (
              <p>
                Already have an account?{" "}
                <span
                  onClick={() => setState("Login")}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Log in here
                </span>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <span
                  onClick={() => setState("Sign Up")}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Create account
                </span>
              </p>
            )}
          </div>

          {/* Homepage Link */}
          <div className="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Back to homepage:{" "}
              <span onClick={() => navigate("/")} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
                Click here
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {forgotStep === 1 ? "Reset Password" : "Enter Verification Code"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {forgotStep === 1
                ? "Enter your account email address and we'll send a 6-digit verification code."
                : `We sent a 6-digit code to ${resetEmail}. Enter it below along with your new password.`}
            </p>

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 bg-[#1155ff] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {resetLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Send Reset Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm tracking-widest text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="w-1/3 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-2/3 py-3 bg-[#1155ff] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {resetLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Set New Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;