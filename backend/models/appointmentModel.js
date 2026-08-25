import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    docId: { type: String, required: true, index: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true, default: Date.now },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

// Compound indexes for high-speed dashboard & history queries
appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ docId: 1, date: -1 });

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);
export default appointmentModel;