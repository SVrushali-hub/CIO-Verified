import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP } from "../utils/mailer.js";

/* =========================
   REGISTER + SEND OTP
========================= */

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔥 REGISTER ROUTE HIT");
    console.log("BODY:", req.body);

    // 🔍 Check if user exists
    const [existing] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      // If user exists but not verified → resend OTP
      if (!existing[0].is_verified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        await db.query(
          "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?",
          [otp, expiry, email]
        );

        await sendOTP(email, otp);

        return res.status(200).json({
          message: "OTP resent to your email"
        });
      }

      return res.status(400).json({
        message: "User already exists"
      });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔢 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // 💾 Insert user
    const [result] = await db.query(
      `INSERT INTO users (email, password, otp, otp_expiry)
       VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, otp, expiry]
    );

    // 📩 Send OTP
    await sendOTP(email, otp);
    
    return res.status(201).json({
      message: "OTP sent successfully",
      userId: result.insertId
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Registration failed"
    });
  }
};

/* =========================
   LOGIN (ONLY VERIFIED)
========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    // 🚫 Block if not verified
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Please verify your email first"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token, user });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* =========================
   VERIFY OTP (NO LOGIN HERE)
========================= */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otp_expiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await db.query(
      "UPDATE users SET is_verified = TRUE, otp = NULL WHERE id = ?",
      [user.id]
    );

    return res.json({
      message: "Email verified successfully. Please login."
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};