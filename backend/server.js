import dotenv from "dotenv"
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import fs from "fs";
import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import authRouter from "./routes/authRoute.js";
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import Razorpay from 'razorpay'

const app = express()
const port = process.env.PORT || 4000

// Initialize external services
connectDB()
connectCloudinary()

// Middleware
app.use(express.json())
app.use(cors({
  origin: ['https://prescrepto.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "atoken", "token", "dtoken"],
}));

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Routes
app.use("/api/auth", authRouter);
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
  res.send('API working')
})

// Keep listen for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log("Server Started at", port))
}

// Required by Vercel Serverless
export default app;