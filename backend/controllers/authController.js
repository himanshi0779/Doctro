import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";

const generateToken = (payload) => 
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Admin login
    if (email === process.env.ADMIN_EMAIL) {
      const isAdminMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
      if (!isAdminMatch) return res.status(401).json({ success: false, message: "Invalid admin credentials" });

      const token = generateToken({ email, role: "admin" });
      return res.json({ success: true, token, role: "admin" });
    }

    // Patient or Doctor
    let account = await userModel.findOne({ email });
    let role = "user";

    if (!account) {
      account = await doctorModel.findOne({ email });
      role = "doctor";
    }

    if (!account) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken({ id: account._id, role });

    return res.json({
      success: true,
      token,
      role,
      user: { id: account._id, name: account.name, email: account.email }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
