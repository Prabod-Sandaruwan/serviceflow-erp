import { useForm, type UseFormProps, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { ApiError } from './ApiError';

export function useZodForm<T extends FieldValues>(
  schema: z.ZodType<T, any, any>,
  options?: Omit<UseFormProps<T>, 'resolver'>,
) {
  return useForm<T>({
    resolver: zodResolver(schema as any),
    ...options,
  });
}

export function applyApiErrors<T extends FieldValues = FieldValues>(
  form: Pick<UseFormReturn<T>, 'setError'> | { setError: (field: any, error: any) => void },
  error: unknown,
): string {
  if (error instanceof Error && (error.name === 'ApiError' || error instanceof ApiError)) {
    const apiErr = error as ApiError;
    if (apiErr.status === 422 && Array.isArray(apiErr.details)) {
      for (const item of apiErr.details as any[]) {
        if (item && item.field) {
          form.setError(item.field, {
            type: 'server',
            message: item.issue || item.message || 'Invalid value',
          });
        }
      }
      return apiErr.message || 'Please correct the highlighted fields.';
    }
    return apiErr.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
