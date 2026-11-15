import pino, { DestinationStream, LoggerOptions } from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';

export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.password',
  '*.passwordHash',
  'password',
  'passwordHash',
];

const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

export const createLogger = (options?: LoggerOptions, destination?: DestinationStream) => {
  return pino(
    {
      level: isTest ? 'silent' : process.env.LOG_LEVEL || 'info',
      redact: {
        paths: REDACT_PATHS,
        censor: '[REDACTED]',
      },
      transport:
        !destination && isDev
          ? {
              target: 'pino-pretty',
              options: { colorize: true },
            }
          : undefined,
      ...options,
    },
    destination
  );
};

export const logger = createLogger();

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req as any).id || req.headers['x-request-id'] || randomUUID(),
});

export default logger;
