import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import appointmentModel from '../models/appointmentModel.js'
import doctorModel from '../models/doctorModel.js'
import { razorpayInstance } from '../server.js'

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email: email.trim().toLowerCase(),
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET)
        res.json({ success: true, token, role: "user" })
    }
    catch (error) {
        console.log("Register Error:", error)
        res.json({ success: false, message: error.message })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const cleanEmail = email?.trim().toLowerCase();
        const cleanPassword = password?.trim();

        // -------------------------------------------------------------
        // 1. CHECK ADMIN CREDENTIALS (.env)
        // -------------------------------------------------------------
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();

        if (adminEmail && adminPassword && cleanEmail === adminEmail && cleanPassword === adminPassword) {
            console.log("✅ Admin Logged In Successfully");
            const token = jwt.sign(
                { email: cleanEmail, role: "admin" },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );
            return res.json({ success: true, token, role: "admin" });
        }

        // -------------------------------------------------------------
        // 2. CHECK PATIENTS TABLE (userModel)
        // -------------------------------------------------------------
        let account = await userModel.findOne({ email: cleanEmail });
        let role = "user";

        // -------------------------------------------------------------
        // 3. CHECK DOCTORS TABLE (doctorModel)
        // -------------------------------------------------------------
        if (!account) {
            account = await doctorModel.findOne({ email: cleanEmail });
            role = "doctor";
        }

        // If not found in Admin, User, or Doctor
        if (!account) {
            console.log(`❌ No account found for email: ${cleanEmail}`);
            return res.json({ success: false, message: "User does not exist" });
        }

        // -------------------------------------------------------------
        // 4. VERIFY PASSWORD
        // -------------------------------------------------------------
        let isMatch = await bcrypt.compare(cleanPassword, account.password);

        // Fallback if doctor password was saved as plain text
        if (!isMatch && account.password === cleanPassword) {
            isMatch = true;
        }

        if (!isMatch) {
            console.log(`❌ Invalid password for: ${cleanEmail}`);
            return res.json({ success: false, message: "Invalid credentials" });
        }

        console.log(`✅ ${role.toUpperCase()} Logged In Successfully`);

        // Generate JWT Token
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
                email: account.email,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.json({ success: false, message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const userData = await userModel.findById(userId).select('-password')
        if (!userData) {
            return res.json({ success: false, message: "User not found" })
        }
        res.json({ success:true, userData })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }
        res.json({ success: true, message: "Profile Updated" })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const bookAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const { docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not available' })
        }
        let slots_booked = docData.slots_booked

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot not available' })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const listAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId });

        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const cancelAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)
        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentId || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment Cancelled or not found" })
        }

        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        };

        const order = await razorpayInstance.orders.create(options);

        res.json({ success: true, order })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid' || orderInfo.status === 'captured') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            return res.json({ success: true, message: "Payment Successful" })
        }
        else {
            return res.json({ success: false, message: "Payment Failed!" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
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