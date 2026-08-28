import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    image: { 
      type: String, 
      required: true 
    },
    speciality: { 
      type: String, 
      required: true, 
      trim: true 
    },
    degree: { 
      type: String, 
      required: true, 
      trim: true 
    },
    experience: { 
      type: String, 
      required: true 
    },
    about: { 
      type: String, 
      default: "" 
    },
    available: { 
      type: Boolean, 
      default: true 
    },
    fees: { 
      type: Number, 
      required: true,
      min: 0 
    },
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" }
    },
    slots_booked: { 
      type: Object, 
      default: {} 
    },
    resetOtp: { type: String, default: "" },
resetOtpExpireAt: { type: Number, default: 0 },
  },
  { 
    minimize: false,
    timestamps: true
  }
);
const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;