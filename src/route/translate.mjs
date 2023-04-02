import ISO6391 from 'iso-639-1';

import chatgpt from '../utils/chatgpt.mjs';
import conversationCache from '../utils/conversation-cache.mjs';

export const regExp = new RegExp(`^(${ISO6391.getAllCodes().join('|')}):`, 'i');

export default async ({ message, say }) => {
  const [code, text] = message.text.split(':');
  const thread_ts = message.thread_ts || message.ts;
  const parentMessageId = conversationCache.get(thread_ts);
  const res = await chatgpt.sendMessage(`traslate "${text}" into ${ISO6391.getName(code)}`, {
    parentMessageId,
  });
  conversationCache.set(thread_ts, res.id);
  // say() sends a message to the channel where the event was triggered
  await say({ text: res.text, thread_ts });
};
