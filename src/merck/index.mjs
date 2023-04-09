/* eslint-disable no-underscore-dangle */
import { Client } from '@elastic/elasticsearch';
import fs from 'fs';
import path from 'path';
import TurndownService from 'turndown';
import url from 'url';
import { ELASTIC_SEARCH_PASSWORD } from './config.mjs';

const turndownService = new TurndownService();
turndownService.remove(['script', 'img']);

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ca = fs.readFileSync('./temp/http_ca.crt');

const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: ELASTIC_SEARCH_PASSWORD,
  },
  tls: {
    ca,
    rejectUnauthorized: false,
  },
});

async function run() {
  const dir = path.resolve(__dirname, '../../../MSDZHConsumerMedicalTopics');
  const files = fs.readdirSync(dir).filter((p) => p.endsWith('}.html'));
  const response = await client.deleteByQuery({
    index: 'merk-zh',
    body: {
      query: {
        match_all: {},
      },
    },
  });
  console.log(response);
  // const promises = files.map(async (fileName, index) => {
  //   const filePath = path.resolve(dir, fileName);
  //   const html = fs.readFileSync(filePath, 'utf8');
  //   console.warn(filePath, index);
  //   const match = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  //   if (!match) return;
  //   const title = html.match(/<title\b[^>]*>(.*?)<\/title>/i)[1];
  //   const content = match[0];
  //   const markdown = turndownService.turndown(content);
  //   await client.index({
  //     index: 'merk-zh',
  //     document: {
  //       title,
  //       content: markdown,
  //     },
  //   });
  // });

  // await Promise.all(promises);

  // console.warn(title, markdown);

  // Let's start by indexing some data

  // await client.index({
  //   index: 'game-of-thrones',
  //   document: {
  //     character: 'Daenerys Targaryen',
  //     quote: 'I am the blood of the dragon.',
  //   },
  // });

  // await client.index({
  //   index: 'game-of-thrones',
  //   document: {
  //     character: 'Tyrion Lannister',
  //     quote: 'A mind needs books like a sword needs a whetstone.',
  //   },
  // });

  // here we are forcing an index refresh, otherwise we will not
  // get any result in the consequent search
  await client.indices.refresh({ index: 'merk-zh' });

  // Let's search!
  const result = await client.search({
    index: 'merk-zh',
    query: {
      match: { content: '急性肠系膜缺血' },
    },
  });

  console.log(result.hits.hits.map((hit) => hit._source.title));
}

run().catch(console.log);
