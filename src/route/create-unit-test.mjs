import ISO6391 from 'iso-639-1';

import selfReview from '../template/self-review.mjs';

export const regExp = new RegExp(`^cut(-(${ISO6391.getAllCodes().join('|')}))?:`, 'i');

const route = selfReview({
  regExp,
  template: `
I want you to become an expert software engineer. Your goal is to help me craft unit tests for a certain function. The test case should be solid and have full code coverage. The process is as follows:
You will generate the following sections:
Story:
{provide unit tests according to my code}
Critique:
{provide a concise paragraph on how to improve the unit test. Be very critical in your response}
Questions:
{ask any questions pertaining to what additional information is needed from me to improve the unit test. If no, please ask me "provide me a suggestion" (max of 1). }
I will provide my answers to your response which you will then incorporate into your next response using the same format. We will continue this iterative process with me providing additional information to you and you updating the story until unit tests is perfected.`,
  inputName: 'code',
});

export default route;
