# Sistem Pelaporan (Request & Komplain)

Aplikasi web untuk mengelola request dan komplain dengan fitur lengkap termasuk chat, notifikasi email, analytics, dan backup otomatis.

## Fitur Utama

### Multi-Role Access
- **User**
  - Membuat request/komplain baru
  - Upload file attachment
  - Chat dengan teknisi
  - Memberikan rating dan komentar
  - Menerima notifikasi email

- **Teknisi**
  - Menangani laporan
  - Chat dengan user
  - Melihat analytics dashboard
  - Upload file penyelesaian
  - Update progress realtime

- **Admin**
  - Akses penuh ke semua fitur
  - Manajemen user
  - Export data
  - Akses analytics dashboard
  - Manajemen backup

### Fitur Baru
1. **Chat Realtime**
   - Komunikasi langsung antara user dan teknisi
   - Status online/offline
   - Notifikasi pesan baru
   - Attachment dalam chat

2. **Notifikasi Email**
   - Laporan baru
   - Update status
   - Pesan chat baru
   - Notifikasi backup

3. **Analytics Dashboard**
   - Statistik umum
   - Trend laporan
   - Performa teknisi
   - Distribusi rating
   - Analisis waktu respon

4. **Upload File**
   - Support berbagai format file
   - Limit ukuran 5MB
   - Preview file
   - Attachment pada laporan dan chat

5. **Backup Otomatis**
   - Backup harian
   - Rotasi backup
   - Kompresi file backup
   - Notifikasi status backup

## Persyaratan Sistem

- Node.js
- MongoDB
- SMTP Server (untuk email)
- Disk space untuk file uploads dan backups

## Instalasi

1. Clone repository dan install dependensi:
   ```bash
   cd reporting-app
   npm install
   ```

2. Konfigurasi email di `backend/email.js`:
   ```javascript
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     auth: {
       user: 'your-email@gmail.com',
       pass: 'your-app-password'
     }
   });
   ```

3. Buat direktori untuk uploads dan backups:
   ```bash
   mkdir uploads
   mkdir backups
   ```

4. Sesuaikan konfigurasi backup di `backend/backup.js`:
   ```javascript
   const config = {
     backupDir: '../backups',
     keepBackups: 7,
     schedule: '0 1 * * *'  // Setiap hari jam 1 pagi
   };
   ```

## Menjalankan Aplikasi

1. Start MongoDB:
   ```bash
   mongod
   ```

2. Jalankan server:
   ```bash
   npm start
   ```

3. Buka aplikasi di browser:
   - Login: `frontend/login.html`
   - User Dashboard: `frontend/index.html`
   - Admin Dashboard: `frontend/admin.html`
   - Teknisi Dashboard: `frontend/teknisi.html`
   - Analytics: `frontend/analytics.html`

## Penggunaan Fitur

### Chat
1. Buka detail laporan
2. Klik tab "Chat"
3. Mulai percakapan dengan teknisi/user
4. Upload file jika diperlukan

### File Upload
- Format yang didukung: PDF, Image, Doc, ZIP
- Maksimal ukuran: 5MB
- Lokasi file: `/uploads`

### Analytics Dashboard
1. Akses `frontend/analytics.html`
2. Pilih periode analisis
3. Lihat berbagai metrik dan grafik
4. Export data jika diperlukan

### Backup
- Automatic: Berjalan sesuai jadwal di config
- Manual: Melalui Admin Dashboard
- Lokasi: `/backups`
- Format: `.tar.gz`

## Struktur Database

### Collection: Reports
- Informasi laporan
- File attachments
- Riwayat update
- Rating dan komentar

### Collection: Chats
- Pesan chat
- Info pengirim
- Timestamp
- File attachments

### Collection: Attachments
- Metadata file
- Path penyimpanan
- Info upload

## Keamanan
- JWT Authentication
- Role-based access control
- File type validation
- Email notifications
- Backup encryption

## Monitoring
- Server logs
- Email notifications
- Backup status
- User activity
- System performance

## Troubleshooting

### Email Tidak Terkirim
1. Cek konfigurasi SMTP
2. Verifikasi kredensial email
3. Periksa firewall/port

### Backup Gagal
1. Cek disk space
2. Verifikasi permissions
3. Periksa log backup

### Upload Gagal
1. Cek ukuran file
2. Verifikasi format file
3. Periksa disk space
4. Cek permissions folder

## Pengembangan Selanjutnya
- Mobile app
- Integrasi WhatsApp
- Dashboard customization
- Advanced analytics
- Multi-language support
