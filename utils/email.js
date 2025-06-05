const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true if port 465 (SSL)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (to, token) => {
  // Use BASE_URL env variable for production, fallback to localhost with PORT
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const verificationUrl = `${baseUrl}/auth/verify-email/${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Verify Your Email Address for Kanglung-Dine',
    html: `
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Click here to verify your email</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Could not send verification email');
  }
};

module.exports = {
  sendVerificationEmail,
};
