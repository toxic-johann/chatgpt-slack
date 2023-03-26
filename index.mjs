import pkg from '@slack/bolt';
import { ChatGPTAPI } from 'chatgpt';
import { OPENAI_API_KEY, SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from './config.mjs';
import replicate from "node-replicate"

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

const conversationMap = new Map();

/* Add functionality here */
app.message(/.*/, async ({ message, say }) => {
  if (message.text.match(/^draw|画/i)) return;
  const parentMessageId = conversationMap.has(message.channel) ? conversationMap.get(message.channel) : undefined;
  console.log(message);
  const res = await chatgpt.sendMessage(message.text, {
    parentMessageId,
  });
  conversationMap.set(message.channel, res.id);
  // say() sends a message to the channel where the event was triggered
  await say(res.text);
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
