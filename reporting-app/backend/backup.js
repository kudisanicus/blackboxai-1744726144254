const cron = require('node-cron');
const backup = require('mongodb-backup');
const path = require('path');
const fs = require('fs');
const notifications = require('./email');

// Konfigurasi backup
const config = {
  // Direktori untuk menyimpan backup
  backupDir: path.join(__dirname, '../backups'),
  
  // Jumlah backup yang disimpan (rotasi)
  keepBackups: 7,
  
  // Jadwal backup (default: setiap hari jam 1 pagi)
  schedule: '0 1 * * *',
  
  // Koneksi MongoDB
  database: {
    host: 'localhost',
    port: 27017,
    name: 'reporting_app'
  },
  
  // Email penerima notifikasi
  notificationEmail: 'admin@example.com'
};

// Pastikan direktori backup ada
if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true });
}

// Fungsi untuk melakukan backup
async function performBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(config.backupDir, `backup-${timestamp}`);

  console.log(`Starting backup to ${backupPath}`);

  try {
    await new Promise((resolve, reject) => {
      backup({
        uri: `mongodb://${config.database.host}:${config.database.port}/${config.database.name}`,
        root: backupPath,
        callback: function(err) {
          if (err) {
            console.error('Backup failed:', err);
            reject(err);
          } else {
            console.log('Backup completed successfully');
            resolve();
          }
        }
      });
    });

    // Compress backup directory
    const archivePath = `${backupPath}.tar.gz`;
    await compressBackup(backupPath, archivePath);

    // Remove uncompressed backup
    fs.rmSync(backupPath, { recursive: true });

    // Rotate old backups
    await rotateBackups();

    // Send success notification
    await sendBackupNotification(true, timestamp);

    console.log('Backup process completed');
  } catch (error) {
    console.error('Backup process failed:', error);
    await sendBackupNotification(false, timestamp, error);
  }
}

// Fungsi untuk mengkompresi backup
async function compressBackup(sourcePath, targetPath) {
  const tar = require('tar');
  await tar.create(
    {
      gzip: true,
      file: targetPath,
      cwd: path.dirname(sourcePath)
    },
    [path.basename(sourcePath)]
  );
}

// Fungsi untuk rotasi backup lama
async function rotateBackups() {
  const files = fs.readdirSync(config.backupDir)
    .filter(file => file.endsWith('.tar.gz'))
    .map(file => ({
      name: file,
      path: path.join(config.backupDir, file),
      time: fs.statSync(path.join(config.backupDir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  // Hapus backup yang lebih lama dari batas
  if (files.length > config.keepBackups) {
    const toDelete = files.slice(config.keepBackups);
    for (const file of toDelete) {
      fs.unlinkSync(file.path);
      console.log(`Deleted old backup: ${file.name}`);
    }
  }
}

// Fungsi untuk mengirim notifikasi backup
async function sendBackupNotification(success, timestamp, error = null) {
  const subject = success ? 'Database Backup Berhasil' : 'Database Backup Gagal';
  const html = `
    <h2>${subject}</h2>
    <p><strong>Waktu:</strong> ${new Date(timestamp).toLocaleString('id-ID')}</p>
    ${success 
      ? '<p>Backup database telah berhasil dilakukan dan disimpan.</p>'
      : `<p>Backup database gagal dengan error: ${error.message}</p>`
    }
    <p><strong>Database:</strong> ${config.database.name}</p>
    <p><strong>Host:</strong> ${config.database.host}:${config.database.port}</p>
  `;

  try {
    await notifications.sendEmail(config.notificationEmail, () => ({
      subject,
      html
    }));
  } catch (error) {
    console.error('Failed to send backup notification:', error);
  }
}

// Fungsi untuk menjalankan backup manual
async function runManualBackup() {
  console.log('Starting manual backup...');
  await performBackup();
}

// Schedule automated backup
cron.schedule(config.schedule, () => {
  console.log('Running scheduled backup...');
  performBackup();
});

// Export untuk backup manual
module.exports = {
  runManualBackup,
  config
};

// Jalankan backup manual jika file dijalankan langsung
if (require.main === module) {
  runManualBackup();
}
