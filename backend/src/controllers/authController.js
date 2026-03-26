import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP } from "../utils/mailer.js";

/* =========================
   REGISTER + SEND OTP
========================= */
export const register = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const {
      email,
      password,
      companyName,
      registrationNumber,
      industry,
      contactPerson,
      designation,
      phone
    } = req.body;

    // ✅ CHECK EXISTING USER
   // ✅ CHECK EXISTING USER 
const [existing] = await conn.query(
  "SELECT * FROM users WHERE email = ?",
  [email]
);

if (existing.length > 0) {
  if (!existing[0].is_verified) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await conn.query(
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

// ✅ NOW CHECK REGISTRATION NUMBER
const [existingReg] = await conn.query(
  "SELECT id FROM companies WHERE registration_number = ?",
  [registrationNumber]
);

if (existingReg.length > 0) {
  return res.status(400).json({
    message: "Company registration number already exists"
  });
}
    // ✅ PASSWORD HASH
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await conn.beginTransaction();

    // ✅ INSERT USER
    const [result] = await conn.query(
      `INSERT INTO users (email, password, otp, otp_expiry)
       VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, otp, expiry]
    );

    const userId = result.insertId;

    // ✅ INSERT COMPANY
    await conn.query(
      `INSERT INTO companies (
        user_id,
        company_name,
        registration_number,
        industry,
        contact_person,
        designation,
        email,
        phone,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        userId,
        companyName?.trim(),
        registrationNumber,
        industry || "",
        contactPerson || "",
        designation || "",
        email,
        phone || ""
      ]
    );

    // ✅ COMMIT
    await conn.commit();

    // ✅ SEND OTP AFTER SUCCESS
    await sendOTP(email, otp);

    return res.status(201).json({
      message: "OTP sent successfully",
      userId
    });

  } catch (err) {
    await conn.rollback(); // ✅ always rollback
    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      message: "Registration failed"
    });

  } finally {
    conn.release(); // ✅ always release
  }
};
/* =========================
   LOGIN (FIXED VERSION)
========================= */
export const login = async (req, res) => {
  try {
    let { identifier, email, password, isInternal, isAssessor } = req.body;

    const cleanIdentifier = (identifier || email || "").trim().toLowerCase();

    if (!cleanIdentifier) {
      return res.status(400).json({ message: "Email or username is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // 🔍 Find user
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [cleanIdentifier, cleanIdentifier]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    const internalRoles = ["SUPERADMIN", "ADMIN"];
    const assessorRoles = ["AUDITOR", "REVIEWER"];

    /* =========================
       ACCESS CONTROL
    ========================= */

    // 🔥 INTERNAL LOGIN
    if (isInternal) {
      if (!internalRoles.includes(user.role)) {
        return res.status(403).json({
          message: "Access denied: Not an internal team member",
        });
      }
    }

    // 🔥 ASSESSOR LOGIN
    else if (isAssessor) {
      if (!assessorRoles.includes(user.role)) {
        return res.status(403).json({
          message: "Please login via correct portal",
        });
      }

      // 🔥 CHECK APPROVAL
      const [inv] = await db.query(
        `SELECT status 
         FROM assessor_invitations 
         WHERE email = ? 
         ORDER BY id DESC 
         LIMIT 1`,
        [user.email]
      );

      if (!inv.length || inv[0].status !== "SUPERADMIN_APPROVED") {
        return res.status(403).json({
          message: "You are not approved yet",
        });
      }
    }

    // 🔥 APPLICANT LOGIN
    else {
      if (user.role !== "APPLICANT") {
        return res.status(403).json({
          message: "Please login via correct portal",
        });
      }

      if (!user.is_verified) {
        return res.status(403).json({
          message: "Please verify your email first",
        });
      }
    }

    /* =========================
       ACCOUNT ACTIVE CHECK
    ========================= */
    if (!user.is_active) {
      return res.status(403).json({
        message: "Account is deactivated",
      });
    }

    /* =========================
       PASSWORD CHECK
    ========================= */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    /* =========================
       TOKEN
    ========================= */
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /* =========================
       PROFILE CHECK (INTERNAL ONLY)
    ========================= */
    let isProfileComplete = true;

    if (internalRoles.includes(user.role)) {
      const [profile] = await db.query(
        "SELECT full_name FROM internal_users WHERE user_id = ?",
        [user.id]
      );

      isProfileComplete = profile.length > 0 && profile[0].full_name;
    }

    /* =========================
       SAFE RESPONSE
    ========================= */
    const { password: _, otp, otp_expiry, ...safeUser } = user;

    return res.json({
      token,
      user: safeUser,
      forcePasswordChange: user.is_temp_password || false,
      isProfileComplete
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
/* =========================
   VERIFY OTP
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