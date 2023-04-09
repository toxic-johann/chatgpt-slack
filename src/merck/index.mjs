import { Client } from '@elastic/elasticsearch';
import fs from 'fs';
import { ELASTIC_SEARCH_PASSWORD } from './config.mjs';

// const client = new Client({
//   cloud: { id: '<cloud-id>' },
//   auth: { apiKey: 'base64EncodedKey' },
// });

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
  // Let's start by indexing some data
  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Ned Stark',
      quote: 'Winter is coming.',
    },
  });

  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Daenerys Targaryen',
      quote: 'I am the blood of the dragon.',
    },
  });

  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Tyrion Lannister',
      quote: 'A mind needs books like a sword needs a whetstone.',
    },
  });

  // here we are forcing an index refresh, otherwise we will not
  // get any result in the consequent search
  await client.indices.refresh({ index: 'game-of-thrones' });

  // Let's search!
  const result = await client.search({
    index: 'game-of-thrones',
    query: {
      match: { quote: 'winter' },
    },
  });

  console.log(result.hits.hits);
}

run().catch(console.log);
