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

const routesMap = new Map();
routesMap.set('git pull', () => autoUpdate(true, sendMessageToChannel));
routesMap.set(/^(draw|画|畫)/i, draw);
routesMap.set(/^SD:/i, stableDiffusion);

const keys = [];

const logWrapper = (fn) => {
  return (data) => {
    console.log(data.message);
    fn(data);
  };
} 

routesMap.forEach((value, key) => {
  app.message(key, logWrapper(value));
  keys.push(key.toString().replace(/^\/\^/, '').replace(/\/i$/, ''));
});

const defaultRegExp = new RegExp(`^(?!(${keys.join('|')}))(.|\s)*$`, 'i');
console.warn(defaultRegExp)

app.message(defaultRegExp, logWrapper(chat));

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  const text = `⚡️ Bolt app is running on machine ${os.hostname()} at ${Date()}`;

  sendMessageToChannel(text);

  console.log(text);
})();
