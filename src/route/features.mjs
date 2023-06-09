import * as stableDiffusion from './stable-diffusion.mjs';
import * as draw from './draw.mjs';
import * as translate from './translate.mjs';
import * as midjourney from './midjourney.mjs';
import * as createPrompt from './create-prompt.mjs';
import * as createStory from './create-story.mjs';
import * as createUnitTest from './create-unit-test.mjs';
import * as remind from './remind.mjs';
import * as artBook from './art-book.mjs';
import * as image from './image.mjs';
import * as debug from './debug.mjs';
import * as expert from './expert.mjs';
import * as langchain from './langchain.mjs';
import * as foreignExchange from './foreign-exchange.mjs';

export const featureRoutesMap = new Map();

featureRoutesMap.set(draw.regExp, draw);
featureRoutesMap.set(stableDiffusion.regExp, stableDiffusion);
featureRoutesMap.set(midjourney.regExp, midjourney);
featureRoutesMap.set(createPrompt.regExp, createPrompt);
featureRoutesMap.set(translate.regExp, translate);
featureRoutesMap.set(remind.regExp, remind);
featureRoutesMap.set(artBook.regExp, artBook);
featureRoutesMap.set(createStory.regExp, createStory);
featureRoutesMap.set(createUnitTest.regExp, createUnitTest);
featureRoutesMap.set(image.regExp, image);
featureRoutesMap.set(debug.regExp, debug);
featureRoutesMap.set(expert.regExp, expert);
featureRoutesMap.set(langchain.regExp, langchain);
featureRoutesMap.set(foreignExchange.regExp, foreignExchange);
