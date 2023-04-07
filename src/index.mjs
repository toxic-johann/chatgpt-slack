// eslint-disable-next-line import/order
import './utils/fetch-polyfill.mjs';

import pkg from '@slack/bolt';
import os from 'os';
import { autoUpdate } from './utils/auto-update.mjs';

import {
  SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET,
} from './config.mjs';
import { sendMessageToChannel } from './utils/web-client.mjs';
import * as stableDiffusion from './route/stable-diffusion.mjs';
import * as draw from './route/draw.mjs';
import * as chat from './route/chat.mjs';
import * as translate from './route/translate.mjs';
import * as midjourney from './route/midjourney.mjs';
import * as createPrompt from './route/create-prompt.mjs';
import * as createStory from './route/create-story.mjs';
import * as createUnitTest from './route/create-unit-test.mjs';
import * as remind from './route/remind.mjs';
import * as artBook from './route/art-book.mjs';
import * as image from './route/image.mjs';
import * as debug from './route/debug.mjs';
import * as expert from './route/expert.mjs';

import './task/check-convertible-bond.mjs';
import { getThreadTs } from './selectors/message.mjs';

const { App } = pkg;

const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
});

const routesMap = new Map();
routesMap.set('git pull', {
  route: ({ message }) => autoUpdate(true, (text) => sendMessageToChannel(text, message.channel)),
});
routesMap.set(draw.regExp, draw);
routesMap.set(stableDiffusion.regExp, stableDiffusion);
routesMap.set(midjourney.regExp, midjourney);
routesMap.set(createPrompt.regExp, createPrompt);
routesMap.set(translate.regExp, translate);
routesMap.set(remind.regExp, remind);
routesMap.set(artBook.regExp, artBook);
routesMap.set(createStory.regExp, createStory);
routesMap.set(createUnitTest.regExp, createUnitTest);
routesMap.set(image.regExp, image);
routesMap.set(debug.regExp, debug);
routesMap.set(expert.regExp, expert);

const keys = [];
const introductions = [];

const logWrapper = (fn) => (data) => {
  console.log(data.message);
  fn(data);
};

routesMap.forEach((module, key) => {
  app.message(key, logWrapper(module.route));
  keys.push(key.toString().replace(/^\/\^/, '').replace(/\/i$/, ''));
  if (module.introduction) {
    introductions.push(module.introduction);
  }
});

app.message('man', logWrapper(async ({ message, say }) => {
  const introduction = introductions.join('\n');
  say({ text: introduction, thread_ts: getThreadTs(message) });
}));
keys.push('man$');

const defaultRegExp = new RegExp(`^(?!(${keys.join('|')}))(.|\\s)*$`, 'i');
console.warn(defaultRegExp);

app.message(defaultRegExp, logWrapper(chat.route));

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  const text = `⚡️ Bolt app is running on machine ${os.hostname()} at ${Date()}`;

  sendMessageToChannel(text);

  console.log(text);
})();
