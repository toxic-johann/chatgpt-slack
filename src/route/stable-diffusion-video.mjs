// import Replicate from 'replicate';

// import { getThreadTs } from '../selectors/message.mjs';
// import { REPLICATE_API_TOKEN } from '../config.mjs';

// const replicate = new Replicate({
//   auth: REPLICATE_API_TOKEN,
// });

// console.warn('get here??');

// // const output = await replicate.run(
// //   'nateraw/stable-diffusion-videos:2d87f0f8bc282042002f8d24458bbf588eee5e8d8fffb6fbb10ed48d1dac409e',
// //   {
// //     input: {
// //       prompts: 'a cat | a dog | a horse',
// //     },
// //   },
// // );

// async function main() {
//   const model = 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf';
//   const input = { prompt: 'an astronaut riding a horse on mars, hd, dramatic lighting, detailed' };
//   // const output = await replicate.run(model, { input });

//   const output = await replicate.run(
//     "nateraw/stable-diffusion-videos:2d87f0f8bc282042002f8d24458bbf588eee5e8d8fffb6fbb10ed48d1dac409e",
//     {
//       input: {
//         prompts: "a cat | a dog | a horse"
//       }
//     }
//   );

//   console.log(output);
//   // const model = 'nateraw/stable-diffusion-videos:2d87f0f8bc282042002f8d24458bbf588eee5e8d8fffb6fbb10ed48d1dac409e';
//   // const input = { prompt: 'a cat | a dog | a horse' };

//   // const prediction = await replicate.run(model, input);

//   // console.log(prediction.output);
// }

// main();

// // export default async ({ message, say }) => {
// //   const thread_ts = getThreadTs(message);
// //   const command = message.text.replace(/^SDV:/i, '');
// //   say({ text: `Your command is "${command}"`, thread_ts });
// //   const output = await replicate.run(
// //     'nateraw/stable-diffusion-videos:2d87f0f8bc282042002f8d24458bbf588eee5e8d8fffb6fbb10ed48d1dac409e',
// //     {
// //       input: {
// //         prompts: 'a cat | a dog | a horse',
// //       },
// //     },
// //   );
// //   console.log(output);
// //   // say() sends a message to the channel where the event was triggered
// //   await say({ text: prediction.output[0], thread_ts });
// // };
