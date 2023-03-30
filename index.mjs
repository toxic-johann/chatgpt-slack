import { autoUpdate } from './auto-update.mjs';

import pkg from '@slack/bolt';
import { ChatGPTAPI } from 'chatgpt';
import { CHATGPT_CHANNEL_ID, OPENAI_API_KEY, SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from './config.mjs';
import replicate from "node-replicate";
import LRUCache from 'lru-cache';
import { WebClient } from '@slack/web-api';
import os from 'os';

// Initialize
const web = new WebClient(SLACK_BOT_TOKEN);

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

app.message('git pull', async ({ message, say }) => {
  autoUpdate(true, async (text) => {
    try {
      await web.chat.postMessage({
        text,
        channel: CHATGPT_CHANNEL_ID,
      });
    } catch (error) {
      console.error(error);
    }
  });
});

app.message(/^(draw|画|畫)/i, async ({ message, say }) => {
  console.log(message);
  console.log('transport message to prompt through chatgpt');
  const thread_ts = message.thread_ts || message.ts;
  const result = await chatgpt.sendMessage(`This is a draw request, “${message.text}”. Please extract the content that I want to draw and name it item A. For example, "draw a dog" should generate item A as "a dog". And then optimize the item A you just generate as a stable diffusion prompt in English. Return me the result in the following format: "Item A:xxx; Prompt: xxx".`);
  const promptMatch = result.text.match(/Prompt:(.*?)$/);
  await say({ text: result.text, thread_ts });
  const prediction = await replicate
    .model(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
    )
    .predict({
      prompt: promptMatch && promptMatch.length > 0 ? promptMatch[1] : prompt.text,
    })
  console.log(prediction);
  // say() sends a message to the channel where the event was triggered
  await say({ text: prediction.output[0], thread_ts });
});

app.message(/^SD:/i, async ({ message, say }) => {
  console.log(message);
  const thread_ts = message.thread_ts || message.ts;
  const command = message.text.replace(/^SD/i, "");
  const prediction = await replicate
    .model(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
    )
    .predict({
      prompt: command,
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
