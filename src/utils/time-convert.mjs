import chatgpt from './chatgpt.mjs';

export default async (message) => {
  const res = await chatgpt.sendMessage(`Can you help me to convert two types of time messages into specific formats? The first type of message is a duration and can have any format, as long as it includes a number and a time unit up to days (ex: “3 hours later”, “5 days from now”). We want to convert these durations into the format DD-hh:mm:ss, with days represented by two digits and hours, minutes, and seconds represented by two digits each. The second type of message is a specific time and can have any format (ex: “May 1st 8am”, “9/15/2023 3pm”, "10pm"). We want to convert these specific times into the format YYYY-MM-DD hh:mm:ss. If the user doesn’t provide the larger unit, keep the alphabet. If the user doesn’t provide the smaller unit, replace it with 0. Please note that we only accept units up to days and we ignore months and years. If the input message is invalid, return an error message starting with “Error:“.
  Final output:
  duration: [DD-hh:mm:ss]
  Time: [YYYY-MM-DD hh:mm:ss]
  The offical input is ${message}`);
  console.log(res.text);
  const time = res.text.match(/^Time: (.*)/i)[1];
  const duration = res.text.match(/^duration: (.*)/i)[1];
  return { time, duration };
};
