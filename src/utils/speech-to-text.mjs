// Imports the Google Cloud client library
import speech from '@google-cloud/speech';

// Creates a client
const client = new speech.SpeechClient();

export async function speechToText(content, config = {
  encoding: 'WEBM_OPUS',
  sampleRateHertz: 8000,
  languageCode: 'zh-CN',
}) {
  const audio = { content };
  const request = {
    audio,
    config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join('\n');
  return transcription;
}
