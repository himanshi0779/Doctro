import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !address || !fees) {
      return res.status(400).json({ success: false, message: "Missing required doctor details" });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Doctor profile image is required" });
    }

    const existingDoctor = await doctorModel.findOne({ email: cleanEmail });
    if (existingDoctor) {
      return res.status(409).json({ success: false, message: "A doctor with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const fileBase64 = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
    const imageUpload = await cloudinary.uploader.upload(fileBase64, {
      folder: "doctro/doctors",
      resource_type: "image",
    });

    // 5. Safe address parser
    let parsedAddress = address;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch {
        parsedAddress = { line1: address, line2: "" };
      }
    }

    const doctorData = {
      name: name.trim(),
      email: cleanEmail,
      image: imageUpload.secure_url,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees: Number(fees),
      address: parsedAddress,
      slots_booked: {},
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    return res.status(201).json({ success: true, message: "Doctor Added Successfully" });
  } catch (error) {
    console.error("Add Doctor Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password").lean();
    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error("All Doctors Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Admin Appointments Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData.cancelled) {
      return res.status(400).json({ success: false, message: "Appointment is already cancelled" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
    const { docId, slotDate, slotTime } = appointmentData;
    if (slotDate && slotTime) {
      await doctorModel.findByIdAndUpdate(docId, {
        $pull: { [`slots_booked.${slotDate}`]: slotTime },
      });
    }

    return res.status(200).json({ success: true, message: "Appointment Cancelled and Slot Released" });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const [doctorCount, patientCount, appointmentCount, latestAppointments] = await Promise.all([
      doctorModel.countDocuments({}),
      userModel.countDocuments({}),
      appointmentModel.countDocuments({}),
      appointmentModel.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const dashData = {
      doctors: doctorCount,
      patients: patientCount,
      appointments: appointmentCount,
      latestAppointments,
    };

    return res.status(200).json({ success: true, dashData });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export {
  addDoctor,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};