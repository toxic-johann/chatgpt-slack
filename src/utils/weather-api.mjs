import { WEATHER_API_KEY } from '../config.mjs';

export function forecast(city, days = 1) {
  return fetch(`http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=${days}&aqi=yes&alerts=no`).then((response) => response.json());
}
