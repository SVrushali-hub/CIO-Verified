import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================
   SEND OTP EMAIL
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

/* =========================
   SEND INVITE EMAIL
========================= */
export const sendInviteEmail = async (email, role, link) => {
  await transporter.sendMail({
    from: `"CIO Verified" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Invitation to join as ${role}`,

    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color:#ff7a00;">You're Invited 🎉</h2>

        <p>You have been invited to join <b>CIO Verified</b> as:</p>
        <h3>${role}</h3>

        <p>Please click the button below to complete your profile:</p>

        <a href="${link}" 
           style="
             display:inline-block;
             padding:12px 20px;
             background:#ff7a00;
             color:#fff;
             text-decoration:none;
             border-radius:6px;
             margin-top:10px;
           ">
           Complete Your Profile
        </a>

        <p style="margin-top:20px;">
          Or copy this link:
        </p>

        <p>${link}</p>

        <hr/>

        <small>This link is valid for one-time use.</small>
      </div>
    `,
  });
};