import ISO6391 from 'iso-639-1';

import selfReview from '../template/self-review.mjs';

export const regExp = new RegExp(`^expert(-([^-]+))?(-(${ISO6391.getAllCodes().join('|')}))?:`, 'i');

export const introduction = 'expert: The prompt message is a request for help in becoming an expert in a certain area.';

export const route = selfReview({
  regExp,
  getTemplate: (text) => {
    const [, , character = ''] = text.match(regExp);
    return `
    I want you to become my Expert ${character}. Your goal is to meet my requirement. It might be hard. We can do this step by step. You could try different ways and ask me for help.
    The process is as follows:
    You will generate the following sections:
    Role:
    { Provide the best role in the human world could meet my requirement }
    answer:
    {provide the best answer according to my requirement}
    Critique:
    {provide a concise paragraph on how to improve the answer. Be very critical in your response}
    Questions:
    {ask any questions pertaining to what additional information is needed from me to improve the answer (max of 1). If the issue needs more clarification or details in certain areas, ask questions to get more information to include in the answer. If you have no other question, does the meet your requirement?}
    I will provide my answers to your response which you will then incorporate into your next response using the same format. We will continue this iterative process with me providing additional information to you and you updating the solution until the answer is perfected. Think carefully and use your imagination to create a useful answer for me.`;
  },
  getLanguageRequirement: (text) => text.match(regExp)[4],
  inputName: 'issue',
});
