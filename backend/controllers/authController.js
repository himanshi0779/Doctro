import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if login matches ADMIN from .env
    if (
      email === process.env.ADMIN_EMAIL && 
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ success: true, token, role: "admin" });
    }

    // 2. Check PATIENTS table
    let account = await userModel.findOne({ email });
    let role = "user";

    // 3. Check DOCTORS table (if not a patient)
    if (!account) {
      account = await doctorModel.findOne({ email });
      role = "doctor";
    }

    // If account doesn't exist in either
    if (!account) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // Verify password for Patient or Doctor
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: account._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      role,
      user: {
        id: account._id,
        name: account.name,
        email: account.email
      }
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};