const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const { createCanvas } = require('canvas');

async function estimatePulseFromFrames(framePaths) {
  const signal = [];

  for (const framePath of framePaths) {
    const imageBuffer = fs.readFileSync(framePath);
    const imageTensor = tf.node.decodeImage(imageBuffer);

    const green = imageTensor.slice([0, 0, 1], [-1, -1, 1]);
    const mean = green.mean().arraySync();

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

  ctx.strokeStyle = 'green';
  ctx.lineWidth = 2;
  ctx.beginPath();

  signal.forEach((val, i) => {
    const x = (i / (signal.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
  return canvas.toDataURL();
}

exports.processFrames = async (framePaths) => {
  return await estimatePulseFromFrames(framePaths);
};
