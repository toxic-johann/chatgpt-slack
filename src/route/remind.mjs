import dayjs from 'dayjs';

import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';
import timeConvert from '../utils/time-convert.mjs';
import { web } from '../utils/web-client.mjs';
import { CHATGPT_CHANNEL_ID } from '../config.mjs';

export const regexp = /^(r:|remind|提醒)/i;

export default async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const clientTime = dayjs.unix(message.ts);
  const remindInfo = await chatgpt.sendMessage(`
  I want to extract information from the reminder message. This kind of message usually includes two pieces of information. One is the time message. The other one is the work that I need to do at that time.
  For example, Remind me to buy tickets at 5 pm should split into these two parts.
  Work: Buy tickets
  Time: 5 pm.
  If you can’t extract valid information, please return a piece of error information starting with “Error:“.
  All return should be in English. If my message is not in English, translate it to english first.
  The final output should be.
  Work: xxxx
  Time: xxxx
  My message is “${message.text.replace(/^r:/i, '')}“.
  `);
  // say() sends a message to the channel where the event was triggered
  await say({ text: remindInfo.text, thread_ts });
  const timeString = remindInfo.text.match(/Time: (.*)/i)[1];
  const workString = remindInfo.text.match(/Work: (.*)/i)[1];
  const {
    time,
    duration,
  } = await timeConvert(timeString, (text) => say({ text, thread_ts }));
  await say({ text: `Time: ${time}\nDuration: ${duration}\nWork: ${workString}`, thread_ts });
  if (/\d+-\d+:\d+:\d+/.test(duration)) {
    const [day, hour, minute, second] = duration.split(/-|:/);
    const estimateTime = clientTime
      .add(day, 'day')
      .add(hour, 'hour')
      .add(minute, 'minute')
      .add(second, 'second');
    await say({ text: `Your current time is ${clientTime.format()}. I will remind you at ${estimateTime.format()}`, thread_ts });
    try {
      const { user: userId } = message;
      const user = await web.users.info({
        user: userId,
        include_locale: true,
      });
      console.log(user.tz_offset);
      await web.chat.scheduleMessage({
        channel: CHATGPT_CHANNEL_ID,
        text: workString,
        thread_ts,
        post_at: estimateTime.unix(),
      });
    } catch (error) {
      console.error(error);
    }
  }
};
