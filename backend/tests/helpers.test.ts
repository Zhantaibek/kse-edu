import { describe, expect, it } from 'vitest';
import { calcProgressPercent, slugify } from '../src/utils/helpers.js';

describe('helpers', () => {
  it('slugifies titles', () => {
    expect(slugify('Modern JavaScript Course')).toBe('modern-javascript-course');
  });

  it('calculates progress percent', () => {
    expect(calcProgressPercent(3, 9)).toBe(33.3);
    expect(calcProgressPercent(0, 10)).toBe(0);
    expect(calcProgressPercent(5, 0)).toBe(0);
    expect(calcProgressPercent(9, 9)).toBe(100);
  });
});
