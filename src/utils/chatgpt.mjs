import { ChatGPTAPI } from 'chatgpt';
import { OPENAI_API_KEY } from '../config.mjs';

const chatgpt = new ChatGPTAPI({
  apiKey: OPENAI_API_KEY,
});

export default chatgpt;
