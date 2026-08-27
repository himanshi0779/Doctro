import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "user", 
      required: true 
    },
    docId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "doctor", 
      required: true 
    },
    slotDate: { 
      type: String, 
      required: true 
    },
    slotTime: { 
      type: String, 
      required: true 
    },
    userData: { 
      type: Object, 
      required: true 
    },
    docData: { 
      type: Object, 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0 
    },
    cancelled: { 
      type: Boolean, 
      default: false 
    },
    payment: { 
      type: Boolean, 
      default: false 
    },
    isCompleted: { 
      type: Boolean, 
      default: false 
    }
  },
  { 
    timestamps: true 
  }
);

appointmentSchema.index({ userId: 1, createdAt: -1 });
appointmentSchema.index({ docId: 1, createdAt: -1 });

appointmentSchema.index(
  { docId: 1, slotDate: 1, slotTime: 1 },
  { unique: true, partialFilterExpression: { cancelled: false } }
);

const appointmentModel =
  mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);

export default appointmentModel;