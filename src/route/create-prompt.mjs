import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';
import conversationCache from '../utils/conversation-cache.mjs';

export default async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const parentMessageId = conversationCache.get(thread_ts);
  const res = await chatgpt.sendMessage(`
I want you to become my Expert Prompt Creator. Your goal is to help me craft the best possible prompt for my needs. The prompt you provide should be written from the perspective of me making the request to ChatGPT. Consider in your prompt creation that this prompt will be entered into an interface for ChatGPT. The process is as follows:
You will generate the following sections:
Prompt:
{provide the best possible prompt according to my request}
Critique:
{provide a concise paragraph on how to improve the prompt. Be very critical in your response}
Questions:
{ask any questions pertaining to what additional information is needed from me to improve the prompt (max of 1). If the prompt needs more clarification or details in certain areas, ask questions to get more information to include in the prompt}
I will provide my answers to your response which you will then incorporate into your next response using the same format. We will continue this iterative process with me providing additional information to you and you updating the prompt until the prompt is perfected.
Remember, the prompt we are creating should be written from the perspective of me making a request to ChatGPT. Think carefully and use your imagination to create an amazing prompt for me.
My idea is the below one.
${message.text}`, {
    parentMessageId,
  });
  conversationCache.set(thread_ts, res.id);
  // say() sends a message to the channel where the event was triggered
  await say({ text: res.text, thread_ts });
};
