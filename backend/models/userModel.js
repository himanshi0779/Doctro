import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
      default: "" 
    },
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
    },
    gender: { 
      type: String, 
      enum: ["Male", "Female", "Other", "Not Selected"], 
      default: "Not Selected" 
    },
    dob: { 
      type: String, 
      default: "Not Selected" 
    },
    phone: { 
      type: String, 
      default: "0000000000" 
    },
  },
  { 
    timestamps: true
  }
);
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;