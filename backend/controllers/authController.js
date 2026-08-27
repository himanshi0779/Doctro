import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";

const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment variables.");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPasswordHash = process.env.ADMIN_PASSWORD?.trim();

    if (adminEmail && adminPasswordHash && cleanEmail === adminEmail) {
      const isAdminMatch = await bcrypt.compare(cleanPassword, adminPasswordHash);

      if (!isAdminMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const token = generateToken({ email: cleanEmail, role: "admin" });
      return res.status(200).json({
        success: true,
        token,
        role: "admin",
        user: { name: "Admin", email: cleanEmail },
      });
    }

    let account = await userModel.findOne({ email: cleanEmail });
    let role = "user";
    if (!account) {
      account = await doctorModel.findOne({ email: cleanEmail });
      role = "doctor";
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isMatch = await bcrypt.compare(cleanPassword, account.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const token = generateToken({ id: account._id, role });

    return res.status(200).json({
      success: true,
      token,
      role,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};