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

  // 1. Clear fields every time the page loads or state changes
  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
  }, [state]); // Also clears when switching between "Login" and "Sign Up"

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
    <form
      onSubmit={onSubmitHandler}
      autoComplete="off" /* Prevents browser auto-filling form */
      className="min-h-[80vh] flex items-center"
    >
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign Up" ? "Create Account" : "Account Login"}
        </p>

        <p>Please {state === "Sign Up" ? "sign up" : "log in"} to continue</p>

        {state === "Sign Up" && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              autoComplete="off"
              required
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            autoComplete="off"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            autoComplete="new-password" /* Prevents saved password auto-fill */
            required
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base mt-2 hover:bg-primary/90 transition"
        >
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>

        {state === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-primary underline cursor-pointer"
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Want to create a new account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;