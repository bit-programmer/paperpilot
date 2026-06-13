import pino from 'pino';
import env from '@/app/utils/env.client';

export const logger = pino({
  level: env.NEXT_PUBLIC_LOG_LEVEL,
  browser: {
    asObject: true,
  },
});