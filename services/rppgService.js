// services/rppgService.js
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const { createCanvas } = require('canvas');

function extractFrames(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', resolve)
      .on('error', reject)
      .screenshots({
        count: 150, // ~5 fps for 30 sec
        folder: outputDir,
        filename: 'frame-%03d.png',
      });
  });
}

async function estimatePulseFromFrames(framePaths) {
  const signal = [];

  for (const framePath of framePaths) {
    const imageBuffer = fs.readFileSync(framePath);
    const imageTensor = tf.node.decodeImage(imageBuffer); // [H, W, 3]

    const green = imageTensor.slice([0, 0, 1], [-1, -1, 1]); // Extract green channel
    const mean = green.mean().arraySync(); // Scalar mean of green

    signal.push(mean);
    imageTensor.dispose();
    green.dispose();
  }

  return {
    signal,
    image: generateSignalPlot(signal),
  };
}

function generateSignalPlot(signal) {
  const width = 1000;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  const min = Math.min(...signal);
  const max = Math.max(...signal);
  const range = max - min;

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();

  signal.forEach((val, i) => {
    const x = (i / (signal.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
  return canvas.toDataURL(); // base64 PNG
}

exports.processVideo = async (videoPath) => {
  const frameDir = path.join(__dirname, '../uploads/frames_' + Date.now());
  fs.mkdirSync(frameDir, { recursive: true });

  await extractFrames(videoPath, frameDir);

  const frames = fs.readdirSync(frameDir)
    .filter(f => f.endsWith('.png'))
    .map(f => path.join(frameDir, f));

  const result = await estimatePulseFromFrames(frames);

  fs.rmSync(frameDir, { recursive: true, force: true });

  return result;
};
