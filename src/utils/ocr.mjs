import Vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const vision = new Vision.ImageAnnotatorClient();

fs.readFile(path.join(__dirname, './test1.jpg'), async (err, data) => {
  if (err) throw err;
  // console.log(data);
  const [textDetections] = await vision.textDetection(data);
  const [annotation] = textDetections.textAnnotations;
  const text = annotation ? annotation.description.trim() : '';
  console.log('Extracted text from image:', text);
});
