import chatgpt from './chatgpt.mjs';

export default async (message, log) => {
  const res = await chatgpt.sendMessage(`Can you help me to convert two types of time messages into specific formats?
  The first type of message is a duration and can have any format, as long as it includes a number and a time unit up to days (ex: “3 hours later”, “5 days from now”). We want to convert these durations into the format DD-hh:mm:ss, with days represented by two digits and hours, minutes, and seconds represented by two digits each.
  The second type of message is part of a specific time and can have any format (ex: “May 1st 8am”, “9/15/2023 3pm”, “10pm”). You should convert it into the format yyyy-mm-dd hh:mm:ss. If any part of the string is missing, please replace it with * in the output.
  If the input message is invalid, return an error message starting with “Error:“.
  You should return the result only without any explanations.
  Final output:
    duration: [DD-hh:mm:ss]
    Time: [YYYY-MM-DD hh:mm:ss]
  My message is "${message}"`);
  if (typeof log === 'function') {
    log(res.text);
  }
  const time = res.text.match(/Time: (.*)/i)[1];
  const duration = res.text.match(/duration: (.*)/i)[1];
  return { time, duration };
};
