import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ValidationError, ErrorDetail } from '../shared/errors';

declare global {
  namespace Express {
    interface Request {
      valid?: {
        body?: any;
        query?: any;
        params?: any;
      };
    }
  }
}

export interface RequestValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = (schemas: RequestValidationSchema) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    req.valid = req.valid || {};
    const errors: ErrorDetail[] = [];
    const targets: (keyof RequestValidationSchema)[] = ['body', 'query', 'params'];

    for (const target of targets) {
      const schema = schemas[target];
      if (!schema) continue;

      try {
        const parsed = await schema.parseAsync(req[target]);
        req.valid[target] = parsed;
      } catch (err) {
        if (err instanceof ZodError) {
          for (const issue of err.issues) {
            errors.push({
              field: issue.path.length > 0 ? issue.path.join('.') : undefined,
              issue: issue.message,
            });
          }
        } else {
          return next(err);
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }

    next();
  };
};

export default validate;
