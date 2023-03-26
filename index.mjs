import pkg from '@slack/bolt';
import { ChatGPTAPI } from 'chatgpt';
import { OPENAI_API_KEY, SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from './config.mjs';
import replicate from "node-replicate";
import LRUCache from 'lru-cache';
import { exec } from 'child_process';

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
  console.log('git pulling');
  // configure the instance with a custom configuration property
  const git = simpleGit();

  // any command executed will be prefixed with this config
  // runs: git -c http.proxy=someproxy pull
  await git.pull();
  console.log('pulled');
  await run(`npm install`);
  console.log('installed!!');
  await say({ text: 'pulled', thread_ts: message.ts });
  await run(`pm2 restart all`);
});

app.message(/^draw|画/i, async ({ message, say }) => {
  console.log(message);
  console.log('transport message to prompt through chatgpt');
  const thread_ts = message.thread_ts || message.ts;
  const command = message.text.replace(/^draw|画/i, "");
  const prompt = await chatgpt.sendMessage(`transport the following message into a stable defussion prompt in english and only return the english prompt without explanation: ${command}`);
  const prediction = await replicate
    .model(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
    )
    .predict({
      prompt: prompt.text,
    })
  console.log(prediction);
  // say() sends a message to the channel where the event was triggered
  await say({ text: prediction.output[0], thread_ts });
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
