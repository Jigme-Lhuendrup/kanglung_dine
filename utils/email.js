const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `http://localhost:${process.env.PORT || 3000}/auth/verify-email/${token}`;
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: to,
    subject: 'Verify Your Email Address for Kanglung-Dine',
    html: `
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', to);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Could not send verification email');
  }
};

module.exports = {
  sendVerificationEmail,
};