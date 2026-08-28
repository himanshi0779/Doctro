import mongoose from "mongoose";

// 1. Enable buffering globally so Mongoose safely queues queries until connection is open
mongoose.set("bufferCommands", true);

// 2. Persist cached reference in the global object immediately
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Check if connection is active and ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: "doctro",
      bufferCommands: true, // ✅ MUST BE TRUE FOR SERVERLESS
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    };

    const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URL / MONGODB_URI is missing from environment variables.");
    }

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error("MongoDB connection error:", error.message);
    throw error;
  }

  return cached.conn;
};

export default connectDB;