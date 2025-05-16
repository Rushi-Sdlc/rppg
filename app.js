const path = require('path');
const express = require('express');
const cors = require('cors');
const rppgRoutes = require('./routes/rppgRoutes');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// ✅ API routes
app.use('/api/rppg', rppgRoutes);

// ✅ Error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Video must be under 20MB' });
  }
  res.status(500).json({ message: err.message || 'Unexpected error' });
});

module.exports = app;
