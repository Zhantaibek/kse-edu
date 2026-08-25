import { describe, expect, it } from 'vitest';
import { AppError, ValidationError } from '../src/utils/errors.js';

describe('AppError', () => {
  it('creates typed application errors', () => {
    const err = new ValidationError('bad', { field: 'email' });
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });
});
