import replicate from 'node-replicate';
import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';

export const regExp = /^(draw|画|畫)/i;

export const introduction = 'draw: draw image with stable diffusion and with prompt improvement. Free~~';

export const route = async ({ message, say }) => {
  console.log('transport message to prompt through chatgpt');
  const thread_ts = getThreadTs(message);
  await say({ text: `Original text: ${message.text}`, thread_ts });
  const result = await chatgpt.sendMessage(`This is a draw request, “${message.text}”. Please extract the content that I want to draw and name it item A. For example, "draw a dog" should generate item A as "a dog". And then optimize the item A you just generate as a stable diffusion prompt in English. Return me the result in the following format: "Item A:xxx; Prompt: xxx".`);
  const promptMatch = result.text.match(/Prompt:(.*?)$/);
  await say({ text: result.text, thread_ts });
  const model = 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf';
  const input = { prompt: promptMatch && promptMatch.length > 0 ? promptMatch[1] : prompt.text };
  const prediction = await replicate.run(model, input);
  console.log(prediction);
  // say() sends a message to the channel where the event was triggered
  await say({ text: prediction[0], thread_ts });
};
