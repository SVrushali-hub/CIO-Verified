import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================
   SEND OTP EMAIL (GENERIC)
========================= */
export const sendOTP = async (email, otp, type = "verify") => {
  let subject = "";
  let title = "";

  if (type === "reset") {
    subject = "Password Reset OTP";
    title = "Reset Your Password";
  } else {
    subject = "Email Verification OTP";
    title = "Verify Your Email";
  }

  await transporter.sendMail({
    from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,

    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color:#ff7a00;">${title}</h2>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing:4px;">${otp}</h1>

        <p>This OTP will expire in 5 minutes.</p>

        <hr/>
        <small>If you didn’t request this, ignore this email.</small>
      </div>
    `,
  });
};