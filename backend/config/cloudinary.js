import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = () => {
  if (
    !process.env.CLOUDINARY_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_SECRET_KEY
  ) {
    console.warn("⚠️ Warning: Cloudinary environment variables are missing!");
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });

  console.log("✅ Cloudinary configured and ready for uploads");
};

export default connectCloudinary;