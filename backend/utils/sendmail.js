const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust path as needed
const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // set to true only if using port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // <-- disables certificate validation
    // Ignore invalid hostname (fixes "altnames" error)
    checkServerIdentity: () => undefined
  },
});

/**
 * Sends an email using your SMTP settings.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Steddy Funds " <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error("Email could not be sent");
  }
};
const saveOtpGetLink = async (email, expiresInMinutes = 60) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("This email is not registered.");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + expiresInMinutes * 60 * 1000;

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  const token = jwt.sign(
    { email: user.email, otp },
    process.env.JWT_SECRET,
    { expiresIn: `${expiresInMinutes}m` } // sets expiry in JWT as well
  );

  return token;
};



// const sendOtpEmail = async (email) => {
//   const token = await saveOtpGetLink(email);
//   const resetLink = `${process.env.CLIENT_URL}/reset_password?token=${encodeURIComponent(token)}`;

//   const html = `
//   <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Reset Your Password</title>
// </head>
// <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
//     <table role="presentation" style="width: 100%; border-collapse: collapse;">
//         <tr>
//             <td align="center" style="padding: 40px 0;">
//                 <table role="presentation" style="width: 600px; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
//                     <tr>
//                         <td style="padding: 40px; text-align: center;">
//                             <h1 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Password Reset Request</h1>
//                             <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px;">Hi {$escaped_name},</p>
//                             <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
//                                 You requested to reset your password. Click the button below to reset it:
//                             </p>
//                             <table role="presentation" style="margin: 0 auto;">
//                                 <tr>
//                                     <td style="border-radius: 5px; background: #667eea;">
//                                         <a href="${resetLink}" style="display: inline-block; padding: 15px 30px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 5px;">
//                                             Reset Password
//                                         </a>
//                                     </td>
//                                 </tr>
//                             </table>
//                             <p style="margin: 30px 0 10px 0; color: #999999; font-size: 14px;">This link will expire in 1 hour.</p>
//                             <p style="margin: 0; color: #999999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
//                         </td>
//                     </tr>
//                 </table>
//             </td>
//         </tr>
//     </table>
// </body>
// </html>
//   `;

//   await sendEmail(email, "Reset Your Steddy Password", html);

//   return { message: 'Email sent successfully!' };
// };

module.exports = {
  saveOtpGetLink,
  sendEmail
};

