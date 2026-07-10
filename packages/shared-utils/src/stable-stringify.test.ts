import { describe, expect, it } from 'vitest';
import { stableStringify } from './stable-stringify.js';

describe('stableStringify', () => {
  it('produces identical output regardless of key insertion order', () => {
    const a = { b: 1, a: { d: [3, { z: 1, y: 2 }], c: 2 } };
    const b = { a: { c: 2, d: [3, { y: 2, z: 1 }] }, b: 1 };
    expect(stableStringify(a)).toBe(stableStringify(b));
  });

  it('preserves array order (arrays are ordered data, not sets)', () => {
    expect(stableStringify([2, 1])).toBe('[2,1]');
  });

  it('handles null and primitives', () => {
    expect(stableStringify(null)).toBe('null');
    expect(stableStringify('x')).toBe('"x"');
  });
});
