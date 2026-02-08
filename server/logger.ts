export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export const logger = {
  info: (_tag: string, _msg: string) => {},
  warn: (_tag: string, _msg: string) => {},
  error: (_tag: string, _msg: string) => {},
  debug: (_tag: string, _msg: string) => {
    if (process.env['DEBUG']) {
    }
  },
}

export default logger
