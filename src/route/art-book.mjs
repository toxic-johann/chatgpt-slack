/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import replicate from 'node-replicate';
import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';

export const regExp = /^art-book:/i;

export default async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const topic = message.text.replace(regExp, '');
  await say({ text: `Your topic: ${topic}`, thread_ts });
  const scriptResult = await chatgpt.sendMessage(`As a creative project, I have a piece of text that I would like to transform into a set of images. To accomplish this, I would like your help to complete the following steps:
  1. Expand the given text to around 200 words, focusing on its main theme. We name this as “article”
  2. Extract emotional characteristics from each sentence of the article and assign numerical values to them.
  3. Determine a color tone for each sentence based on its emotional characteristics and corresponding numerical value.
  4. Create an image description to visually represent each sentence of the article along with its corresponding color tone.
  The text is "${topic}"`);
  await say({ text: scriptResult.text, thread_ts });
  const descriptionsString = scriptResult.text.match(/4.*\n((.|\s)*)/i)[1];
  const sentences = descriptionsString.split(/\n/);
  for (const sentence of sentences) {
    const prediction = await replicate
      .model(
        'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      )
      .predict({
        prompt: sentence,
      });
    console.log(prediction);
    await say({ text: `${sentence}: ${prediction.output[0]}`, thread_ts });
  }
};
