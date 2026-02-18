export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export const logger = {
  info: (tag: string, msg: string) => console.log(`[INFO][${tag}]`, msg),
  warn: (tag: string, msg: string) => console.warn(`[WARN][${tag}]`, msg),
  error: (tag: string, msg: string) => console.error(`[ERROR][${tag}]`, msg),
  debug: (tag: string, msg: string) => {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG][${tag}]`, msg)
    }
  },
}

export default logger
