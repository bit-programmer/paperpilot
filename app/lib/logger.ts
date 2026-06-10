import pino from 'pino';
import env from '@/app/utils/env';

const isDevelopment = env.NODE_ENV === 'development';
const isServer = typeof window === 'undefined';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: isDevelopment && isServer
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        },
      }
    : undefined,
  browser: {
    asObject: true,
  },
});