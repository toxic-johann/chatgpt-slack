import Vision from '@google-cloud/vision';

const vision = new Vision.ImageAnnotatorClient();

export async function detectTextFromImageBuffer(data) {
  const [textDetections] = await vision.textDetection(data);
  const [annotation] = textDetections.textAnnotations;
  const text = annotation ? annotation.description.trim() : '';
  return text;
}
