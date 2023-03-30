// eslint-disable-next-line import/order
import pkg from '@slack/bolt';
import os from 'os';
import { autoUpdate } from './utils/auto-update.mjs';

import chatgpt from './utils/chatgpt.mjs';
import {
  SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET,
} from './config.mjs';
import { sendMessageToChannel } from './utils/web-client.mjs';
import conversationCache from './utils/conversation-cache.mjs';
import stableDiffusion from './route/stable-diffusion.mjs';
import draw from './route/draw.mjs';

const { App } = pkg;

const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
});

/* Add functionality here */
app.message(/^(?!(git pull|draw|画|畫|SD:))(.|\s)*$/i, async ({ message, say }) => {
  console.log(message);
  console.log('calling chatgpt');
  const thread_ts = message.thread_ts || message.ts;
  const parentMessageId = conversationCache.get(thread_ts);
  const res = await chatgpt.sendMessage(message.text, {
    parentMessageId,
  });
  conversationCache.set(thread_ts, res.id);
  // say() sends a message to the channel where the event was triggered
  await say({ text: res.text, thread_ts });
});

app.message('git pull', () => autoUpdate(true, sendMessageToChannel));

app.message(/^(draw|画|畫)/i, draw);

app.message(/^SD:/i, stableDiffusion);

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  const text = `⚡️ Bolt app is running on machine ${os.hostname()} at ${Date()}`;

  sendMessageToChannel(text);

  console.log(text);
})();
