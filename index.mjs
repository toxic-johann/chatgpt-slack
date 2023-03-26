import pkg from '@slack/bolt';
import { ChatGPTAPI } from 'chatgpt';
import { OPENAI_API_KEY, SLACK_APP_TOKEN, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } from './config.mjs';

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
  console.warn(message);
  const res = await chatgpt.sendMessage(message.text)
  // say() sends a message to the channel where the event was triggered
  await say(res.text);
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();