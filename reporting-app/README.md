# Sistem Pelaporan (Request & Komplain)

Aplikasi web untuk mengelola request dan komplain dengan fitur tracking progress, rating, dan multiple user roles.

## Fitur

### Multi-Role Access
- **User**
  - Membuat request/komplain baru
  - Melihat status dan progress laporan
  - Memberikan rating dan komentar setelah laporan selesai
  - Melihat riwayat update dan PIC yang menangani

- **Teknisi**
  - Melihat semua laporan
  - Mengambil dan menangani laporan
  - Mengupdate status dan progress
  - Menambahkan keterangan update
  - Tidak bisa menghapus laporan

- **Admin**
  - Akses penuh ke semua fitur
  - Mengelola user (menambah user baru)
  - Menghapus laporan
  - Export laporan ke CSV
  - Filter laporan berdasarkan periode

### Fitur Utama
- Autentikasi dengan JWT
- Role-based access control
- Rating dan feedback untuk laporan selesai
- Tracking progress realtime
- Riwayat update dengan timestamp
- Export data ke CSV
- Filter laporan berdasarkan periode
- Responsive design dengan Tailwind CSS

## Persyaratan Sistem

- Node.js
- MongoDB
- Web Browser Modern

## Cara Instalasi

1. Install MongoDB
   ```bash
   # Install MongoDB dari website resmi
   # Pastikan service MongoDB berjalan
   ```

2. Clone repository dan install dependensi:
   ```bash
   cd reporting-app
   npm install
   ```

## Cara Menjalankan

1. Pastikan MongoDB berjalan

2. Jalankan server backend:
   ```bash
   cd reporting-app
   npm start
   ```
   Server akan berjalan di http://localhost:3000

3. Buka aplikasi di browser:
   - Halaman Login: buka file `frontend/login.html`

## Akun Default

```
User Biasa:
- Username: user
- Password: user
- Role: user

Teknisi:
- Username: teknisi
- Password: teknisi
- Role: teknisi

Admin:
- Username: admin
- Password: admin
- Role: admin
```

## Alur Penggunaan

### User
1. Login dengan akun user
2. Buat request/komplain baru
3. Pantau progress di daftar laporan
4. Setelah status "Selesai", berikan rating dan komentar

### Teknisi
1. Login dengan akun teknisi
2. Lihat daftar laporan yang perlu ditangani
3. Update status, progress, dan tambahkan keterangan
4. Setelah selesai, ubah status menjadi "Selesai"

### Admin
1. Login dengan akun admin
2. Akses ke semua fitur termasuk:
   - Manajemen user
   - Hapus laporan
   - Export data
   - Filter berdasarkan periode

## Struktur Database

### Collection: Reports
- userId: ID pengguna
- type: Tipe laporan (Request/Komplain)
- title: Judul laporan
- description: Deskripsi detail
- status: Status laporan (Pending/Diproses/Selesai)
- progress: Persentase progress (0-100)
- handler: PIC yang menangani
- rating: Rating dari user (1-5)
- comment: Komentar feedback
- updates: Array dari update/komentar dengan timestamp
- createdAt: Waktu pembuatan laporan

## Keamanan
- Autentikasi menggunakan JWT
- Role-based access control
- Validasi input di frontend dan backend
- Sanitasi data sebelum disimpan ke database

## Pengembangan Selanjutnya
- Implementasi notifikasi email
- Dashboard analytics
- Fitur upload file attachment
- Fitur chat antara user dan teknisi
- Backup otomatis database
