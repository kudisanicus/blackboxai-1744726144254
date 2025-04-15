const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Report } = require('./db');
const { authenticate, verifyToken, authorizeRoles } = require('./auth');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const token = authenticate(username, password);
  if (!token) {
    return res.status(401).json({ error: 'Username atau password salah' });
  }
  res.json({ token });
});

// Middleware to protect routes
app.use('/api/reports', verifyToken);

// Create a new report (user and admin)
app.post('/api/reports', authorizeRoles('user', 'admin'), async (req, res) => {
  try {
    const { userId, type, title, description } = req.body;
    if (!userId || !type || !title || !description) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }
    // Only allow user to create report for themselves or admin for any user
    if (req.user.role === 'user' && req.user.username !== userId) {
      return res.status(403).json({ error: 'Tidak boleh membuat laporan untuk user lain' });
    }
    const report = new Report({ userId, type, title, description });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat laporan' });
  }
});

// Get reports (user: own reports, teknisi/admin: all)
app.get('/api/reports', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (req.user.role === 'user') {
      query.userId = req.user.username;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data laporan' });
  }
});

// Update report (teknisi, admin, user with restrictions)
app.put('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, handler, updateMessage, rating, comment } = req.body;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }

    // Role-based update permissions
    if (req.user.role === 'user') {
      // User can only add rating/comment if report is completed and belongs to them
      if (report.userId !== req.user.username) {
        return res.status(403).json({ error: 'Tidak boleh mengupdate laporan orang lain' });
      }
      if (report.status !== 'Selesai') {
        return res.status(403).json({ error: 'Hanya bisa memberi rating dan komentar setelah laporan selesai' });
      }
      if (rating !== undefined) report.rating = rating;
      if (comment) report.comment = comment;
    } else if (req.user.role === 'teknisi') {
      // Teknisi can update status, progress, handler, updateMessage but not delete
      if (status) report.status = status;
      if (progress !== undefined) report.progress = progress;
      if (handler) report.handler = handler;
      if (updateMessage) {
        report.updates.push({
          message: updateMessage,
          date: new Date()
        });
      }
    } else if (req.user.role === 'admin') {
      // Admin full access
      if (status) report.status = status;
      if (progress !== undefined) report.progress = progress;
      if (handler) report.handler = handler;
      if (updateMessage) {
        report.updates.push({
          message: updateMessage,
          date: new Date()
        });
      }
      if (rating !== undefined) report.rating = rating;
      if (comment) report.comment = comment;
    } else {
      return res.status(403).json({ error: 'Role tidak dikenali' });
    }
    
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengupdate laporan' });
  }
});

// Delete report (admin only)
app.delete('/api/reports/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }
    res.json({ message: 'Laporan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus laporan' });
  }
});

// Export laporan berdasarkan periode (admin only)
app.get('/api/reports/export', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Tanggal awal dan akhir harus diisi' });
    }

    const reports = await Report.exportReports(new Date(startDate), new Date(endDate));
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengekspor laporan' });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
