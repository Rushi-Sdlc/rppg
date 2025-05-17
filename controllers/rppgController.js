const fs = require('fs');
const path = require('path');
const rppgService = require('../services/rppgService');

exports.extractPulseFromFrames = async (req, res) => {
  try {
    const framePaths = req.files.map(file => file.path);
    const { signal, image } = await rppgService.processFrames(framePaths);

    // Optional cleanup
    req.files.forEach(f => fs.unlinkSync(f.path));
    fs.rmdirSync(path.dirname(req.files[0].path), { recursive: true });

    res.json({ signal, image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
