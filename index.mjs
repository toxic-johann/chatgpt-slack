import pkg from '@slack/bolt';
import { ChatGPTAPI } from 'chatgpt';
import { CHATGPT_CHANNEL_ID, OPENAI_API_KEY, SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from './config.mjs';
import replicate from "node-replicate";
import LRUCache from 'lru-cache';
import { exec } from 'child_process';
import { WebClient } from '@slack/web-api';
import os from 'os';



// Initialize
const web = new WebClient(SLACK_BOT_TOKEN);

const run = async (cmd) => {
  const child = exec(cmd, (err) => {
      if (err) console.error(err);
  });
  child.stderr.pipe(process.stderr);
  child.stdout.pipe(process.stdout);
  await new Promise((resolve) => child.on('close', resolve));
};

import { simpleGit } from 'simple-git';

const options = {
  max: 500,

  // for use with tracking overall storage size
  maxSize: 5000,
  sizeCalculation: (value, key) => {
    return 1
  },

  // how long to live in ms
  ttl: 1000 * 60 * 5,

  // return stale items before removing from cache?
  allowStale: false,

  updateAgeOnGet: false,
  updateAgeOnHas: false,
}

const conversationCache = new LRUCache(options);

const { App } = pkg;

const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
});

const chatgpt = new ChatGPTAPI({
  apiKey: OPENAI_API_KEY,
});

/* Add functionality here */
app.message(/^(?!(git pull|draw|画)).*$/, async ({ message, say }) => {
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

app.message('git pull', async ({ message, say }) => {
  try {
    await web.chat.postMessage({
      text: 'Restart command confirmed',
      channel: CHATGPT_CHANNEL_ID,
    });
  } catch (error) {
    console.error(error);
  }
  console.log('git pulling');
  // configure the instance with a custom configuration property
  const git = simpleGit();

  // any command executed will be prefixed with this config
  // runs: git -c http.proxy=someproxy pull
  await git.pull();
  console.log('pulled');
  try {
    await web.chat.postMessage({
      text: 'Code updated',
      channel: CHATGPT_CHANNEL_ID,
    });
  } catch (error) {
    console.error(error);
  }
  await run(`npm install`);
  console.log('installed!!');
  try {
    await web.chat.postMessage({
      text: 'Dependencies installed',
      channel: CHATGPT_CHANNEL_ID,
    });
  } catch (error) {
    console.error(error);
  }
  await run(`pm2 restart all`);
});

app.message(/^(draw|画)/i, async ({ message, say }) => {
  console.log(message);
  console.log('transport message to prompt through chatgpt');
  const thread_ts = message.thread_ts || message.ts;
  const command = message.text.replace(/^draw|画/i, "");
  const prompt = await chatgpt.sendMessage(`This is a draw request, “${message}” can you translate it into English for the content I want and then generate a stable diffusion prompt? Return in the following format. Translation: xxx;Prompt: xxx`);
  await say({ text: `Prompt message information: "${prompt.text}"`, thread_ts });
  const matchResult = prompt.text.match(/Prompt: (.*)$/);
  const prediction = await replicate
    .model(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
    )
    .predict({
      prompt: matchResult && matchResult.length > 1 ? command : matchResult[1],
    })
  console.log(prediction);
  // say() sends a message to the channel where the event was triggered
  await say({ text: prediction.output[0], thread_ts });
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  const text = `⚡️ Bolt app is running on machine ${os.hostname()} at ${Date()}`;

  await web.chat.postMessage({
    text,
    channel: CHATGPT_CHANNEL_ID,
  });

  console.log(text);
})();
