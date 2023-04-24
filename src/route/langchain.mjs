// // eslint-disable-next-line import/order
// import '../utils/fetch-polyfill.mjs';

/* eslint-disable import/no-extraneous-dependencies */
import { OpenAI } from 'langchain/llms/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { DynamicTool } from 'langchain/tools';
import { OPENAI_API_KEY } from '../config.mjs';
import { getThreadTs } from '../selectors/message.mjs';
import { route as remindRoute } from './remind.mjs';

const model = new OpenAI({
  openAIApiKey: OPENAI_API_KEY,
  temperature: 0,
  verbose: true,
  cache: true,
  // callbacks: [
  //   {
  //     handleLLMStart: async (llm, prompts) => {
  //       console.log(JSON.stringify(prompts, null, 2));
  //     },
  //     handleLLMEnd: async (output) => {
  //       console.log(JSON.stringify(output, null, 2));
  //     },
  //     handleLLMError: async (err) => {
  //       console.error(err);
  //     },
  //   },
  // ],
});
function getSlackInputFromRunManager(runManager) {
  for (let i = 0; i < runManager.inheritableHandlers.length; i++) {
    const handler = runManager.inheritableHandlers[i];
    if (typeof handler.getSlackInput === 'function') {
      console.warn(handler);
      return handler.getSlackInput();
    }
  }
  return undefined;
}
const tools = [
  // new DynamicTool({
  //   name: 'weather',
  //   description:
  //     'call this when the user want to know the weather of somewhere, the input should be a string contains the time and english name of the position.',
  //   func: (input, runManager) => {
  //     console.warn(input);
  //     return 'done';
  //   },
  // }),
  new DynamicTool({
    name: 'reminder',
    description:
      'call this when the user want to setup a reminder, the input should be the original message',
    func: async (text, runManager) => {
      const slackInput = getSlackInputFromRunManager(runManager);
      const thread_ts = getThreadTs(slackInput.message);
      slackInput.say({ text: `remind action: ${text}`, thread_ts });
      await remindRoute(slackInput);
      return 'Done';
    },
  }),
];

// eslint-disable-next-line no-underscore-dangle
let _executor;

const getExecutor = async () => {
  if (typeof _executor !== 'undefined') return _executor;
  _executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'zero-shot-react-description',
    maxIterations: 1,
    verbose: true,
  });
  return _executor;
};

export const regExp = /^lc:/i;

export const introduction = 'lc: use lang chain for help.';

export const route = async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const executor = await getExecutor();
  const result = await executor.call({ input: message.text.replace(regExp, '') }, [{
    getSlackInput() {
      return { message, say };
    },
  }]);
  await say({ text: result.output, thread_ts });
};

// export const run = async (input) => {
//   const executor = await getExecutor();

//   console.log('Loaded agent.');

//   // const input = 'Remind me to me to send the mail at 8am tomorrow';

//   console.log(`Executing with input "${input}"...`);

//   const result = await executor.call({ input }, [{
//     getMessage: () => {},
//   }]);

//   console.log(`Got output ${result.output}`);
// };

// run('秦皇岛 3.14 天气如何？');
// run('Remind me to me to send the mail at 7am tomorrow');
