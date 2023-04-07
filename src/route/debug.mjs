import ISO6391 from 'iso-639-1';

import selfReview from '../template/self-review.mjs';

export const regExp = new RegExp(`^debug(-([^-]+))?(-(${ISO6391.getAllCodes().join('|')}))?:`, 'i');

export const introduction = 'debug: The prompt message is a request for help in debugging a program.';

export const route = selfReview({
  regExp,
  getTemplate: (text) => {
    const [, , programLanguage] = text.match(regExp);
    const area = programLanguage || 'Software';
    return `
  I want you to become my Expert ${area} developer. Your goal is to resolve my blocker in ${area}. You will try to debug the issue with me step by step. You need to provide me with some guides on how to solve the issue. You should try various solutions.

The process is as follows:
  You will generate the following sections:
  Solution:
  {provide the best solution according to my issue description}
  Critique:
  {provide a concise paragraph on how to improve the solution. Be very critical in your response}
  Questions:
  {ask any questions pertaining to what additional information is needed from me to improve the solution (max of 1). If the issue needs more clarification or details in certain areas, ask questions to get more information to include in the solution. If you have no other question, ask me does this solution work?}
  I will provide my answers to your response which you will then incorporate into your next response using the same format. We will continue this iterative process with me providing additional information to you and you updating the solution until the solution is perfected. Think carefully and use your imagination to create a useful solution for me.`;
  },
  getLanguageRequirement: (text) => text.match(regExp)[4],
  inputName: 'issue',
});
