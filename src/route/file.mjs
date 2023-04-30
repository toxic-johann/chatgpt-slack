import { SLACK_BOT_TOKEN } from '../config.mjs';
import { getThreadTs } from '../selectors/message.mjs';
import { detectTextFromImageBuffer } from '../utils/ocr.mjs';

export const regExp = /^$/;

export const introduction = 'Handle file';

export const route = async ({ message, say }) => {
  const { files } = message;
  const thread_ts = getThreadTs(message);
  files.forEach(async (file) => {
    if (!file.mimetype.startsWith('image')) {
      return;
    }
    const response = await fetch(file.url_private_download, {
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
    });
    const buffer = await response.arrayBuffer();
    const text = await detectTextFromImageBuffer(buffer);
    say({ text, thread_ts });
  });
};
