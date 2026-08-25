import express from 'express';
import {
    doctorList,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancel,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    changeAvailability
} from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';

const doctorRouter = express.Router();

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================
// Public catalog for patients to browse doctors
doctorRouter.get('/list', doctorList);

// ==========================================
// 2. PROTECTED DOCTOR ROUTES (authDoctor)
// ==========================================
// Toggle doctor's availability status (Protected)
doctorRouter.post('/change-availability', authDoctor, changeAvailability);

// Appointment Management
doctorRouter.get('/appointments', authDoctor, appointmentsDoctor);
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete);
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel);

// Analytics & Profile
doctorRouter.get('/dashboard', authDoctor, doctorDashboard);
doctorRouter.get('/profile', authDoctor, doctorProfile);
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile);

export default doctorRouter;