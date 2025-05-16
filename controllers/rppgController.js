const ffmpeg = require('fluent-ffmpeg');
const rppgService = require('../services/rppgService');

exports.extractPulse = async (req, res) => {
  try {
    const videoPath = req.file.path;

    // Validate duration
    ffmpeg.ffprobe(videoPath, async (err, metadata) => {
      if (err) {
        return res.status(400).json({ message: 'Could not read video metadata' });
      }

      const duration = metadata.format.duration;
      if (duration > 30) {
        return res.status(400).json({ message: 'Video must be 30 seconds or shorter' });
      }

      // Continue processing
      const { signal, image } = await rppgService.processVideo(videoPath);
      res.json({ signal, image });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
