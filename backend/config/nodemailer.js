import "dotenv/config";
import nodemailer from "nodemailer";

const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");

if (!user || !pass) {
  console.error("⚠️ Nodemailer Warning: SMTP_USER or SMTP_PASS is missing in .env!");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: user,
    pass: pass,
  },
});

export default transporter;