const nodemailer = require('nodemailer');

// Konfigurasi email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com', // Ganti dengan email Anda
    pass: 'your-app-password'     // Ganti dengan password aplikasi Gmail
  }
});

// Template email
const emailTemplates = {
  newReport: (report) => ({
    subject: `Laporan Baru: ${report.title}`,
    html: `
      <h2>Laporan Baru Diterima</h2>
      <p><strong>Judul:</strong> ${report.title}</p>
      <p><strong>Tipe:</strong> ${report.type}</p>
      <p><strong>User:</strong> ${report.userId}</p>
      <p><strong>Deskripsi:</strong> ${report.description}</p>
      <p>Silakan akses dashboard untuk menindaklanjuti laporan ini.</p>
    `
  }),

  statusUpdate: (report) => ({
    subject: `Update Status Laporan: ${report.title}`,
    html: `
      <h2>Update Status Laporan</h2>
      <p><strong>Judul:</strong> ${report.title}</p>
      <p><strong>Status Baru:</strong> ${report.status}</p>
      <p><strong>Progress:</strong> ${report.progress}%</p>
      <p><strong>PIC:</strong> ${report.handler}</p>
      <p><strong>Update Terakhir:</strong> ${
        report.updates.length > 0 
          ? report.updates[report.updates.length - 1].message 
          : 'Belum ada update'
      }</p>
      <p>Silakan cek dashboard untuk detail lengkap.</p>
    `
  }),

  newChat: (message) => ({
    subject: 'Pesan Chat Baru',
    html: `
      <h2>Pesan Chat Baru Diterima</h2>
      <p><strong>Dari:</strong> ${message.sender}</p>
      <p><strong>Terkait Laporan:</strong> ${message.reportTitle}</p>
      <p><strong>Pesan:</strong> ${message.content}</p>
      <p>Silakan buka aplikasi untuk membalas pesan ini.</p>
    `
  })
};

// Fungsi untuk mengirim email
async function sendEmail(to, template, data) {
  try {
    const { subject, html } = template(data);
    
    const mailOptions = {
      from: '"Sistem Pelaporan" <your-email@gmail.com>',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email terkirim:', info.messageId);
    return true;
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    return false;
  }
}

// Notifikasi untuk berbagai event
const notifications = {
  // Notifikasi laporan baru ke admin/teknisi
  async reportCreated(report, adminEmails) {
    for (const email of adminEmails) {
      await sendEmail(email, emailTemplates.newReport, report);
    }
  },

  // Notifikasi update status ke user
  async statusUpdated(report, userEmail) {
    await sendEmail(userEmail, emailTemplates.statusUpdate, report);
  },

  // Notifikasi chat baru
  async newChatMessage(message, recipientEmail) {
    await sendEmail(recipientEmail, emailTemplates.newChat, message);
  }
};

module.exports = notifications;
