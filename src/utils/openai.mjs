import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from '../config.mjs';

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// https://platform.openai.com/docs/api-reference/chat/create
export async function chatCompletion(content, option = {}) {
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content }],
    ...option,
  });
  console.log(completion.data);
  return completion.data.choices[0].message.content;
}

export default openai;
