// routes/rppgRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const rppgController = require('../controllers/rppgController');

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'), false);
    }
    cb(null, true);
  },
});


router.post('/pulse', upload.single('video'), rppgController.extractPulse);

module.exports = router;
