import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import { razorpayInstance } from "../server.js";


export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.status(400).json({ success: false, message: "Missing required details." });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const existingUser = await userModel.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });
    const user = await newUser.save();

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ success: true, token, role: "user" });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password").lean();

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, userData });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    let parsedAddress = address;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch {
        parsedAddress = { line1: address, line2: "" };
      }
    }

    const updatePayload = {
      name: name.trim(),
      phone,
      address: parsedAddress,
      dob,
      gender,
    };

    if (imageFile) {
      const fileBase64 = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
      const imageUpload = await cloudinary.uploader.upload(fileBase64, {
        resource_type: "image",
        folder: "prescripto/profiles",
      });
      updatePayload.image = imageUpload.secure_url;
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updatePayload, { new: true })
      .select("-password");

    return res.status(200).json({ success: true, message: "Profile Updated", userData: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId, slotDate, slotTime } = req.body;

    if (!docId || !slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: "Missing appointment details." });
    }

    const updatedDoctor = await doctorModel.findOneAndUpdate(
      {
        _id: docId,
        available: true,
        [`slots_booked.${slotDate}`]: { $ne: slotTime },
      },
      {
        $push: { [`slots_booked.${slotDate}`]: slotTime },
      },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(409).json({
        success: false,
        message: "Selected slot is already booked or Doctor is unavailable.",
      });
    }

    const userData = await userModel.findById(userId).select("-password").lean();
    if (!userData) {
      // Rollback slot if user account does not exist
      await doctorModel.findByIdAndUpdate(docId, {
        $pull: { [`slots_booked.${slotDate}`]: slotTime },
      });
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const docSnapshot = updatedDoctor.toObject();
    delete docSnapshot.slots_booked;
    delete docSnapshot.password;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: docSnapshot,
      amount: docSnapshot.fees,
      slotTime,
      slotDate,
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    return res.status(201).json({ success: true, message: "Appointment Booked Successfully" });
  } catch (error) {
    console.error("Book Appointment Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("List Appointment Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required." });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    // Compare as strings to prevent ObjectId reference comparison bug
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized action." });
    }

    if (appointmentData.cancelled) {
      return res.status(400).json({ success: false, message: "Appointment is already cancelled." });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // Release slot back to doctor
    const { docId, slotDate, slotTime } = appointmentData;
    if (slotDate && slotTime) {
      await doctorModel.findByIdAndUpdate(docId, {
        $pull: { [`slots_booked.${slotDate}`]: slotTime },
      });
    }

    return res.status(200).json({ success: true, message: "Appointment Cancelled Successfully" });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.status(400).json({ success: false, message: "Appointment is cancelled or does not exist." });
    }

    if (appointmentData.payment) {
      return res.status(400).json({ success: false, message: "Appointment is already paid." });
    }

    const options = {
      amount: appointmentData.amount * 100, // Amount in lowest currency unit (paise)
      currency: process.env.CURRENCY || "INR",
      receipt: appointmentId.toString(),
    };

    const order = await razorpayInstance.orders.create(options);
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Incomplete payment verification details." });
    }

    const signString = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signString)
      .digest("hex");
    const isMatch =
      expectedSign.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSign, "utf-8"),
        Buffer.from(razorpay_signature, "utf-8")
      );

    if (isMatch) {
      const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });

      return res.status(200).json({ success: true, message: "Payment Verified Successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};