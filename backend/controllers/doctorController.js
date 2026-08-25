import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// ==========================================
// 1. CHANGE AVAILABILITY (Toggle Online/Offline)
// ==========================================
const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;

        if (!docId) {
            return res.status(400).json({ success: false, message: "Doctor ID is required" });
        }

        const docData = await doctorModel.findById(docId);
        if (!docData) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        const updatedDoc = await doctorModel.findByIdAndUpdate(
            docId,
            { available: !docData.available },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Availability Changed",
            available: updatedDoc.available
        });
    } catch (error) {
        console.error("Change Availability Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// ==========================================
// 2. DOCTOR LIST (Public Catalog)
// ==========================================
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel
            .find({ available: true })
            .select(['-password', '-email'])
            .lean();

        return res.status(200).json({ success: true, doctors });
    } catch (error) {
        console.error("Doctor List Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// ==========================================
// 3. APPOINTMENTS LIST (Doctor Portal)
// ==========================================
const appointmentsDoctor = async (req, res) => {
    try {
        const docId = req.doctorId;
        const appointments = await appointmentModel
            .find({ docId })
            .sort({ date: -1 })
            .lean();

        return res.status(200).json({ success: true, appointments });
    } catch (error) {
        console.error("Doctor Appointments Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// ==========================================
// 4. COMPLETE APPOINTMENT
// ==========================================
const appointmentComplete = async (req, res) => {
    try {
        const docId = req.doctorId;
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required" });
        }

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointmentData.docId.toString() !== docId) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        if (appointmentData.cancelled) {
            return res.status(400).json({ success: false, message: "Cannot complete a cancelled appointment" });
        }

        if (appointmentData.isCompleted) {
            return res.status(400).json({ success: false, message: "Appointment is already completed" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });

        return res.status(200).json({ success: true, message: "Appointment Completed" });
    } catch (error) {
        console.error("Complete Appointment Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// ==========================================
// 5. CANCEL APPOINTMENT (With Atomic Slot Release)
// ==========================================
const appointmentCancel = async (req, res) => {
    try {
        const docId = req.doctorId;
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required" });
        }

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointmentData.docId.toString() !== docId) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        if (appointmentData.cancelled) {
            return res.status(400).json({ success: false, message: "Appointment is already cancelled" });
        }

        // 1. Mark cancelled in appointments table
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // 2. ATOMIC RELEASE: Remove slot from doctor's booked schedule
        const { slotDate, slotTime } = appointmentData;
        if (slotDate && slotTime) {
            await doctorModel.findByIdAndUpdate(docId, {
                $pull: { [`slots_booked.${slotDate}`]: slotTime }
            });
        }

        return res.status(200).json({ success: true, message: "Appointment Cancelled and Slot Released" });
    } catch (error) {
        console.error("Cancel Appointment Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// ==========================================
// 6. DOCTOR DASHBOARD STATS
// ==========================================
const doctorDashboard = async (req, res) => {
    try {
        const docId = req.doctorId;
        const appointments = await appointmentModel
            .find({ docId })
            .sort({ date: -1 })
            .lean();

        let earnings = 0;
        const patientSet = new Set();

        for (const item of appointments) {
            if (!item.cancelled && (item.isCompleted || item.payment)) {
                earnings += item.amount || 0;
            }
            if (item.userId) {
                patientSet.add(item.userId.toString());
            }
        }

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patientSet.size,
            latestAppointments: appointments.slice(0, 5)
        };

        return res.status(200).json({ success: true, dashData });
    } catch (error) {
        console.error("Doctor Dashboard Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// ==========================================
// 7. GET DOCTOR PROFILE
// ==========================================
const doctorProfile = async (req, res) => {
    try {
        const docId = req.doctorId;
        const profileData = await doctorModel.findById(docId).select('-password').lean();

        if (!profileData) {
            return res.status(404).json({ success: false, message: "Doctor profile not found" });
        }

        return res.status(200).json({ success: true, profileData });
    } catch (error) {
        console.error("Doctor Profile Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// ==========================================
// 8. UPDATE DOCTOR PROFILE
// ==========================================
const updateDoctorProfile = async (req, res) => {
    try {
        const docId = req.doctorId;
        const { fees, address, available, about } = req.body;

        let parsedAddress = address;
        if (typeof address === 'string') {
            try {
                parsedAddress = JSON.parse(address);
            } catch {
                parsedAddress = { line1: address, line2: '' };
            }
        }

        const updatedDoc = await doctorModel
            .findByIdAndUpdate(
                docId,
                { fees, address: parsedAddress, available, about },
                { new: true }
            )
            .select('-password');

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            profileData: updatedDoc
        });
    } catch (error) {
        console.error("Update Doctor Profile Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

export {
    doctorList,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancel,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    changeAvailability
};