import { WebClient } from '@slack/web-api';
import { CHATGPT_CHANNEL_ID, SLACK_BOT_TOKEN } from '../config.mjs';

// Initialize
export const web = new WebClient(SLACK_BOT_TOKEN);

export async function sendMessageToChannel(text, channel = CHATGPT_CHANNEL_ID) {
  try {
    return web.chat.postMessage({
      text,
      channel,
    });
  } catch (error) {
    console.error(error);
  }
  return Promise.reject();
}
