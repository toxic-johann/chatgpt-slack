import replicate from 'node-replicate';
import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';

export default async ({ message, say }) => {
  console.log(message);
  console.log('transport message to prompt through chatgpt');
  const thread_ts = getThreadTs(message);
  const result = await chatgpt.sendMessage(`This is a draw request, “${message.text}”. Please extract the content that I want to draw and name it item A. For example, "draw a dog" should generate item A as "a dog". And then optimize the item A you just generate as a stable diffusion prompt in English. Return me the result in the following format: "Item A:xxx; Prompt: xxx".`);
  const promptMatch = result.text.match(/Prompt:(.*?)$/);
  await say({ text: result.text, thread_ts });
  const prediction = await replicate
    .model(
      'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
    )
    .predict({
      prompt: promptMatch && promptMatch.length > 0 ? promptMatch[1] : prompt.text,
    });
  console.log(prediction);
  // say() sends a message to the channel where the event was triggered
  await say({ text: prediction.output[0], thread_ts });
};
