import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { v2 as cloudinary } from 'cloudinary'

import userModel from '../models/userModel.js'
import appointmentModel from '../models/appointmentModel.js'
import doctorModel from '../models/doctorModel.js'
import { razorpayInstance } from '../server.js'

// ==========================================
// 1. REGISTER USER
// ==========================================
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.status(400).json({ success: false, message: "Missing required details" })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Enter a valid email address" })
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" })
        }

        const normalizedEmail = email.trim().toLowerCase()
        const existingUser = await userModel.findOne({ email: normalizedEmail })
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Account already exists with this email" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        })
        const user = await newUser.save()

        const token = jwt.sign(
            { id: user._id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        return res.status(201).json({ success: true, token, role: "user" })
    } catch (error) {
        console.error("Register Error:", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

// ==========================================
// 2. UNIFIED LOGIN (Admin, User, Doctor)
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" })
        }

        const cleanEmail = email.trim().toLowerCase()
        const cleanPassword = password.trim()

        // 1. Admin Verification (.env)
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
        const adminPassword = process.env.ADMIN_PASSWORD?.trim()

        if (adminEmail && adminPassword && cleanEmail === adminEmail && cleanPassword === adminPassword) {
            const token = jwt.sign(
                { email: cleanEmail, role: "admin" },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            )
            return res.status(200).json({ success: true, token, role: "admin" })
        }

        // 2. User/Patient Verification
        let account = await userModel.findOne({ email: cleanEmail })
        let role = "user"

        // 3. Doctor Verification (Fallback)
        if (!account) {
            account = await doctorModel.findOne({ email: cleanEmail })
            role = "doctor"
        }

        if (!account) {
            return res.status(404).json({ success: false, message: "User does not exist" })
        }

        // 4. Password Verification
        let isMatch = await bcrypt.compare(cleanPassword, account.password)

        // Plaintext fallback for legacy/seed records
        if (!isMatch && account.password === cleanPassword) {
            isMatch = true
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign(
            { id: account._id, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        return res.status(200).json({
            success: true,
            token,
            role,
            user: {
                id: account._id,
                name: account.name,
                email: account.email
            }
        })
    } catch (error) {
        console.error("Login Error:", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

// ==========================================
// 3. GET PROFILE
// ==========================================
const getProfile = async (req, res) => {
    try {
        const userId = req.userId
        const userData = await userModel.findById(userId).select('-password')

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        return res.status(200).json({ success: true, userData })
    } catch (error) {
        console.error("Get Profile Error:", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

// ==========================================
// 4. UPDATE PROFILE (Serverless-Safe Upload)
// ==========================================
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.status(400).json({ success: false, message: "Required fields missing" })
        }

        let parsedAddress = address
        if (typeof address === 'string') {
            try {
                parsedAddress = JSON.parse(address)
            } catch {
                parsedAddress = { line1: address, line2: '' }
            }
        }

        const updatePayload = {
            name,
            phone,
            address: parsedAddress,
            dob,
            gender
        }

        // Memory buffer upload to Cloudinary (Serverless safe)
        if (imageFile) {
            const fileBase64 = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`
            const imageUpload = await cloudinary.uploader.upload(fileBase64, {
                resource_type: "image",
                folder: "prescripto_profiles"
            })
            updatePayload.image = imageUpload.secure_url
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updatePayload, { new: true }).select('-password')

        return res.status(200).json({ success: true, message: "Profile Updated", userData: updatedUser })
    } catch (error) {
        console.error("Update Profile Error:", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

// ==========================================
// 5. BOOK APPOINTMENT (Atomic Race-Condition Safe)
// ==========================================
const bookAppointment = async (req, res) => {
    try {
        const userId = req.userId
        const { docId, slotDate, slotTime } = req.body

        if (!docId || !slotDate || !slotTime) {
            return res.status(400).json({ success: false, message: "Missing appointment parameters" })
        }

        // Single atomic query: Checks slot availability and appends timestamp in one locked step
        const updatedDoctor = await doctorModel.findOneAndUpdate(
            {
                _id: docId,
                available: true,
                [`slots_booked.${slotDate}`]: { $ne: slotTime }
            },
            {
                $push: { [`slots_booked.${slotDate}`]: slotTime }
            },
            { new: true }
        )

        if (!updatedDoctor) {
            return res.status(409).json({
                success: false,
                message: "Selected slot is already booked or Doctor is currently unavailable"
            })
        }

        const userData = await userModel.findById(userId).select('-password').lean()
        if (!userData) {
            // Roll back booked slot if patient record is invalid
            await doctorModel.findByIdAndUpdate(docId, {
                $pull: { [`slots_booked.${slotDate}`]: slotTime }
            })
            return res.status(404).json({ success: false, message: "User account not found" })
        }

        const docSnapshot = updatedDoctor.toObject()
        delete docSnapshot.slots_booked
        delete docSnapshot.password

        const appointmentData = {
            userId,
            docId,
            userData,
            docData: docSnapshot,
            amount: docSnapshot.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        return res.status(200).json({ success: true, message: "Appointment Booked Successfully" })
    } catch (error) {
        console.error("Book Appointment Error:", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

// ==========================================
// 6. LIST USER APPOINTMENTS
// ==========================================
const listAppointment = async (req, res) => {
    try {
        const userId = req.userId
        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 })

        return res.status(200).json({ success: true, appointments })
    } catch (error) {
        console.error("List Appointment Error:", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

// ==========================================
// 7. CANCEL APPOINTMENT (Atomic Slot Release)
// ==========================================
const cancelAppointment = async (req, res) => {
    try {
        const userId = req.userId
        const { appointmentId } = req.body

        if (!appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (!appointmentData) {
            return res.status(404).json({ success: false, message: "Appointment not found" })
        }

        if (appointmentData.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized action" })
        }

        if (appointmentData.cancelled) {
            return res.status(400).json({ success: false, message: "Appointment is already cancelled" })
        }

        // Mark appointment cancelled
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // Atomically remove slot from doctor's array using $pull
        const { docId, slotDate, slotTime } = appointmentData
        await doctorModel.findByIdAndUpdate(docId, {
            $pull: { [`slots_booked.${slotDate}`]: slotTime }
        })

        return res.status(200).json({ success: true, message: "Appointment Cancelled Successfully" })
    } catch (error) {
        console.error("Cancel Appointment Error:", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

// ==========================================
// 8. INITIALIZE RAZORPAY ORDER
// ==========================================
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.status(400).json({ success: false, message: "Appointment is cancelled or does not exist" })
        }

        if (appointmentData.payment) {
            return res.status(400).json({ success: false, message: "Appointment is already paid" })
        }

        const options = {
            amount: appointmentData.amount * 100, // Sub-units (paise)
            currency: process.env.CURRENCY || "INR",
            receipt: appointmentId
        }

        const order = await razorpayInstance.orders.create(options)
        return res.status(200).json({ success: true, order })
    } catch (error) {
        console.error("Razorpay Order Error:", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

// ==========================================
// 9. VERIFY RAZORPAY PAYMENT (Cryptographic HMAC)
// ==========================================
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Incomplete payment verification payload" })
        }

        // HMAC-SHA256 Signature verification
        const signString = `${razorpay_order_id}|${razorpay_payment_id}`
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(signString.toString())
            .digest("hex")

        if (expectedSign === razorpay_signature) {
            const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })

            return res.status(200).json({ success: true, message: "Payment Verified Successfully" })
        } else {
            return res.status(400).json({ success: false, message: "Payment signature verification failed" })
        }
    } catch (error) {
        console.error("Payment Verification Error:", error)
        return res.status(500).json({ success: false, message: error.message || "Internal server error" })
    }
}

export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay
}