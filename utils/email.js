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
  // Get the base URL from environment variables
  let baseUrl = process.env.BASE_URL;
  
  // Log the current environment and BASE_URL for debugging
  console.log('Current environment:', process.env.NODE_ENV);
  console.log('BASE_URL:', baseUrl);

  // Validate BASE_URL
  if (!baseUrl) {
    console.error('BASE_URL is not set in environment variables');
    throw new Error('Server configuration error: BASE_URL is not set');
  }

  // Ensure BASE_URL doesn't end with a slash
  baseUrl = baseUrl.replace(/\/$/, '');
  
  const verificationUrl = `${baseUrl}/auth/verify-email/${token}`;
  
  // Log the full verification URL for debugging
  console.log('Verification URL:', verificationUrl);

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Verify Your Email Address for Kanglung-Dine',
    html: `
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Click here to verify your email</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>If the link above doesn't work, copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
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
