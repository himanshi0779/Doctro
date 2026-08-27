import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      dbName: "doctro",
      bufferCommands: false,
      maxPoolSize: 10,       
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URL, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; 
    console.error("MongoDB connection error:", error.message);
    throw error;
  }

  global.mongoose = cached;
  return cached.conn;
};
export default connectDB;