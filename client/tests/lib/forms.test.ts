import { describe, it, expect, vi } from 'vitest';
import { applyApiErrors } from '../../src/lib/forms';
import { ApiError } from '../../src/lib/ApiError';

describe('applyApiErrors helper', () => {
  it('applies 422 validation details to form fields', () => {
    const formMock = {
      setError: vi.fn(),
    };

    const apiError = new ApiError(
      422,
      'VALIDATION_FAILED',
      'Validation error',
      [{ field: 'email', issue: 'Invalid email' }],
    );

    const message = applyApiErrors(formMock, apiError);

    expect(formMock.setError).toHaveBeenCalledTimes(1);
    expect(formMock.setError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'Invalid email',
    });
    expect(message).toBe('Validation error');
  });

  it('returns generic message for non-422 errors without setting fields', () => {
    const formMock = {
      setError: vi.fn(),
    };

    const apiError = new ApiError(
      500,
      'INTERNAL_SERVER_ERROR',
      'A server error occurred.',
    );

    const message = applyApiErrors(formMock, apiError);

    expect(formMock.setError).not.toHaveBeenCalled();
    expect(message).toBe('A server error occurred.');
  });
});
