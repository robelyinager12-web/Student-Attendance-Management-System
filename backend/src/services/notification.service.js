const { Notification } = require('../models');
const { sendEmail } = require('../config/mailer.config');

async function createNotification({ userId, title, message, type = 'SYSTEM' }) {
  return Notification.create({ userId, title, message, type });
}

async function notifyAndEmail({ user, title, message, type = 'SYSTEM', sendEmailToo = false }) {
  await createNotification({ userId: user.id, title, message, type });

  if (sendEmailToo && user.email) {
    await sendEmail({
      to: user.email,
      subject: title,
      html: `<p>Hello ${user.name},</p><p>${message}</p>`,
    });
  }
}

// Checks a student's recent attendance and notifies if it's below threshold
async function checkLowAttendanceAndNotify(studentId, thresholdPercent = 75) {
  const { Attendance, Student, User } = require('../models');

  const records = await Attendance.findAll({ where: { studentId } });
  if (records.length === 0) return;

  const present = records.filter((r) => r.status === 'PRESENT').length;
  const percentage = (present / records.length) * 100;

  if (percentage < thresholdPercent) {
    const student = await Student.findByPk(studentId, { include: [{ model: User }] });
    if (!student || !student.User) return;

    await notifyAndEmail({
      user: student.User,
      title: 'Low Attendance Warning',
      message: `Your attendance is currently at ${percentage.toFixed(1)}%, which is below the required ${thresholdPercent}%. Please improve your attendance to avoid academic penalties.`,
      type: 'LOW_ATTENDANCE',
      sendEmailToo: true,
    });
  }
}

module.exports = { createNotification, notifyAndEmail, checkLowAttendanceAndNotify };