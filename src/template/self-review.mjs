import ISO6391 from 'iso-639-1';

import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';
import conversationCache from '../utils/conversation-cache.mjs';

export default ({
  regExp, template, inputName, getTemplate, getLanguageRequirement,
}) => async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const { text } = message;
  const parentMessageId = conversationCache.get(thread_ts);
  const languageRequirement = typeof getLanguageRequirement === 'function'
    ? getLanguageRequirement(text)
    : message.text.match(regExp)[2];
  const description = `
  ${template || getTemplate(text)}
  My ${inputName} is the below one.
  ${message.text.replace(regExp, '')}`;
  console.log(description);
  const res = await chatgpt.sendMessage(description, {
    parentMessageId,
    systemMessage: languageRequirement ? `Please respond me in ${ISO6391.getName(languageRequirement)}` : undefined,
  });
  conversationCache.set(thread_ts, res.id);
  // say() sends a message to the channel where the event was triggered
  await say({ text: res.text, thread_ts });
};
