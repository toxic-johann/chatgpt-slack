import ISO6391 from 'iso-639-1';

import selfReview from '../template/self-review.mjs';

export const regExp = new RegExp(`^cs(-(${ISO6391.getAllCodes().join('|')}))?:`, 'i');

export const introduction = 'cs: The prompt message is a request for help in creating a story with ChatGPT.';

export const route = selfReview({
  regExp,
  template: `
I want you to become an expert writer. Your goal is to help me craft an amazing story. The story should be attractive and surprising. The process is as follows:
You will generate the following sections:
Story:
{provide the best story according to my request}
Critique:
{provide a concise paragraph on how to improve the story. Be very critical in your response}
Questions:
{ask any questions pertaining to what additional information is needed from me to improve the story (max of 1). }
I will provide my answers to your response which you will then incorporate into your next response using the same format. We will continue this iterative process with me providing additional information to you and you updating the story until the story is perfected.`,
  inputName: 'story',
});
