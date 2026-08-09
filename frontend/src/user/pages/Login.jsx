import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { AdminContext } from "../../admin/context/AdminContext";
import { DoctorContext } from "../../doctor/context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const { backendUrl, setToken } = useContext(UserContext);
  const { setAToken } = useContext(AdminContext) || {};
  const { setDToken } = useContext(DoctorContext) || {};

  const [state, setState] = useState("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Sync dark class on document root (<html>)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Clear fields every time the state changes
  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
  }, [state]);

  const redirectByRole = (role) => {
    if (role === "admin") {
      window.location.href = "/admin";
    } else if (role === "doctor") {
      window.location.href = "/doctor";
    } else {
      window.location.href = "/";
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          password,
          email,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", "user");
          if (setToken) setToken(data.token);
          toast.success("Account created successfully!");
          window.location.href = "/";
        } else {
          toast.error(data.message || "Signup failed");
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (data.success) {
          const userRole = data.role || "user";

          localStorage.setItem("token", data.token);
          localStorage.setItem("role", userRole);

          if (userRole === "admin") {
            localStorage.setItem("aToken", data.token);
            if (setAToken) setAToken(data.token);
          } else if (userRole === "doctor") {
            localStorage.setItem("dToken", data.token);
            if (setDToken) setDToken(data.token);
          }

          if (setToken) setToken(data.token);
          toast.success("Login successful!");

          redirectByRole(userRole);
        } else {
          toast.error(data.message || "Invalid credentials");
        }
      }
    } catch (error) {
      console.error("Login Handler Error:", error);
      const errMsg =
        error.response?.data?.message || error.message || "Something went wrong";
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <form
        onSubmit={onSubmitHandler}
        autoComplete="off"
        className="w-full max-w-md"
      >
        <div className="relative flex flex-col gap-4 m-auto p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-zinc-600 dark:text-gray-300 text-sm shadow-xl transition-all duration-200">
          
          {/* Top Header Row with Theme Toggle */}
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {state === "Sign Up" ? "Create Account" : "Account Login"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Please {state === "Sign Up" ? "sign up" : "log in"} to continue
              </p>
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
            >
              {darkMode ? (
                /* Sun Icon */
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                /* Moon Icon */
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>

          {/* Form Fields */}
          {state === "Sign Up" && (
            <div className="w-full">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                Full Name
              </label>
              <input
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary transition"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                autoComplete="off"
                required
              />
            </div>
          )}

          <div className="w-full">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Email
            </label>
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary transition"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              autoComplete="off"
              required
            />
          </div>

          <div className="w-full">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Password
            </label>
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary transition"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-primary text-white w-full py-2.5 rounded-lg text-base font-medium mt-2 hover:bg-primary/90 transition shadow-md cursor-pointer"
          >
            {state === "Sign Up" ? "Create Account" : "Login"}
          </button>

          {/* Footer State Switcher */}
          <div className="text-center mt-2 text-gray-600 dark:text-gray-400">
            {state === "Sign Up" ? (
              <p>
                Already have an account?{" "}
                <span
                  onClick={() => setState("Login")}
                  className="text-primary dark:text-indigo-400 underline font-semibold cursor-pointer"
                >
                  Login here
                </span>
              </p>
            ) : (
              <p>
                Want to create a new account?{" "}
                <span
                  onClick={() => setState("Sign Up")}
                  className="text-primary dark:text-indigo-400 underline font-semibold cursor-pointer"
                >
                  Click here
                </span>
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;