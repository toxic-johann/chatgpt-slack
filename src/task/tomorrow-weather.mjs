/* eslint-disable no-unused-vars */
import { CronJob } from 'cron';
import { sendMessageToChannel } from '../utils/web-client.mjs';
import { CONVERTIBLE_LISTENER, weatherListnerMap } from '../config.mjs';
import { forecast } from '../utils/weather-api.mjs';
import { chatCompletion } from '../utils/openai.mjs';

async function forecastWeatherToChannel([city, listeners]) {
  const response = await forecast(city, 2);
  const targetDay = response.forecast.forecastday[1];
  const {
    maxtemp_c,
    maxtemp_f,
    mintemp_c,
    mintemp_f,
    avgtemp_c,
    avgtemp_f,
    maxwind_mph,
    maxwind_kph,
    totalprecip_mm,
    totalprecip_in,
    totalsnow_cm,
    avgvis_km,
    avgvis_miles,
    avghumidity,
    daily_will_it_rain,
    daily_chance_of_rain,
    daily_will_it_snow,
    daily_chance_of_snow,
    condition,
    uv,
    air_quality,
  } = targetDay.day;
  const dataString = `
<@${listeners.join('>,<@')}>
${response.location.name} ${targetDay.date}
天气：${condition.text}
温度范围：[${[mintemp_c, maxtemp_c].toString()}]，平均温度：${avgtemp_c}
最大风速：${maxwind_kph}kph
总降水量：${totalprecip_mm}mm
总降雪量：${totalsnow_cm}cm
能见度：${avgvis_km}km
湿度：${avghumidity}
降雨概率：${daily_chance_of_rain}%
降雪概率：${daily_chance_of_snow}%
UV: ${uv}
  `;
  sendMessageToChannel(dataString);
  const result = await chatCompletion(`天气如何？${JSON.stringify({
    maxtemp_c,
    mintemp_c,
    avgtemp_c,
    maxwind_kph,
    totalprecip_mm,
    totalsnow_cm,
    avgvis_km,
    avghumidity,
    condition,
    uv,
    air_quality,
  }, {
    temperature: 0,
  })}
  `);
  sendMessageToChannel(result);
}

function main() {
  Object.entries(weatherListnerMap).forEach(forecastWeatherToChannel);
}

const job = new CronJob(
  '00 05 20 * * *',
  main,
  null,
  null,
  'Asia/Shanghai',
);
console.log('job start');
job.start();
