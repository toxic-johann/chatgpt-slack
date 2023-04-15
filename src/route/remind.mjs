import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';
import timeConvert from '../utils/time-convert.mjs';
import { web } from '../utils/web-client.mjs';
import { chatCompletion } from '../utils/openai.mjs';

export const regExp = /^(r:|remind|提醒)/i;

dayjs.extend(utc);
dayjs.extend(timezone);

export const introduction = 'remind: remind me to do something at a specific time.';

export const route = async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const clientTime = dayjs.unix(message.ts);
  const remindInfo = await chatCompletion(`
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
  `, {
    temperature: 0,
  });
  // say() sends a message to the channel where the event was triggered
  await say({ text: remindInfo, thread_ts });
  const timeString = remindInfo.match(/Time: (.*)/i)[1];
  const workString = remindInfo.match(/Work: (.*)/i)[1];
  const {
    time,
    duration,
  } = await timeConvert(timeString, (text) => say({ text, thread_ts }));
  await say({ text: `Time: ${time}\nDuration: ${duration}\nWork: ${workString}`, thread_ts });
  const { user: userId } = message;
  const { user: { tz } } = await web.users.info({ user: userId });
  let estimateTime;
  if (/\d+-\d+:\d+:\d+/.test(duration)) {
    const [day, hour, minute, second] = duration.split(/-|:/);
    estimateTime = clientTime
      .add(day, 'day')
      .add(hour, 'hour')
      .add(minute, 'minute')
      .add(second, 'second');
  } else if (!/error/.test(time)) {
    const methods = ['year', 'month', 'date', 'hour', 'minute', 'second'];
    estimateTime = time.split(/-|:| /).reduce((prevTime, value, index) => {
      if (!/\d+/.test(value)) return prevTime;
      const num = parseInt(value, 10);
      return prevTime[methods[index]](index === 1 ? num - 1 : num);
    }, clientTime.tz(tz));
    if (clientTime.isAfter(estimateTime)) {
      estimateTime = methods.reduce((prevTime, method) => {
        if (estimateTime.isAfter(clientTime)) return prevTime;
        if (estimateTime.isSame(clientTime, method)) return prevTime;
        prevTime[method](clientTime[method]());
        return prevTime;
      }, estimateTime);
    }
  }
  await say({ text: `Your current time is ${clientTime.tz(tz).format()}. I will remind you at ${estimateTime && estimateTime.tz(tz).format()}`, thread_ts });
  try {
    await web.chat.scheduleMessage({
      channel: message.channel,
      text: workString,
      thread_ts,
      post_at: estimateTime.utc().unix(),
    });
  } catch (error) {
    console.error(error);
  }
};
