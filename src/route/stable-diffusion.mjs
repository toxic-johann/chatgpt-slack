import replicate from 'node-replicate';
import { getThreadTs } from '../selectors/message.mjs';

export const regexp = /^SD:/i;

export default async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const command = message.text.replace(regexp, '');
  say({ text: `Your command is "${command}"`, thread_ts });
  const prediction = await replicate
    .model(
      'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
    )
    .predict({
      prompt: command,
    });
  console.log(prediction);
  // say() sends a message to the channel where the event was triggered
  await say({ text: prediction.output[0], thread_ts });
};
