// eslint-disable-next-line import/order
import pkg from '@slack/bolt';
import os from 'os';
import { autoUpdate } from './utils/auto-update.mjs';

import {
  SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET,
} from './config.mjs';
import { sendMessageToChannel } from './utils/web-client.mjs';
import stableDiffusion from './route/stable-diffusion.mjs';
import draw from './route/draw.mjs';
import chat from './route/chat.mjs';

const { App } = pkg;

const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
});

/* Add functionality here */
app.message(/^(?!(git pull|draw|画|畫|SD:))(.|\s)*$/i, chat);

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
