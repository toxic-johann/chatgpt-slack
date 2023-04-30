import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { SLACK_BOT_TOKEN } from '../config.mjs';
import { getThreadTs } from '../selectors/message.mjs';
import { detectTextFromImageBuffer } from '../utils/ocr.mjs';
import { chatCompletion } from '../utils/openai.mjs';
import { web } from '../utils/web-client.mjs';

dayjs.extend(utc);
dayjs.extend(timezone);

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
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await detectTextFromImageBuffer(buffer);
    say({ text, thread_ts });
    const timeInformation = await chatCompletion(`The following text includes an expiration time. Please extract it and format it as YYYY-MM-DDThh:mm:ss. ${text}`, {
      temperature: 0,
    });
    say({ text: timeInformation, thread_ts });
    const timeString = timeInformation.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i)[0];
    const { user: userId } = message;
    const { user: { tz } } = await web.users.info({ user: userId });
    const expiration = dayjs.tz(timeString, tz);
    say({ text: `It will expire at ${expiration.format()}`, thread_ts });
  });
};
