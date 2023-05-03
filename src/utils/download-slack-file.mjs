import { SLACK_BOT_TOKEN } from '../config.mjs';

export async function downloadSlackFileAndConvertToBuffer(file) {
  const response = await fetch(file.url_private_download, {
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
    },
  });
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}
