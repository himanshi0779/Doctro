import express from 'express'
import { doctorList, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile, changeAvailability} from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'

const doctorRouter=express.Router()
doctorRouter.get('/list',doctorList)
doctorRouter.post('/change-availability',changeAvailability)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile)


export default doctorRouter