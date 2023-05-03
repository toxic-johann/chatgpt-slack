import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { getThreadTs } from '../selectors/message.mjs';
import { detectTextFromImageBuffer } from '../utils/ocr.mjs';
import { chatCompletion } from '../utils/openai.mjs';
import { web } from '../utils/web-client.mjs';
import { downloadSlackFileAndConvertToBuffer } from '../utils/download-slack-file.mjs';
import { speechToText } from '../utils/speech-to-text.mjs';
import * as chat from './chat.mjs';

dayjs.extend(utc);
dayjs.extend(timezone);

export const regExp = /^$/;

export const introduction = 'Handle file';

export const route = async ({ message, say }) => {
  const { files } = message;
  const thread_ts = getThreadTs(message);
  files.forEach(async (file) => {
    if (!file.mimetype.startsWith('image') && !file.mimetype.startsWith('audio/webm')) {
      return;
    }
    const buffer = await downloadSlackFileAndConvertToBuffer(file);
    if (file.mimetype.startsWith('image')) {
      const text = await detectTextFromImageBuffer(buffer);
      const { user: userId } = message;
      const { user: { tz } } = await web.users.info({ user: userId });
      const clientTime = dayjs.unix(message.ts).tz(tz);
      say({ text, thread_ts });
      const timeInformation = await chatCompletion(`The following text includes an expiration time. Please extract it and format it as YYYY-MM-DDThh:mm:ss. The current time is ${clientTime.format()}. The expiration time should be after the the current time.
    ${text}`, {
        temperature: 0,
      });
      say({ text: timeInformation, thread_ts });
      const timeString = timeInformation.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i)[0];
      const expiration = dayjs.tz(timeString, tz);
      const tips = `It will expire at ${expiration.format()}`;
      say({ text: tips, thread_ts });
      [3, 2, 1].forEach(async (day) => {
        const remindTime = expiration.subtract(day, 'day').hour(21);
        say({ text: `I will remind you at ${remindTime.format()}`, thread_ts });
        try {
          await web.chat.scheduleMessage({
            channel: message.channel,
            text: tips,
            thread_ts,
            post_at: remindTime.utc().unix(),
          });
        } catch (error) {
          console.error(error);
        }
      });
      return;
    }
    const text = await speechToText(buffer);
    say({ text, thread_ts });
    chat.route({
      message: {
        text,
        thread_ts,
      },
      say,
    });
  });
};
