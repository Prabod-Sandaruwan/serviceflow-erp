export interface ErrorDetail {
  field?: string;
  issue: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetail[];

  constructor(
    statusCodeOrMessage: number | string,
    code: string,
    messageOrStatus: string | number,
    details?: ErrorDetail[]
  ) {
    let statusCode: number;
    let message: string;
    if (typeof statusCodeOrMessage === 'number') {
      statusCode = statusCodeOrMessage;
      message = typeof messageOrStatus === 'string' ? messageOrStatus : '';
    } else {
      message = statusCodeOrMessage;
      statusCode = typeof messageOrStatus === 'number' ? messageOrStatus : 500;
    }
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST', details?: ErrorDetail[]) {
    super(400, code, message, details);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthenticated', code = 'UNAUTHENTICATED', details?: ErrorDetail[]) {
    super(401, code, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN', details?: ErrorDetail[]) {
    super(403, code, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND', details?: ErrorDetail[]) {
    super(404, code, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code = 'CONFLICT', details?: ErrorDetail[]) {
    super(409, code, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(
    messageOrDetails: string | ErrorDetail[] = 'Validation failed',
    details?: ErrorDetail[],
    code = 'VALIDATION_ERROR'
  ) {
    if (Array.isArray(messageOrDetails)) {
      super(422, code, 'Validation failed', messageOrDetails);
    } else {
      super(422, code, messageOrDetails, details);
    }
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = 'Too many requests, please try again later',
    code = 'RATE_LIMITED',
    details?: ErrorDetail[]
  ) {
    super(429, code, message, details);
  }
}
