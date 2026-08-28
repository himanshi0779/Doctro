import mongoose from "mongoose";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import connectDB from "../config/mongodb.js";

const changeAvailability = async (req, res) => {
  try {
    await connectDB();
    const docId = req.admin ? req.body.docId : req.doctorId;

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
      message: "Availability status updated",
      available: updatedDoc.available,
    });
  } catch (error) {
    console.error("Change Availability Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const doctorList = async (req, res) => {
  try {
    await connectDB();
    const doctors = await doctorModel
      .find({ available: true })
      .select(["-password", "-email"])
      .lean();

    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error("Doctor List Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const appointmentsDoctor = async (req, res) => {
  try {
    await connectDB();
    const docId = req.doctorId;
    const appointments = await appointmentModel
      .find({ docId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Doctor Appointments Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const appointmentComplete = async (req, res) => {
  try {
    await connectDB();
    const docId = req.doctorId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData.docId.toString() !== docId.toString()) {
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
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const appointmentCancel = async (req, res) => {
  try {
    await connectDB();
    const docId = req.doctorId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    if (appointmentData.docId.toString() !== docId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    if (appointmentData.cancelled) {
      return res.status(400).json({ success: false, message: "Appointment is already cancelled" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { slotDate, slotTime } = appointmentData;
    if (slotDate && slotTime) {
      await doctorModel.findByIdAndUpdate(docId, {
        $pull: { [`slots_booked.${slotDate}`]: slotTime },
      });
    }

    return res.status(200).json({ success: true, message: "Appointment Cancelled and Slot Released" });
  } catch (error) {
    console.error("Doctor Cancel Appointment Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const doctorDashboard = async (req, res) => {
  try {
    await connectDB();
    const docId = new mongoose.Types.ObjectId(req.doctorId);

    const [statsResult, latestAppointments] = await Promise.all([
      appointmentModel.aggregate([
        { $match: { docId } },
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            earnings: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$cancelled", false] }, { $or: ["$isCompleted", "$payment"] }] },
                  "$amount",
                  0,
                ],
              },
            },
            uniquePatients: { $addToSet: "$userId" },
          },
        },
      ]),
      appointmentModel.find({ docId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const stats = statsResult[0] || { totalAppointments: 0, earnings: 0, uniquePatients: [] };

    const dashData = {
      earnings: stats.earnings,
      appointments: stats.totalAppointments,
      patients: stats.uniquePatients.length,
      latestAppointments,
    };

    return res.status(200).json({ success: true, dashData });
  } catch (error) {
    console.error("Doctor Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const doctorProfile = async (req, res) => {
  try {
    await connectDB();
    const docId = req.doctorId;
    const profileData = await doctorModel.findById(docId).select("-password").lean();

    if (!profileData) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    return res.status(200).json({ success: true, profileData });
  } catch (error) {
    console.error("Doctor Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    await connectDB();
    const docId = req.doctorId;
    const { fees, address, available, about } = req.body;

    let parsedAddress = address;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch {
        parsedAddress = { line1: address, line2: "" };
      }
    }

    const updatedDoc = await doctorModel
      .findByIdAndUpdate(
        docId,
        { fees, address: parsedAddress, available, about },
        { new: true }
      )
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      profileData: updatedDoc,
    });
  } catch (error) {
    console.error("Update Doctor Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
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
  changeAvailability,
};