import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { CronJob } from 'cron';
import { sendMessageToChannel } from '../utils/web-client.mjs';

dayjs.extend(utc);
dayjs.extend(timezone);

async function main() {
  try {
    const response = await fetch('https://datacenter-web.eastmoney.com/api/data/v1/get?sortColumns=PUBLIC_START_DATE&sortTypes=-1&pageSize=10&pageNumber=1&reportName=RPT_BOND_CB_LIST&columns=ALL&source=WEB&client=WEB');
    const json = await response.json();
    const currentDate = dayjs().tz('asia/shanghai').format('YYYY-MM-DD');
    const result = json.result.data.filter(({ VALUE_DATE }) => VALUE_DATE.includes(currentDate));
    if (!result.length) {
      sendMessageToChannel('今日无可转债信息更新');
      return;
    }
    sendMessageToChannel(`今日可转债信息更新：${result.map(({ SECURITY_NAME_ABBR }) => SECURITY_NAME_ABBR).join('、')}`);
  } catch (error) {
    sendMessageToChannel('可转债信息更新失败');
  }
}

const job = new CronJob(
  '00 25 09 * * *',
  main,
  null,
  null,
  'Asia/Shanghai',
);
console.log('job start');
job.start();
