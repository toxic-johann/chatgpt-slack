import { getThreadTs } from '../selectors/message.mjs';
import chatgpt from '../utils/chatgpt.mjs';
import timeConvert from '../utils/time-convert.mjs';

export const regexp = /^(r:|remind|提醒)/i;

export default async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
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
  } = await timeConvert(timeString);
  await say({ text: `Time: ${time}\nDuration: ${duration}\nWork: ${workString}`, thread_ts });
};
