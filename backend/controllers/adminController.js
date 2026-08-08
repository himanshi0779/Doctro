import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from "jsonwebtoken"
import fs from 'fs'
import userModel from '../models/userModel.js'
import appointmentModel from '../models/appointmentModel.js'

// API to add a new doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // 1. Validation checks
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        const cleanEmail = email.trim().toLowerCase();

        if (!validator.isEmail(cleanEmail)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (minimum 8 characters)" });
        }

        if (!imageFile) {
            return res.json({ success: false, message: "Doctor image is required" });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Upload image to Cloudinary & cleanup temp local file
        let imageUpload;
        try {
            imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                folder: "prescripto/doctors",
                resource_type: "image"
            });
        } finally {
            if (fs.existsSync(imageFile.path)) {
                fs.unlinkSync(imageFile.path);
            }
        }

        // 4. Parse address structure
        let parsedAddress;
        try {
            parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
        } catch (e) {
            parsedAddress = { line1: address, line2: '' };
        }

        // 5. Construct Doctor Object
        const doctorData = {
            name,
            email: cleanEmail,
            image: imageUpload.secure_url,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            address: parsedAddress,
            date: Date.now()
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Doctor Added Successfully" });
    }
    catch (error) {
        console.error("Add Doctor Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password');
        res.json({ success: true, doctors });
    }
    catch (error) {
        console.error("All Doctors Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all appointments list for admin panel
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({});
        res.json({ success: true, appointments });
    } catch (error) {
        console.error("Admin Appointments Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// API to cancel an appointment from admin panel
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        if (doctorData && doctorData.slots_booked) {
            let slots_booked = doctorData.slots_booked;
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
                await doctorModel.findByIdAndUpdate(docId, { slots_booked });
            }
        }

        res.json({ success: true, message: 'Appointment Cancelled' });

    } catch (error) {
        console.error("Cancel Appointment Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.slice().reverse().slice(0, 5)
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.json({ success: false, message: error.message });
    }
};

export {
    addDoctor,
    allDoctors,
    appointmentsAdmin,
    appointmentCancel,
    adminDashboard
};