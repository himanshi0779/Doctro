import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import transporter from "../config/nodemailer.js";

export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check Admin (Admin credentials managed in .env)
    if (cleanEmail === process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Admin password cannot be reset via email. Please update your environment variables.",
      });
    }

    // Locate Patient or Doctor
    let account = await userModel.findOne({ email: cleanEmail });
    let ModelType = userModel;

    if (!account) {
      account = await doctorModel.findOne({ email: cleanEmail });
      ModelType = doctorModel;
    }

    if (!account) {
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    // Generate 6-digit numeric OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    
    // Save OTP to DB (valid for 15 minutes)
    account.resetOtp = otp;
    account.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await account.save();

    // Send Email
    const mailOptions = {
      from: `"Prescripto Support" <${process.env.SMTP_USER}>`,
      to: cleanEmail,
      subject: "Password Reset OTP - Prescripto",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1155ff;">Password Reset Request</h2>
          <p>Hello ${account.name || "User"},</p>
          <p>You requested to reset your password. Use the verification code below to complete the reset:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1155ff; margin: 20px 0; padding: 10px; background: #f4f7fc; display: inline-block; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 13px;">This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Reset code sent to your email" });
  } catch (error) {
    console.error("Send Reset OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

// 2. Verify OTP & Set New Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check Patient then Doctor
    let account = await userModel.findOne({ email: cleanEmail });
    if (!account) {
      account = await doctorModel.findOne({ email: cleanEmail });
    }

    if (!account) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    // Validate OTP and expiration
    if (!account.resetOtp || account.resetOtp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    if (account.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Verification code has expired" });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(newPassword, salt);
    account.resetOtp = "";
    account.resetOtpExpireAt = 0;
    await account.save();

    return res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};
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

    // 1. ADMIN AUTHENTICATION
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();

    // If the input email matches the admin email, handle admin auth exclusively
    if (adminEmail && cleanEmail === adminEmail) {
      if (!adminPassword) {
        console.error("CRITICAL: ADMIN_PASSWORD is missing from .env");
        return res.status(500).json({
          success: false,
          message: "Server configuration error: Admin credentials not configured.",
        });
      }

      const isPlainMatch = cleanPassword === adminPassword;
      const isHashMatch = adminPassword.startsWith("$2")
        ? await bcrypt.compare(cleanPassword, adminPassword)
        : false;

      if (!isPlainMatch && !isHashMatch) {
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

    // 2. PATIENT / USER LOOKUP
    let account = await userModel.findOne({ email: cleanEmail });
    let role = "user";

    // 3. DOCTOR LOOKUP (if not a patient)
    if (!account) {
      account = await doctorModel.findOne({ email: cleanEmail });
      role = "doctor";
    }

    // 4. ACCOUNT NOT FOUND
    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. COMPARE BCRYPT HASH FOR PATIENTS & DOCTORS
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