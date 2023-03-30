export function getThreadTs(message) {
  return message.thread_ts || message.ts;
}
