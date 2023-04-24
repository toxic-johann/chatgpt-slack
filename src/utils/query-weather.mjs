import { chatCompletion } from './openai.mjs';

export default async (timeString, position, log) => {
  const {
    time,
    duration,
  } = await timeConvert(timeString, log);
  if (typeof log === 'function') {
    log(res);
  }
  const time = res.match(/Time: (.*)/i)[1];
  const duration = res.match(/duration: (.*)/i)[1];
  return { time, duration };
};
