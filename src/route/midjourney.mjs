import Replicate from 'replicate';
import { REPLICATE_API_TOKEN } from '../config.mjs';

import { getThreadTs } from '../selectors/message.mjs';

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

export default async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const command = message.text.replace(/^(midjourney|mj):/i, '');
  say({ text: `Your command is "${command}"`, thread_ts });
  const startTime = performance.now();
  const output = await replicate.run(
    'prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
    {
      input: {
        prompt: command,
      },
    },
  );
  const duration = performance.now() - startTime;
  // say() sends a message to the channel where the event was triggered
  await say({ text: output[0], thread_ts });
  await say({ text: `Took ${duration}ms. Estimated cost is "$${(0.0023 * duration) / 1000}"`, thread_ts });
};
