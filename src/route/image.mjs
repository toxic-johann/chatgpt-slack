import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from '../config.mjs';
import { getThreadTs } from '../selectors/message.mjs';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const introduction = 'oi: open api image generator, not free. oi: generate a random image. oi-256x256: generate a random image with size 256x256.';

export const regExp = /^oi(-(\d+x\d+))?:/i;

export const route = async ({ message, say }) => {
  const size = message.text.match(regExp)[2] || '256x256';
  const command = message.text.replace(regExp, '').trim();
  const thread_ts = getThreadTs(message);
  const response = await openai.createImage({
    prompt: command,
    n: 1,
    size,
  });
  console.warn(response);
  const text = response.error
    ? response.data.error.message
    : response.data.data[0].url;
  // say() sends a message to the channel where the event was triggered
  await say({ text, thread_ts });
};
