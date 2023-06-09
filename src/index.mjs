// eslint-disable-next-line import/order
import './utils/fetch-polyfill.mjs';

import pkg from '@slack/bolt';
import os from 'os';
import http from 'http';
import jsonBody from 'body/json.js';
import { autoUpdate } from './utils/auto-update.mjs';

import {
  SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET,
} from './config.mjs';
import { sendMessageToChannel, slackLog } from './utils/web-client.mjs';
import * as chat from './route/chat.mjs';

import * as file from './route/file.mjs';

import './task/check-convertible-bond.mjs';
import './task/today-weather.mjs';
import './task/tomorrow-weather.mjs';
import { getThreadTs } from './selectors/message.mjs';
import { featureRoutesMap } from './route/features.mjs';
import chatgpt from './utils/chatgpt.mjs';

const { App } = pkg;

const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
});

const routesMap = new Map(featureRoutesMap);
routesMap.set('git pull', {
  route: ({ message }) => autoUpdate(true, (text) => sendMessageToChannel(text, message.channel)),
});

routesMap.set(file.regExp, file);

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

app.message(/^man$/, logWrapper(async ({ message, say }) => {
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

  slackLog(text);

  console.log(text);
})();

http.createServer((req, res) => {
  slackLog('port requested');
  jsonBody(req, async (err, bodyPayload) => {
    if (err || typeof bodyPayload.text !== 'string' || !bodyPayload.text) {
      res.writeHead(403);
      res.end();
      return;
    }
    const answer = await chatgpt.sendMessage(bodyPayload.text);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(answer.text);
    res.end();
  });
}).listen(7322);
