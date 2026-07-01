const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"Student Attendance System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Student Attendance System',
    html: `
      <h2>Welcome, ${user.name}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Your role is: <strong>${user.role}</strong></p>
      <p>You can now log in using your email and password.</p>
      <br/>
      <p>Thank you,</p>
      <p>Student Attendance Management System</p>
    `,
  });
}

async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Click the link below.</p>
      <p>This link expires in 1 hour.</p>
      <a href="${resetUrl}"
        style="background:#4F46E5;color:white;padding:10px 20px;
        border-radius:5px;text-decoration:none;">
        Reset Password
      </a>
      <br/><br/>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
}

async function sendLowAttendanceEmail(user, percentage) {
  return sendEmail({
    to: user.email,
    subject: 'Low Attendance Warning',
    html: `
      <h2>Low Attendance Warning</h2>
      <p>Hello ${user.name},</p>
      <p>Your current attendance is <strong>${percentage}%</strong>,
      which is below the required 75%.</p>
      <p>Please improve your attendance to avoid academic penalties.</p>
      <br/>
      <p>Student Attendance Management System</p>
    `,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendLowAttendanceEmail,
};