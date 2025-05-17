const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rppgController = require('../controllers/rppgController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/frames_' + Date.now();
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

router.post('/pulse-frames', upload.array('frames'), rppgController.extractPulseFromFrames);

module.exports = router;
