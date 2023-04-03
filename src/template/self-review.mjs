import ISO6391 from 'iso-639-1';

import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';
import conversationCache from '../utils/conversation-cache.mjs';

export default ({ regExp, template }) => async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const parentMessageId = conversationCache.get(thread_ts);
  const languageRequirement = message.text.match(regExp)[2];
  const res = await chatgpt.sendMessage(`
${template}
${languageRequirement ? `Please respond me in ${ISO6391.getName(languageRequirement)}` : ''}
My idea is the below one.
${message.text.replace(regExp, '')}`, {
    parentMessageId,
  });
  conversationCache.set(thread_ts, res.id);
  // say() sends a message to the channel where the event was triggered
  await say({ text: res.text, thread_ts });
};
