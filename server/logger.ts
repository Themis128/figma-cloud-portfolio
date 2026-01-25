export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatMessage(level: LogLevel, tag: string, msg: string) {
  return JSON.stringify({ ts: new Date().toISOString(), level, tag, msg });
}

export const logger = {
  info: (tag: string, msg: string) => {
    // Use console for now; can be swapped with pino/winston later
    // Keep output single-line JSON for easier ingestion by log collectors
    // eslint-disable-next-line no-console
    console.log(formatMessage('info', tag, msg));
  },
  warn: (tag: string, msg: string) => {
    // eslint-disable-next-line no-console
    console.warn(formatMessage('warn', tag, msg));
  },
  error: (tag: string, msg: string) => {
    // eslint-disable-next-line no-console
    console.error(formatMessage('error', tag, msg));
  },
  debug: (tag: string, msg: string) => {
    if (process.env.DEBUG) {
      // eslint-disable-next-line no-console
      console.debug(formatMessage('debug', tag, msg));
    }
  },
};

export default logger;
