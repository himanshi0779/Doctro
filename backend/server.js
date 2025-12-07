import dotenv from "dotenv"
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import fs from "fs";
import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import Razorpay from 'razorpay'


const app= express()
const port= process.env.PORT || 4000
connectDB()
connectCloudinary()

app.use(express.json())
app.use(cors({
  origin: ['https://prescrepto.vercel.app','http://localhost:3000'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

export const razorpayInstance=new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})
console.log("RAZORPAY TEST:",process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);


app.use('/api/admin', adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

app.get('/',(req,res)=>{
    res.send('API working')
})

app.listen(port,()=>console.log("Server Started at",port))
