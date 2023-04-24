import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { web } from '../utils/web-client.mjs';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getClientTimeFromMessage(message) {
  return dayjs.unix(message.ts);
}

export async function getTimezoneFromMessage(message) {
  const { user: userId } = message;
  const { user: { tz } } = await web.users.info({ user: userId });
  return tz;
}

export async function getEstimateTimeFromTimeOrDuration({
  duration,
  time,
  message,
  needTimezone,
  estimateTimeShouldAfterClientTime,
}) {
  const clientTime = getClientTimeFromMessage(message);
  if (/\d+-\d+:\d+:\d+/.test(duration)) {
    const [day, hour, minute, second] = duration.split(/-|:/);
    const estimateTime = clientTime
      .add(day, 'day')
      .add(hour, 'hour')
      .add(minute, 'minute')
      .add(second, 'second');
    if (!needTimezone) {
      return estimateTime;
    }
    const tz = await getTimezoneFromMessage(message);
    return estimateTime.tz(tz);
  }
  if (!/error/.test(time)) {
    const tz = await getTimezoneFromMessage(message);
    const methods = ['year', 'month', 'date', 'hour', 'minute', 'second'];
    let estimateTime = time.split(/-|:| /).reduce((prevTime, value, index) => {
      if (!/\d+/.test(value)) return prevTime;
      const num = parseInt(value, 10);
      return prevTime[methods[index]](index === 1 ? num - 1 : num);
    }, clientTime.tz(tz));
    if (estimateTimeShouldAfterClientTime && clientTime.isAfter(estimateTime)) {
      estimateTime = methods.reduce((prevTime, method) => {
        if (estimateTime.isAfter(clientTime)) return prevTime;
        if (estimateTime.isSame(clientTime, method)) return prevTime;
        prevTime[method](clientTime[method]());
        return prevTime;
      }, estimateTime);
    }
    return estimateTime;
  }
}
