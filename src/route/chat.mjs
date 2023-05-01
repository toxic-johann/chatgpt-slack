import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';
import conversationCache from '../utils/conversation-cache.mjs';

export const route = async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const parentMessageId = conversationCache.get(thread_ts);
  const res = await chatgpt.sendMessage(message.text, {
    parentMessageId,
  });
  console.warn(res);
  conversationCache.set(thread_ts, res.id);
  // say() sends a message to the channel where the event was triggered
  await say({ text: res.text, thread_ts });
};
