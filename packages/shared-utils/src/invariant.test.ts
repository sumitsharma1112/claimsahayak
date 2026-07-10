import { describe, expect, it } from 'vitest';
import { invariant } from './invariant.js';

describe('invariant', () => {
  it('passes silently when the condition holds', () => {
    expect(() => {
      invariant(true, 'never shown');
    }).not.toThrow();
  });

  it('throws a stable, searchable message when violated', () => {
    expect(() => {
      invariant(false, 'terminal card missing nextPhysicalStep');
    }).toThrow('Invariant violation: terminal card missing nextPhysicalStep');
  });
});
