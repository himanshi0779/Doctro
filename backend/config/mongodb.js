import mongoose from "mongoose";

// 1. Global buffering enabled for serverless execution
mongoose.set("bufferCommands", true);

// 2. Persist cached connection across serverless invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: "doctro",
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    };

    const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URL / MONGODB_URI is missing from environment variables.");
    }

    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
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