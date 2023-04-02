// eslint-disable-next-line import/order
import './utils/fetch-polyfill.mjs';

import pkg from '@slack/bolt';
import os from 'os';
import { autoUpdate } from './utils/auto-update.mjs';

import {
  SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET,
} from './config.mjs';
import { sendMessageToChannel } from './utils/web-client.mjs';
import stableDiffusion, { regexp as stableDiffusionRegExp } from './route/stable-diffusion.mjs';
import draw, { regexp as drawRegExp } from './route/draw.mjs';
import chat from './route/chat.mjs';
import translate, { regexp as translateRegExp } from './route/translate.mjs';
import midjourney, { regexp as midjourneyRegExp } from './route/midjourney.mjs';
import createPrompt,
{ regexp as createPromptRegExp } from './route/create-prompt.mjs';
import remind, { regexp as remindRegExp } from './route/remind.mjs';
import artBook, { regexp as artBookRepExp } from './route/art-book.mjs';

const { App } = pkg;

const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
});

const routesMap = new Map();
routesMap.set('git pull', ({ message }) => autoUpdate(true, (text) => sendMessageToChannel(text, message.channel)));
routesMap.set(drawRegExp, draw);
routesMap.set(stableDiffusionRegExp, stableDiffusion);
routesMap.set(midjourneyRegExp, midjourney);
routesMap.set(createPromptRegExp, createPrompt);
routesMap.set(translateRegExp, translate);
routesMap.set(remindRegExp, remind);
routesMap.set(artBookRepExp, artBook);

const keys = [];

const logWrapper = (fn) => (data) => {
  console.log(data.message);
  fn(data);
};

routesMap.forEach((value, key) => {
  app.message(key, logWrapper(value));
  keys.push(key.toString().replace(/^\/\^/, '').replace(/\/i$/, ''));
});

const defaultRegExp = new RegExp(`^(?!(${keys.join('|')}))(.|\\s)*$`, 'i');
console.warn(defaultRegExp);

app.message(defaultRegExp, logWrapper(chat));

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  const text = `⚡️ Bolt app is running on machine ${os.hostname()} at ${Date()}`;

  sendMessageToChannel(text);

  console.log(text);
})();
