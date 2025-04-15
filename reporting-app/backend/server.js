const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data store for reports
let reports = [];
let reportIdCounter = 1;

// Create a new report
app.post('/api/reports', (req, res) => {
  const { userId, type, title, description } = req.body;
  if (!userId || !type || !title || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newReport = {
    id: reportIdCounter++,
    userId,
    type,
    title,
    description,
    status: 'Pending',
    progress: 0,
    handler: null,
    updates: [],
    createdAt: new Date(),
  };
  reports.push(newReport);
  res.status(201).json(newReport);
});

// Get reports for a user
app.get('/api/reports', (req, res) => {
  const { userId } = req.query;
  if (userId) {
    const userReports = reports.filter(r => r.userId === userId);
    return res.json(userReports);
  }
  // If no userId, return all reports (admin)
  res.json(reports);
});

// Update report progress and handler (admin)
app.put('/api/reports/:id', (req, res) => {
  const reportId = parseInt(req.params.id);
  const { status, progress, handler, updateMessage } = req.body;
  const report = reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  if (status) report.status = status;
  if (progress !== undefined) report.progress = progress;
  if (handler) report.handler = handler;
  if (updateMessage) {
    report.updates.push({
      message: updateMessage,
      date: new Date(),
    });
  }
  res.json(report);
});

app.listen(port, () => {
  console.log(`Reporting app backend listening at http://localhost:${port}`);
});
