import pkg from '@slack/bolt';
import { ChatGPTAPI } from 'chatgpt';
import { OPENAI_API_KEY, SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from './config.mjs';
import replicate from "node-replicate";
import LRUCache from 'lru-cache'

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
app.message(/.*/, async ({ message, say }) => {
  if (message.text.match(/^draw|画/i)) return;
  const thread_ts = message.thread_ts || message.ts;
  const parentMessageId = conversationCache.get(thread_ts);
  console.log(message);
  const res = await chatgpt.sendMessage(message.text, {
    parentMessageId,
  });
  conversationCache.set(thread_ts, res.id);
  // say() sends a message to the channel where the event was triggered
  await say({ text: res.text, thread_ts });
});

app.message(/^draw|画/i, async ({ message, say }) => {
  console.log(message);
  const prediction = await replicate
    .model(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
    )
    .predict({
      prompt: message.text.replace(/^draw|画/i, ""),
    })
  console.log(prediction);
  // say() sends a message to the channel where the event was triggered
  await say(prediction.output[0]);
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
